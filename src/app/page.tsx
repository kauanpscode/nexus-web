'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { Conversa, Mensagem } from '../types';

import SidebarHeader from '../components/Sidebar/SidebarHeader';
import SearchBar from '../components/Sidebar/SearchBar';
import ConversationList from '../components/Sidebar/ConversationList';

import EmptyChatState from '../components/Chat/EmptyChatState';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageArea from '../components/Chat/MessageArea';
import ChatInput from '../components/Chat/ChatInput';

import AdminSettingsModal from '../components/Modals/AdminSettingsModal';
import NewChatModal from '../components/Modals/NewChatModal';
import ProfileModal from '../components/Modals/ProfileModal';
import CompanySwitchModal from '../components/Modals/CompanySwitchModal';

export default function Home() {
  const router = useRouter();
  const { authenticated, loading: authLoading, empresa, user } = useAuth();
  const { theme } = useTheme();

  // Estados de Conversas
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loadingConversas, setLoadingConversas] = useState(true);
  const [selectedConversa, setSelectedConversa] = useState<Conversa | null>(null);

  // Estados de Mensagens do Chat Ativo
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [sendingMensagem, setSendingMensagem] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);

  // Filtros de Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Modais
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [companySwitchModalOpen, setCompanySwitchModalOpen] = useState(false);

  // Refs para controle de polling
  const activeChatPollingRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Guarda de Autenticação
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push('/login');
    }
  }, [authenticated, authLoading, router]);

  // 2. Heartbeat de Presença (Ping a cada 30 segundos)
  useEffect(() => {
    if (!authenticated) return;

    // Ping inicial
    api.post('/presenca/ping').catch(() => {});

    const pingInterval = setInterval(() => {
      api.post('/presenca/ping').catch(() => {});
    }, 30000);

    const handleBeforeUnload = () => {
      // Notifica saída ao fechar aba
      if (navigator.sendBeacon) {
        const token = localStorage.getItem('tchat_token');
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/presenca/offline`;
        navigator.sendBeacon(url);
      } else {
        api.post('/presenca/offline').catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authenticated]);

  // 3. Carregamento e Polling da Lista de Conversas
  const carregarConversas = useCallback(async (silencioso = false) => {
    if (!authenticated) return;
    try {
      if (!silencioso) setLoadingConversas(true);
      const res = await api.get('/conversas');
      const data: Conversa[] = res.data?.data || [];
      setConversas(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      if (!silencioso) setLoadingConversas(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      carregarConversas(false);

      // Polling a cada 6 segundos na lista lateral
      const interval = setInterval(() => {
        carregarConversas(true);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [authenticated, carregarConversas, empresa?.id]);

  // 4. Carregamento de Mensagens da Conversa Ativa
  const carregarMensagens = useCallback(async (conversaId: number, silencioso = false) => {
    try {
      if (!silencioso) setLoadingMensagens(true);
      const res = await api.get(`/conversas/${conversaId}/mensagens`, {
        params: { limite: 50 },
      });
      const data: Mensagem[] = res.data?.data || [];
      setMensagens(data);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    } finally {
      if (!silencioso) setLoadingMensagens(false);
    }
  }, []);

  // 5. Verificação de Presença do Destinatário
  const verificarPresencaDestinatario = useCallback(async (destinatarioId?: number) => {
    if (!destinatarioId) {
      setIsRecipientOnline(false);
      return;
    }
    try {
      const res = await api.get(`/presenca/${destinatarioId}`);
      setIsRecipientOnline(res.data?.data?.status === 'online');
    } catch {
      setIsRecipientOnline(false);
    }
  }, []);

  // 6. Efeito ao Selecionar uma Conversa
  useEffect(() => {
    if (!selectedConversa) {
      setMensagens([]);
      if (activeChatPollingRef.current) clearInterval(activeChatPollingRef.current);
      return;
    }

    const conversaId = selectedConversa.id;
    const destId = selectedConversa.destinatario?.id;
    const isGroup = selectedConversa.tipo === 'G';

    // Marca conversa como lida
    api.post(`/conversas/${conversaId}/ler`).catch(() => {});

    // Atualiza badge de não lidas localmente
    setConversas((prev) =>
      prev.map((c) => (c.id === conversaId ? { ...c, nao_lidas: 0 } : c))
    );

    // Carrega mensagens e presença
    carregarMensagens(conversaId, false);
    if (!isGroup && destId) {
      verificarPresencaDestinatario(destId);
    }

    // Polling rápido (2.5s) para troca dinâmica de mensagens
    if (activeChatPollingRef.current) clearInterval(activeChatPollingRef.current);

    activeChatPollingRef.current = setInterval(() => {
      carregarMensagens(conversaId, true);
      if (!isGroup && destId) {
        verificarPresencaDestinatario(destId);
      }
    }, 2500);

    return () => {
      if (activeChatPollingRef.current) clearInterval(activeChatPollingRef.current);
    };
  }, [selectedConversa?.id, carregarMensagens, verificarPresencaDestinatario]);

  // 7. Envio de Mensagem
  const handleSendMessage = async (text: string, file: File | null) => {
    if (!selectedConversa) return;

    try {
      setSendingMensagem(true);

      if (file) {
        const formData = new FormData();
        formData.append('id_conversa', String(selectedConversa.id));
        if (text) formData.append('mensagem', text);
        formData.append('anexo', file);

        await api.post('/mensagens', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/mensagens', {
          id_conversa: selectedConversa.id,
          mensagem: text,
        });
      }

      // Recarrega imediatamente as mensagens e lista lateral
      await carregarMensagens(selectedConversa.id, true);
      carregarConversas(true);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      alert('Não foi possível enviar a mensagem.');
    } finally {
      setSendingMensagem(false);
    }
  };

  // 8. Seleção de Conversa vinda do Modal "Nova Conversa"
  const handleSelectChatById = async (conversaId: number) => {
    await carregarConversas(true);
    const found = conversas.find((c) => c.id === conversaId);
    if (found) {
      setSelectedConversa(found);
    } else {
      // Se acabou de ser criada, busca novamente e seleciona
      try {
        const res = await api.get('/conversas');
        const list: Conversa[] = res.data?.data || [];
        setConversas(list);
        const newlyCreated = list.find((c) => c.id === conversaId);
        if (newlyCreated) setSelectedConversa(newlyCreated);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f0f2f5] gap-3">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: `${theme.primary} transparent transparent transparent` }}
        />
        <span className="text-xs font-semibold text-gray-500">
          Carregando ambiente corporativo...
        </span>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f2f5] select-none">
      {/* ===================== SIDEBAR (COLUNA ESQUERDA) ===================== */}
      <aside className="w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-white border-r border-gray-200 shrink-0">
        {/* Cabeçalho da Sidebar */}
        <SidebarHeader
          onOpenNewChat={() => setNewChatModalOpen(true)}
          onOpenAdminSettings={() => setAdminModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenCompanySwitch={() => setCompanySwitchModalOpen(true)}
        />

        {/* Barra de Pesquisa */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showOnlyUnread={showOnlyUnread}
          onToggleUnread={() => setShowOnlyUnread((prev) => !prev)}
        />

        {/* Lista de Conversas */}
        <ConversationList
          conversas={conversas}
          selectedId={selectedConversa?.id || null}
          loading={loadingConversas}
          searchTerm={searchTerm}
          showOnlyUnread={showOnlyUnread}
          onSelectConversa={(conversa) => setSelectedConversa(conversa)}
          onOpenNewChat={() => setNewChatModalOpen(true)}
        />
      </aside>

      {/* ===================== ÁREA DE CHAT (COLUNA DIREITA) ===================== */}
      <main className="hidden md:flex flex-1 h-full flex-col bg-[#efeae2] relative overflow-hidden">
        {selectedConversa ? (
          <>
            {/* Header do Chat Ativo */}
            <ChatHeader
              conversa={selectedConversa}
              isOnline={isRecipientOnline}
              onBack={() => setSelectedConversa(null)}
            />

            {/* Mensagens com scroll */}
            <MessageArea
              mensagens={mensagens}
              loading={loadingMensagens}
              isGroup={selectedConversa.tipo === 'G'}
            />

            {/* Input e Envio de Mensagens */}
            <ChatInput
              onSendMessage={handleSendMessage}
              sending={sendingMensagem}
            />
          </>
        ) : (
          /* Estado Vazio estilo WhatsApp Web */
          <EmptyChatState />
        )}
      </main>

      {/* ===================== MODAIS ===================== */}
      {/* 1. Modal Administrativo (Personalização Visual, Colaboradores, Convites) */}
      <AdminSettingsModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* 2. Modal Nova Conversa / Criar Grupo */}
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onSelectChat={handleSelectChatById}
      />

      {/* 3. Modal Perfil do Usuário */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* 4. Modal Alternar Empresa */}
      <CompanySwitchModal
        isOpen={companySwitchModalOpen}
        onClose={() => setCompanySwitchModalOpen(false)}
        onSwitched={() => {
          setSelectedConversa(null);
          carregarConversas(false);
        }}
      />
    </div>
  );
}
