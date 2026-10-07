'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { Colaborador } from '../../types';
import { formatPhoneNumber } from '../../utils/formatters';
import { X, Search, Check } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (conversaId: number) => void;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onSelectChat,
}: NewChatModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Grupo
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const carregarColaboradores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/empresa/colaboradores');
      const list: Colaborador[] = res.data?.data || [];
      setColaboradores(list.filter((c) => c.id !== user?.id));
    } catch (err) {
      console.error('Erro ao listar colaboradores para nova conversa:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) {
      carregarColaboradores();
    }
  }, [isOpen, carregarColaboradores]);

  const handleClose = () => {
    setSearchTerm('');
    setGroupName('');
    setGroupDescription('');
    setSelectedMemberIds([]);
    setMode('individual');
    onClose();
  };

  const handleStartPrivateChat = async (colaboradorId: number) => {
    try {
      const res = await api.post('/conversas/privada', {
        destinatario_id: colaboradorId,
      });
      const conversaId = res.data?.data?.conversa_id;
      if (conversaId) {
        onSelectChat(conversaId);
        handleClose();
      }
    } catch (err: unknown) {
      const errorData = err as { response?: { data?: { messages?: { error?: string } } } };
      alert(errorData.response?.data?.messages?.error || 'Erro ao iniciar conversa privada.');
    }
  };

  const handleToggleMember = (id: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Informe o nome do grupo.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      alert('Selecione pelo menos um membro para o grupo.');
      return;
    }

    try {
      setCreatingGroup(true);
      const res = await api.post('/conversas/grupo', {
        nome: groupName.trim(),
        descricao: groupDescription.trim() || undefined,
        participantes: selectedMemberIds,
      });

      const conversaId = res.data?.data?.id || res.data?.data?.conversa_id;
      if (conversaId) {
        onSelectChat(conversaId);
        handleClose();
      }
    } catch (err: unknown) {
      const errorData = err as { response?: { data?: { messages?: { error?: string } } } };
      alert(errorData.response?.data?.messages?.error || 'Erro ao criar grupo corporativo.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const filteredColaboradores = colaboradores.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 text-white shrink-0"
          style={{ backgroundColor: theme.primary }}
        >
          <h2 className="text-base font-bold">
            {mode === 'individual' ? 'Nova Conversa' : 'Novo Grupo Corporativo'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-black/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas Modo */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 shrink-0">
          <button
            onClick={() => setMode('individual')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center transition-colors ${
              mode === 'individual'
                ? 'border-b-2 text-gray-900 bg-white'
                : 'border-b-transparent text-gray-500 hover:text-gray-800'
            }`}
            style={mode === 'individual' ? { borderColor: theme.primary, color: theme.primary } : {}}
          >
            Conversa Direta
          </button>
          <button
            onClick={() => setMode('group')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center transition-colors ${
              mode === 'group'
                ? 'border-b-2 text-gray-900 bg-white'
                : 'border-b-transparent text-gray-500 hover:text-gray-800'
            }`}
            style={mode === 'group' ? { borderColor: theme.primary, color: theme.primary } : {}}
          >
            Criar Grupo
          </button>
        </div>

        {/* Conteúdo */}
        {mode === 'individual' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Campo de Busca */}
            <div className="p-3 border-b border-gray-100 bg-white">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar colaborador da empresa..."
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Lista de Colaboradores */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
              {loading ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  Carregando colaboradores...
                </div>
              ) : filteredColaboradores.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  Nenhum colaborador encontrado.
                </div>
              ) : (
                filteredColaboradores.map((colab) => (
                  <div
                    key={colab.id}
                    onClick={() => handleStartPrivateChat(colab.id)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100/70 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {colab.avatar_url ? (
                        <img
                          src={colab.avatar_url}
                          alt={colab.name}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold text-xs shrink-0"
                          style={{ backgroundColor: theme.primary }}
                        >
                          {colab.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-gray-900 block truncate">
                          {colab.name}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono block">
                          {formatPhoneNumber(colab.phone)}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                      {colab.cargo}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Formulário de Criação de Grupo */
          <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            <div className="space-y-3 shrink-0">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Equipe de TI, Diretoria, Logística..."
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Finalidade do grupo corporativo..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>

              <div className="text-xs font-semibold text-gray-700">
                Selecione os Membros ({selectedMemberIds.length} selecionados):
              </div>
            </div>

            {/* Lista com Seleção Múltipla */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 p-1">
              {colaboradores.map((colab) => {
                const isSelected = selectedMemberIds.includes(colab.id);
                return (
                  <div
                    key={colab.id}
                    onClick={() => handleToggleMember(colab.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>

                      <span className="text-xs font-medium text-gray-900">
                        {colab.name}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 capitalize">
                      {colab.cargo}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={creatingGroup || !groupName.trim() || selectedMemberIds.length === 0}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              {creatingGroup ? 'Criando Grupo...' : 'Criar Grupo Corporativo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
