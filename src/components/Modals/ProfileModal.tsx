'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { formatPhoneNumber } from '../../utils/formatters';
import { X, Camera, Building2, Shield, RefreshCw } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      setSuccessMsg(false);

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAvatarUrl = res.data?.avatar_url || res.data?.data?.avatar_url;
      if (newAvatarUrl) {
        updateUser({ avatar_url: newAvatarUrl });
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao atualizar avatar:', err);
      alert('Não foi possível enviar a foto de perfil.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ backgroundColor: theme.primary }}
        >
          <h2 className="text-base font-bold">Meu Perfil Corporativo</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Perfil */}
        <div className="p-6 flex flex-col items-center">
          {/* Avatar com Botão de Alteração */}
          <div className="relative mb-5 group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
              />
            ) : (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                style={{ backgroundColor: theme.primary }}
              >
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Trocar foto de perfil"
              className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              {uploading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>
          </div>

          {successMsg && (
            <div className="text-xs text-emerald-600 font-semibold mb-3">
              Foto de perfil atualizada com sucesso!
            </div>
          )}

          <h3 className="text-base font-bold text-gray-900">{user?.name}</h3>
          <span className="text-xs text-gray-500 font-mono mt-0.5">
            {formatPhoneNumber(user?.phone || '')}
          </span>

          {/* Dados Corporativos */}
          <div className="w-full mt-6 space-y-3 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs">
              <Building2 size={18} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-gray-400 block text-[11px]">Empresa Ativa</span>
                <span className="font-semibold text-gray-800 truncate block">
                  {theme.empresaNome}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs">
              <Shield size={18} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-gray-400 block text-[11px]">Cargo / Permissão</span>
                <span className="font-semibold text-gray-800 capitalize block">
                  {user?.cargo || 'Colaborador'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
