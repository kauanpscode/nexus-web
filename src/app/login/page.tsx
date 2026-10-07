'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Lock, Phone, ArrowRight, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, authenticated, loading } = useAuth();
  const { theme } = useTheme();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && authenticated) {
      router.push('/');
    }
  }, [authenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await login(phone.trim(), password);
      router.push('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.error ||
        err.response?.data?.message ||
        'Telefone ou senha incorretos.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f0f2f5] select-none">
      {/* Faixa Superior Estilo WhatsApp Web */}
      <div
        className="h-48 w-full transition-colors duration-300 relative flex items-center px-8"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="max-w-4xl mx-auto w-full flex items-center gap-3 text-white">
          <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl flex items-center justify-center">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Nexus</h1>
            {/* <p className="text-xs text-white/80">Plataforma Corporativa de Comunicação em Equipe</p> */}
          </div>
        </div>
      </div>

      {/* Cartão de Login Centralizado */}
      <div className="flex-1 -mt-24 flex items-center justify-center px-4 z-10 mb-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Acesse seu Ambiente</h2>
              <p className="text-xs text-gray-500 mt-1">
                Conecte-se com seu telefone e senha corporativos
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telefone Corporativo
                </label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 5511999990001"
                    required
                    className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Senha de Acesso
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 mt-2 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: theme.primary }}
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Atalhos Rápidos para Teste */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
                Acessos Rápidos de Demonstração
              </span>
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleFillDemo('5511999990001', '123456')}
                  className="w-full p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-between text-left transition-colors"
                >
                  <span className="font-semibold text-gray-800">Ana Silva (TechCorp)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    ADMIN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('5511999990002', '123456')}
                  className="w-full p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-between text-left transition-colors"
                >
                  <span className="font-semibold text-gray-800">Bruno Souza (TechCorp)</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                    Colaborador
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('5511999990004', '123456')}
                  className="w-full p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-between text-left transition-colors"
                >
                  <span className="font-semibold text-gray-800">Diego Santos (InovaLog)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    ADMIN
                  </span>
                </button>
              </div>
            </div>

            {/* Cadastro de Nova Empresa */}
            <div className="mt-6 text-center">
              <a
                href="/registrar-empresa"
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Quer cadastrar uma nova empresa? <span className="underline">Clique aqui</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-gray-400" />
        <span>Tchat Corporativo — Isolamento estrito de dados por empresa</span>
      </footer>
    </div>
  );
}
