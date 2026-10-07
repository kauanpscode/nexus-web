'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { Building2, ArrowLeft, ArrowRight, User, AlertCircle } from 'lucide-react';

export default function RegistrarEmpresaPage() {
  const router = useRouter();

  const [empresaNome, setEmpresaNome] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#0A4D68');
  const [corSecundaria, setCorSecundaria] = useState('#088395');
  const [logoUrl, setLogoUrl] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        empresa_nome: empresaNome,
        nome_fantasia: nomeFantasia || empresaNome,
        cnpj: cnpj || undefined,
        cor_primaria: corPrimaria,
        cor_secundaria: corSecundaria,
        logo_url: logoUrl || undefined,
        admin_name: adminName,
        admin_phone: adminPhone,
        admin_pass: adminPass,
      };

      const res = await api.post('/empresas/registrar', payload);
      const { token, empresa } = res.data;

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('tchat_token', token);
        if (empresa) {
          localStorage.setItem('tchat_empresa', JSON.stringify(empresa));
        }
        // Redireciona para o painel principal
        window.location.href = '/';
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.error ||
        err.response?.data?.message ||
        'Erro ao cadastrar empresa. Verifique os dados.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] flex flex-col justify-between py-8 px-4">
      <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Topo */}
        <div
          className="p-6 text-white transition-colors flex items-center justify-between"
          style={{ backgroundColor: corPrimaria }}
        >
          <div className="flex items-center gap-3">
            <Building2 size={26} />
            <div>
              <h1 className="text-lg font-bold">Cadastrar Nova Empresa</h1>
              <p className="text-xs text-white/80">Configure o ambiente corporativo e seu administrador</p>
            </div>
          </div>

          <a
            href="/login"
            className="flex items-center gap-1 text-xs text-white/90 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar ao login
          </a>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Building2 size={16} style={{ color: corPrimaria }} />
              Dados da Empresa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Razão Social / Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={empresaNome}
                  onChange={(e) => setEmpresaNome(e.target.value)}
                  placeholder="Ex: Minha Empresa LTDA"
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Ex: Minha Empresa"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CNPJ (Opcional)
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL do Logotipo (Opcional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Identidade Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="h-10 w-12 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="flex-1 text-xs font-mono px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    className="h-10 w-12 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    className="flex-1 text-xs font-mono px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Administrador */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <User size={16} style={{ color: corPrimaria }} />
              Administrador Inicial
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nome Completo do Administrador *
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                required
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telefone para Login *
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="5511999998888"
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Senha de Acesso (Mín. 6 caracteres) *
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Senha segura"
                  required
                  minLength={6}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: corPrimaria }}
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Criar Empresa e Iniciar Ambiente</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
