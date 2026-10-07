'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';
import { Building2, ArrowRight, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface InviteData {
  empresa_nome: string;
  empresa_logo?: string | null;
  empresa_cor_primaria?: string;
  cargo_oferecido: string;
  convidado_por: string;
  expira_em: string;
}

export default function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulário para aceitar
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      try {
        setLoading(true);
        const res = await api.get(`/convites/${token}`);
        setInvite(res.data?.data);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.messages?.error ||
          err.response?.data?.message ||
          'Este convite é inválido ou já expirou.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadInvite();
  }, [token]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        name: name || undefined,
        phone,
        password,
      };

      const res = await api.post(`/convites/${token}/aceitar`, payload);
      const { token: jwtToken, empresa } = res.data;

      if (jwtToken && typeof window !== 'undefined') {
        localStorage.setItem('tchat_token', jwtToken);
        if (empresa) {
          localStorage.setItem('tchat_empresa', JSON.stringify(empresa));
        }
        window.location.href = '/';
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.messages?.error ||
        err.response?.data?.messages?.credenciais ||
        'Erro ao aceitar convite.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = invite?.empresa_cor_primaria || '#0A4D68';

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-400 border-t-transparent" />
          <span className="text-xs text-gray-500">Validando convite corporativo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] flex flex-col justify-between py-8 px-4">
      <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Topo com branding da empresa que convidou */}
        <div
          className="p-6 text-white text-center flex flex-col items-center justify-center transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          {invite?.empresa_logo ? (
            <img
              src={invite.empresa_logo}
              alt={invite.empresa_nome}
              className="h-16 max-w-[160px] object-contain mb-3 p-1.5 bg-white rounded-xl shadow-xs"
            />
          ) : (
            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <Building2 size={32} />
            </div>
          )}

          <h1 className="text-lg font-bold">
            Convite para {invite?.empresa_nome || 'Empresa'}
          </h1>
          <p className="text-xs text-white/80 mt-1">
            Você foi convidado(a) por {invite?.convidado_por || 'um administrador'}
          </p>

          <span className="mt-3 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
            Cargo: {invite?.cargo_oferecido}
          </span>
        </div>

        {/* Formulário de Ingresso */}
        <div className="p-6">
          {errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <p className="text-xs text-gray-600 mb-2">
                Informe seus dados para ingressar no WhatsApp Corporativo da empresa:
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amanda Lima"
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seu Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5511999998888"
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Crie sua Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  required
                  minLength={6}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 mt-2 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Aceitar Convite e Entrar</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
