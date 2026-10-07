'use client';

import React from 'react';
import { Conversa } from '../../types';
import { formatTime } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import { Users, Image as ImageIcon, FileText } from 'lucide-react';

interface ConversationItemProps {
  conversa: Conversa;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ConversationItem({
  conversa,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const { theme } = useTheme();

  const isGroup = conversa.tipo === 'G';
  const avatarUrl = conversa.imagem || conversa.destinatario?.avatar;
  const displayName = conversa.nome;

  const renderLastMessage = () => {
    if (!conversa.ultima_mensagem) {
      return (
        <span className="italic text-gray-400 text-xs">
          Nenhuma mensagem ainda
        </span>
      );
    }

    const { tipo, texto } = conversa.ultima_mensagem;

    if (tipo === 'imagem') {
      return (
        <span className="flex items-center gap-1 text-gray-500">
          <ImageIcon size={14} className="text-gray-400" />
          <span>Foto</span>
        </span>
      );
    }

    if (tipo === 'arquivo' || tipo === 'documento') {
      return (
        <span className="flex items-center gap-1 text-gray-500">
          <FileText size={14} className="text-gray-400" />
          <span>Arquivo</span>
        </span>
      );
    }

    return (
      <span className="truncate">
        {texto || 'Mensagem'}
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-gray-100 select-none ${
        isSelected
          ? 'bg-[#ebebeb]'
          : 'hover:bg-[#f5f6f6] bg-white'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : isGroup ? (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: theme.primary }}
          >
            <Users size={22} />
          </div>
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-white font-medium text-base"
            style={{ backgroundColor: theme.primary }}
          >
            {displayName?.slice(0, 2).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Conteúdo da Conversa */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-gray-900 truncate">
            {displayName}
          </span>
          <span
            className={`text-xs ${
              conversa.nao_lidas > 0 ? 'font-semibold' : 'text-gray-400'
            }`}
            style={conversa.nao_lidas > 0 ? { color: theme.primary } : {}}
          >
            {formatTime(conversa.ultima_atividade_em)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 truncate max-w-[210px]">
            {renderLastMessage()}
          </div>

          {/* Badge de não lidas */}
          {conversa.nao_lidas > 0 && (
            <span
              className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              {conversa.nao_lidas > 99 ? '99+' : conversa.nao_lidas}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
