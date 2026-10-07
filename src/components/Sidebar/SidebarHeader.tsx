'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MessageSquarePlus,
  Sliders,
  Building2,
  User as UserIcon,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface SidebarHeaderProps {
  onOpenNewChat: () => void;
  onOpenAdminSettings: () => void;
  onOpenProfile: () => void;
  onOpenCompanySwitch: () => void;
}

export default function SidebarHeader({
  onOpenNewChat,
  onOpenAdminSettings,
  onOpenProfile,
  onOpenCompanySwitch,
}: SidebarHeaderProps) {
  const { user, empresasDisponiveis, logout } = useAuth();
  const { theme } = useTheme();

  const isAdmin = user?.cargo === 'admin';

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-[#f0f2f5] px-4">
      {/* Informações do Usuário e da Empresa */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenProfile}
          title="Ver perfil"
          className="relative group focus:outline-none"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold text-sm shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
        </button>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-gray-800 leading-tight max-w-[130px] truncate">
              {user?.name}
            </span>
            {isAdmin ? (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-0.5"
                style={{ backgroundColor: theme.primary }}
                title="Acesso de Administrador"
              >
                <ShieldAlert size={10} />
                ADMIN
              </span>
            ) : (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                Colaborador
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            {theme.empresaLogo ? (
              <img
                src={theme.empresaLogo}
                alt={theme.empresaNome}
                className="h-3.5 w-3.5 rounded object-cover"
              />
            ) : (
              <Building2 size={12} className="text-gray-500" />
            )}
            <span className="text-xs text-gray-500 max-w-[140px] truncate" title={theme.empresaNome}>
              {theme.empresaNome}
            </span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-1 text-gray-600">
        {/* Painel do Administrador (Branding e Gestão) - Exclusivo para Admins */}
        {isAdmin && (
          <button
            onClick={onOpenAdminSettings}
            title="Configurações da Empresa (Visual, Colaboradores e Convites)"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors relative"
            style={{ color: theme.primary }}
          >
            <Sliders size={20} />
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
          </button>
        )}

        {/* Alternar Empresa se tiver mais de uma */}
        {empresasDisponiveis.length > 1 && (
          <button
            onClick={onOpenCompanySwitch}
            title="Alternar Empresa"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
          >
            <Building2 size={20} />
          </button>
        )}

        {/* Iniciar Nova Conversa ou Grupo */}
        <button
          onClick={onOpenNewChat}
          title="Nova Conversa / Grupo"
          className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
        >
          <MessageSquarePlus size={20} />
        </button>

        {/* Perfil */}
        <button
          onClick={onOpenProfile}
          title="Meu Perfil"
          className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
        >
          <UserIcon size={20} />
        </button>

        {/* Sair */}
        <button
          onClick={logout}
          title="Sair do Sistema"
          className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors text-gray-600"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
