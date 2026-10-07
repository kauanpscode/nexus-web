'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { Colaborador, Convite } from '../../types';
import { formatPhoneNumber } from '../../utils/formatters';
import {
  X,
  Palette,
  Users,
  Mail,
  Check,
  Copy,
  Trash2,
  Building2,
  Save,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Azul TechCorp', primary: '#0A4D68', secondary: '#088395' },
  { name: 'Verde InovaLog', primary: '#1E5128', secondary: '#4E9F3D' },
  { name: 'Esmeralda WhatsApp', primary: '#075E54', secondary: '#128C7E' },
  { name: 'Índigo Corporativo', primary: '#4338CA', secondary: '#6366F1' },
  { name: 'Azul Executivo', primary: '#1E40AF', secondary: '#3B82F6' },
  { name: 'Ardósia Escura', primary: '#1E293B', secondary: '#475569' },
  { name: 'Vinho Bordô', primary: '#831843', secondary: '#BE185D' },
];

export default function AdminSettingsModal({
  isOpen,
  onClose,
}: AdminSettingsModalProps) {
  const { user, empresa, updateEmpresa } = useAuth();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'branding' | 'colaboradores' | 'convites'>('branding');

  // Estado do Branding (Visual)
  const [nome, setNome] = useState(empresa?.nome || '');
  const [nomeFantasia, setNomeFantasia] = useState(empresa?.nome_fantasia || empresa?.nome || '');
  const [corPrimaria, setCorPrimaria] = useState(empresa?.cor_primaria || '#0A4D68');
  const [corSecundaria, setCorSecundaria] = useState(empresa?.cor_secundaria || '#088395');
  const [logoUrl, setLogoUrl] = useState(empresa?.logo_url || '');
  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingMessage, setBrandingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado de Colaboradores
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);

  // Estado de Convites
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loadingConvites, setLoadingConvites] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoCargo, setNovoCargo] = useState<'colaborador' | 'gerente' | 'admin'>('colaborador');
  const [creatingConvite, setCreatingConvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const carregarColaboradores = React.useCallback(async () => {
    try {
      setLoadingColaboradores(true);
      const res = await api.get('/empresa/colaboradores', { params: { todos: 'true' } });
      setColaboradores(res.data?.data || []);
    } catch (err) {
      console.error('Erro ao listar colaboradores:', err);
    } finally {
      setLoadingColaboradores(false);
    }
  }, []);

  const carregarConvites = React.useCallback(async () => {
    try {
      setLoadingConvites(true);
      const res = await api.get('/empresa/convites');
      setConvites(res.data?.data || []);
    } catch (err) {
      console.error('Erro ao listar convites:', err);
    } finally {
      setLoadingConvites(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'colaboradores') {
        carregarColaboradores();
      } else if (activeTab === 'convites') {
        carregarConvites();
      }
    }
  }, [isOpen, activeTab, carregarColaboradores, carregarConvites]);

  // Salvar Identidade Visual
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBranding(true);
      setBrandingMessage(null);

      const payload = {
        nome,
        nome_fantasia: nomeFantasia,
        cor_primaria: corPrimaria,
        cor_secundaria: corSecundaria,
        logo_url: logoUrl || null,
      };

      const res = await api.put('/empresa', payload);
      const empresaAtualizada = res.data?.data;

      if (empresaAtualizada) {
        updateEmpresa(empresaAtualizada);
      } else {
        updateEmpresa(payload);
      }

      setBrandingMessage({
        type: 'success',
        text: 'Identidade visual e dados corporativos atualizados com sucesso!',
      });
    } catch (err: any) {
      setBrandingMessage({
        type: 'error',
        text: err.response?.data?.messages?.error || 'Erro ao atualizar dados visuais.',
      });
    } finally {
      setSavingBranding(false);
    }
  };

  // Alterar Cargo
  const handleAlterarCargo = async (targetId: number, cargo: string) => {
    try {
      await api.patch(`/empresa/colaboradores/${targetId}/cargo`, { cargo });
      carregarColaboradores();
    } catch (err: any) {
      alert(err.response?.data?.messages?.cargo || 'Erro ao alterar cargo.');
    }
  };

  // Alterar Status
  const handleAlterarStatus = async (targetId: number, status: string) => {
    try {
      await api.patch(`/empresa/colaboradores/${targetId}/status`, { status });
      carregarColaboradores();
    } catch (err: any) {
      alert(err.response?.data?.messages?.status || 'Erro ao alterar status.');
    }
  };

  // Criar Convite
  const handleCriarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail && !novoTelefone) {
      alert('Informe o e-mail ou o telefone do novo colaborador.');
      return;
    }

    try {
      setCreatingConvite(true);
      await api.post('/empresa/convites', {
        email: novoEmail || undefined,
        telefone: novoTelefone || undefined,
        cargo: novoCargo,
      });
      setNovoEmail('');
      setNovoTelefone('');
      carregarConvites();
    } catch (err: any) {
      alert(err.response?.data?.messages?.contato || 'Erro ao gerar convite.');
    } finally {
      setCreatingConvite(false);
    }
  };

  // Cancelar Convite
  const handleCancelarConvite = async (id: number) => {
    if (!confirm('Deseja realmente cancelar este convite?')) return;
    try {
      await api.delete(`/empresa/convites/${id}`);
      carregarConvites();
    } catch (err) {
      alert('Erro ao cancelar convite.');
    }
  };

  // Copiar link de convite
  const handleCopyInviteLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Topo do Modal */}
        <div
          className="flex items-center justify-between px-6 py-4 text-white shrink-0"
          style={{ backgroundColor: theme.primary }}
        >
          <div className="flex items-center gap-2.5">
            <Building2 size={24} />
            <div>
              <h2 className="text-lg font-bold leading-tight">
                Painel Administrativo da Empresa
              </h2>
              <p className="text-xs text-white/80">
                Personalização visual, gestão de colaboradores e convites de {theme.empresaNome}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'branding'
                ? 'border-b-2 text-gray-900 bg-white'
                : 'border-b-transparent text-gray-500 hover:text-gray-800'
            }`}
            style={activeTab === 'branding' ? { borderColor: theme.primary, color: theme.primary } : {}}
          >
            <Palette size={18} />
            Visual e Marca (White-label)
          </button>

          <button
            onClick={() => setActiveTab('colaboradores')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'colaboradores'
                ? 'border-b-2 text-gray-900 bg-white'
                : 'border-b-transparent text-gray-500 hover:text-gray-800'
            }`}
            style={activeTab === 'colaboradores' ? { borderColor: theme.primary, color: theme.primary } : {}}
          >
            <Users size={18} />
            Colaboradores
          </button>

          <button
            onClick={() => setActiveTab('convites')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'convites'
                ? 'border-b-2 text-gray-900 bg-white'
                : 'border-b-transparent text-gray-500 hover:text-gray-800'
            }`}
            style={activeTab === 'convites' ? { borderColor: theme.primary, color: theme.primary } : {}}
          >
            <Mail size={18} />
            Convites Corporativos
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fafafa]">
          {/* ===================== ABA 1: BRANDING & VISUAL ===================== */}
          {activeTab === 'branding' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {brandingMessage && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    brandingMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{brandingMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveBranding} className="space-y-6">
                {/* Dados da Empresa */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                  <h3 className="font-semibold text-sm text-gray-800 border-b border-gray-100 pb-2">
                    Identificação da Organização
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Razão Social / Nome da Empresa
                      </label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome Fantasia (Exibido no Cabeçalho)
                      </label>
                      <input
                        type="text"
                        value={nomeFantasia}
                        onChange={(e) => setNomeFantasia(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL do Logotipo (PNG, SVG, JPG transparente recomendado)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://exemplo.com/logo.png"
                        className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                      {logoUrl && (
                        <div className="h-10 w-16 p-1 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shrink-0">
                          <img
                            src={logoUrl}
                            alt="Prévia do logo"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cores da Identidade Visual */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                  <h3 className="font-semibold text-sm text-gray-800 border-b border-gray-100 pb-2">
                    Paleta de Cores Corporativa
                  </h3>

                  {/* Presets Rápidos */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Paletas Rápidas Pré-definidas:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setCorPrimaria(preset.primary);
                            setCorSecundaria(preset.secondary);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {/* Cor Primária */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cor Primária (Cabeçalhos, Botões, Destaques)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={corPrimaria}
                          onChange={(e) => setCorPrimaria(e.target.value)}
                          className="h-10 w-14 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={corPrimaria}
                          onChange={(e) => setCorPrimaria(e.target.value)}
                          className="flex-1 text-sm font-mono px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Cor Secundária */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cor Secundária (Gradientes, Detalhes e Badges)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={corSecundaria}
                          onChange={(e) => setCorSecundaria(e.target.value)}
                          className="h-10 w-14 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={corSecundaria}
                          onChange={(e) => setCorSecundaria(e.target.value)}
                          className="flex-1 text-sm font-mono px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prévia ao Vivo em Tempo Real */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <h3 className="font-semibold text-sm text-gray-800 flex items-center justify-between">
                    <span>Pré-visualização do Visual em Tempo Real</span>
                    <span className="text-xs font-normal text-gray-400">
                      Como o sistema se parecerá para os colaboradores
                    </span>
                  </h3>

                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-[#efeae2]">
                    {/* Header Simulado */}
                    <div
                      className="px-4 py-3 flex items-center justify-between text-white"
                      style={{ backgroundColor: corPrimaria }}
                    >
                      <div className="flex items-center gap-2.5">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-6 object-contain rounded"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                        ) : (
                          <Building2 size={18} />
                        )}
                        <span className="font-bold text-sm">
                          {nomeFantasia || nome || 'Sua Empresa'}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20">
                        WhatsApp Corporativo
                      </span>
                    </div>

                    {/* Chat Simulado */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg px-3 py-1.5 shadow-2xs text-xs text-gray-800 max-w-xs">
                          Olá! Este é o visual corporativo da nossa empresa.
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-[#d9fdd3] rounded-lg px-3 py-1.5 shadow-2xs text-xs text-gray-800 max-w-xs border border-emerald-100">
                          Perfeito! As cores e o logotipo ficaram alinhados com nossa marca.
                        </div>
                      </div>
                    </div>

                    {/* Botão de Envio Simulado */}
                    <div className="bg-[#f0f2f5] p-2.5 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-xs text-gray-400 bg-white rounded-lg px-3 py-1.5 flex-1 mr-3 border border-gray-200">
                        Digite uma mensagem...
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
                        style={{ backgroundColor: corPrimaria }}
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botão de Salvar Alterações */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingBranding}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    {savingBranding ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Salvar Identidade Visual da Empresa
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===================== ABA 2: COLABORADORES ===================== */}
          {activeTab === 'colaboradores' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">
                    Membros da Empresa
                  </h3>
                  <p className="text-xs text-gray-500">
                    Gerencie cargos, permissões e status dos colaboradores
                  </p>
                </div>
                <button
                  onClick={carregarColaboradores}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Recarregar"
                >
                  <RefreshCw size={16} className={loadingColaboradores ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingColaboradores ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  Carregando lista de colaboradores...
                </div>
              ) : colaboradores.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  Nenhum colaborador encontrado.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                        <th className="py-3 px-4">Colaborador</th>
                        <th className="py-3 px-4">Telefone</th>
                        <th className="py-3 px-4">Cargo</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Presença</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {colaboradores.map((colab) => (
                        <tr key={colab.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {colab.avatar_url ? (
                                <img
                                  src={colab.avatar_url}
                                  alt={colab.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div
                                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
                                  style={{ backgroundColor: theme.primary }}
                                >
                                  {colab.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-gray-900">
                                {colab.name} {colab.id === user?.id && '(Você)'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-gray-600 font-mono">
                            {formatPhoneNumber(colab.phone)}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={colab.cargo}
                              disabled={colab.id === user?.id}
                              onChange={(e) => handleAlterarCargo(colab.id, e.target.value)}
                              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white font-medium focus:outline-none disabled:opacity-50"
                            >
                              <option value="colaborador">Colaborador</option>
                              <option value="gerente">Gerente</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={colab.status}
                              disabled={colab.id === user?.id}
                              onChange={(e) => handleAlterarStatus(colab.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border font-semibold focus:outline-none disabled:opacity-50 ${
                                colab.status === 'ativo'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : colab.status === 'suspenso'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                            >
                              <option value="ativo">Ativo</option>
                              <option value="inativo">Inativo</option>
                              <option value="suspenso">Suspenso</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {colab.status_presenca === 'online' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400">Offline</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===================== ABA 3: CONVITES CORPORATIVOS ===================== */}
          {activeTab === 'convites' && (
            <div className="space-y-6">
              {/* Formulário para novo convite */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <Plus size={16} style={{ color: theme.primary }} />
                  Gerar Novo Convite Corporativo
                </h3>

                <form onSubmit={handleCriarConvite} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      E-mail do Convidado
                    </label>
                    <input
                      type="email"
                      value={novoEmail}
                      onChange={(e) => setNovoEmail(e.target.value)}
                      placeholder="colaborador@empresa.com"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      placeholder="5511999998888"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cargo Atribuído
                    </label>
                    <select
                      value={novoCargo}
                      onChange={(e) => setNovoCargo(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none"
                    >
                      <option value="colaborador">Colaborador</option>
                      <option value="gerente">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      disabled={creatingConvite}
                      className="w-full text-xs font-bold py-2 px-3 rounded-lg text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {creatingConvite ? 'Gerando...' : 'Gerar Convite'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tabela de Convites */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-800">
                  Convites Emitidos
                </h3>

                {loadingConvites ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    Carregando convites...
                  </div>
                ) : convites.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 bg-white rounded-xl border border-gray-200">
                    Nenhum convite emitido até o momento.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                          <th className="py-3 px-4">Destinatário</th>
                          <th className="py-3 px-4">Cargo</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Expira em</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {convites.map((convite) => (
                          <tr key={convite.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {convite.email || convite.telefone || 'Acesso livre'}
                            </td>

                            <td className="py-3 px-4 text-gray-600 capitalize">
                              {convite.cargo}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  convite.status === 'pendente'
                                    ? 'bg-amber-100 text-amber-800'
                                    : convite.status === 'aceito'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {convite.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-gray-500">
                              {new Date(convite.expira_em).toLocaleDateString('pt-BR')}
                            </td>

                            <td className="py-3 px-4 text-right space-x-1">
                              {convite.status === 'pendente' && (
                                <>
                                  <button
                                    onClick={() => handleCopyInviteLink(convite.token)}
                                    className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="Copiar Link de Acesso"
                                  >
                                    {copiedToken === convite.token ? (
                                      <Check size={15} className="text-emerald-600" />
                                    ) : (
                                      <Copy size={15} />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleCancelarConvite(convite.id)}
                                    className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                                    title="Cancelar Convite"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
