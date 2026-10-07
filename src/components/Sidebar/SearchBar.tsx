'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showOnlyUnread: boolean;
  onToggleUnread: () => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  showOnlyUnread,
  onToggleUnread,
}: SearchBarProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100">
      <div className="relative flex-1 flex items-center">
        <Search
          size={18}
          className="absolute left-3 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar ou começar uma nova conversa"
          className="w-full h-9 pl-9 pr-8 text-sm rounded-lg bg-[#f0f2f5] text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 transition-all"
          style={{
            borderColor: searchTerm ? theme.primary : 'transparent',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <button
        onClick={onToggleUnread}
        title={showOnlyUnread ? 'Mostrar todas as conversas' : 'Filtrar não lidas'}
        className={`p-2 rounded-lg transition-colors ${
          showOnlyUnread
            ? 'text-white shadow-xs'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        style={showOnlyUnread ? { backgroundColor: theme.primary } : {}}
      >
        <Filter size={17} />
      </button>
    </div>
  );
}
