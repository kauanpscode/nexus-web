'use client';

import React from 'react';
import { Conversa } from '../../types';
import ConversationItem from './ConversationItem';
import { MessageSquareDashed, MessageSquarePlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ConversationListProps {
  conversas: Conversa[];
  selectedId: number | null;
  loading: boolean;
  searchTerm: string;
  showOnlyUnread: boolean;
  onSelectConversa: (conversa: Conversa) => void;
  onOpenNewChat: () => void;
}

export default function ConversationList({
  conversas,
  selectedId,
  loading,
  searchTerm,
  showOnlyUnread,
  onSelectConversa,
  onOpenNewChat,
}: ConversationListProps) {
  const { theme } = useTheme();

  // Filtragem
  const filteredConversas = conversas.filter((c) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ultima_mensagem?.texto?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUnread = !showOnlyUnread || c.nao_lidas > 0;

    return matchesSearch && matchesUnread;
  });

  if (loading && conversas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
        <div
          className="h-8 w-8 animate-spin rounded-full border-3 border-t-transparent"
          style={{ borderColor: `${theme.primary} transparent transparent transparent` }}
        />
        <p className="mt-4 text-xs font-medium text-gray-500">Carregando conversas...</p>
      </div>
    );
  }

  if (filteredConversas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
          <MessageSquareDashed size={30} />
        </div>
        <h4 className="text-sm font-semibold text-gray-700">
          {searchTerm || showOnlyUnread
            ? 'Nenhuma conversa encontrada'
            : 'Nenhuma conversa ativa'}
        </h4>
        <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
          {searchTerm || showOnlyUnread
            ? 'Tente ajustar os filtros ou pesquisar por outro termo.'
            : `Inicie uma conversa direta com qualquer colaborador da ${theme.empresaNome}.`}
        </p>

        {!searchTerm && !showOnlyUnread && (
          <button
            onClick={onOpenNewChat}
            className="mt-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white shadow-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.primary }}
          >
            <MessageSquarePlus size={15} />
            Nova Conversa
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-100">
      {filteredConversas.map((conversa) => (
        <ConversationItem
          key={conversa.id}
          conversa={conversa}
          isSelected={conversa.id === selectedId}
          onSelect={() => onSelectConversa(conversa)}
        />
      ))}
    </div>
  );
}
