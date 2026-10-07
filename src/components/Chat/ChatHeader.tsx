'use client';

import React from 'react';
import { Conversa } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Users, MoreVertical, Search, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  conversa: Conversa;
  isOnline: boolean;
  onBack?: () => void;
}

export default function ChatHeader({
  conversa,
  isOnline,
  onBack,
}: ChatHeaderProps) {
  const { theme } = useTheme();

  const isGroup = conversa.tipo === 'G';
  const avatarUrl = conversa.imagem || conversa.destinatario?.avatar;
  const displayName = conversa.nome;

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-[#f0f2f5] px-4 shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : isGroup ? (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <Users size={20} />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-medium text-sm"
              style={{ backgroundColor: theme.primary }}
            >
              {displayName?.slice(0, 2).toUpperCase() || 'U'}
            </div>
          )}

          {!isGroup && isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Informações da conversa */}
        <div className="flex flex-col text-left">
          <h3 className="font-semibold text-sm text-gray-900 leading-tight truncate max-w-[280px]">
            {displayName}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            {isGroup ? (
              <span>Grupo Corporativo</span>
            ) : isOnline ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                online
              </span>
            ) : (
              <span>offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 text-gray-600">
        <button
          title="Pesquisar mensagens"
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Search size={19} />
        </button>
        <button
          title="Mais opções"
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <MoreVertical size={19} />
        </button>
      </div>
    </header>
  );
}
