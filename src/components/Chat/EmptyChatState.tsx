'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Lock, ShieldCheck, Building2 } from 'lucide-react';

export default function EmptyChatState() {
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f0f2f5] border-b-6 border-b-[#4ac959] text-center select-none relative overflow-hidden">
      <div className="max-w-md flex flex-col items-center">
        {/* Logo da Empresa ou Ícone Corporativo */}
        <div className="relative mb-6">
          {theme.empresaLogo ? (
            <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center">
              <img
                src={theme.empresaLogo}
                alt={theme.empresaNome}
                className="h-20 max-w-[200px] object-contain"
              />
            </div>
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ backgroundColor: theme.primary }}
            >
              <Building2 size={48} />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-light text-gray-700 tracking-tight">
          Tchat Web — {theme.empresaNome}
        </h2>

        <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-sm">
          Envie e receba mensagens corporativas com sua equipe em tempo real.
          Selecione uma conversa ao lado para começar.
        </p>

        <div className="mt-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200/60 text-gray-600 text-xs">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Ambiente corporativo privativo e isolado</span>
        </div>
      </div>

      {/* Rodapé de Segurança estilo WhatsApp */}
      <div className="absolute bottom-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Lock size={12} />
        <span>Isolamento seguro de dados corporativos</span>
      </div>
    </div>
  );
}
