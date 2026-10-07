'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { EmpresaDisponivel } from '../../types';
import { X, Building2, Check, RefreshCw } from 'lucide-react';

interface CompanySwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitched: () => void;
}

export default function CompanySwitchModal({
  isOpen,
  onClose,
  onSwitched,
}: CompanySwitchModalProps) {
  const { empresa, empresasDisponiveis, trocarEmpresa } = useAuth();
  const { theme } = useTheme();

  const [switchingId, setSwitchingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSelectCompany = async (novaEmpresa: EmpresaDisponivel) => {
    if (novaEmpresa.id === empresa?.id) {
      onClose();
      return;
    }

    try {
      setSwitchingId(Number(novaEmpresa.id));
      await trocarEmpresa(Number(novaEmpresa.id));
      onSwitched();
      onClose();
    } catch (err) {
      alert('Não foi possível alternar de empresa no momento.');
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ backgroundColor: theme.primary }}
        >
          <div className="flex items-center gap-2">
            <Building2 size={20} />
            <h2 className="text-base font-bold">Alternar Ambiente Corporativo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Empresas */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500 mb-3">
            Selecione a empresa para a qual deseja alternar o contexto de trabalho:
          </p>

          {empresasDisponiveis.map((emp) => {
            const isCurrent = Number(emp.id) === empresa?.id;
            const isSwitching = switchingId === Number(emp.id);

            return (
              <div
                key={emp.id}
                onClick={() => !isSwitching && handleSelectCompany(emp)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-2 bg-gray-50/80 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={isCurrent ? { borderColor: emp.cor_primaria || theme.primary } : {}}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {emp.logo_url ? (
                    <img
                      src={emp.logo_url}
                      alt={emp.nome}
                      className="h-10 w-10 rounded-lg object-contain border p-0.5 bg-white shrink-0"
                    />
                  ) : (
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-sm"
                      style={{ backgroundColor: emp.cor_primaria || '#0A4D68' }}
                    >
                      {emp.nome.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="font-bold text-xs text-gray-900 block truncate">
                      {emp.nome_fantasia || emp.nome}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 capitalize">
                        {emp.cargo}
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                        {emp.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  {isSwitching ? (
                    <RefreshCw size={18} className="animate-spin text-gray-400" />
                  ) : isCurrent ? (
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: emp.cor_primaria || theme.primary }}
                    >
                      <Check size={14} />
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
