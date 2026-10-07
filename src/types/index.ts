export interface User {
  id: number;
  name: string;
  phone: string;
  avatar_url?: string | null;
  cargo?: 'admin' | 'gerente' | 'colaborador' | string;
}

export interface Empresa {
  id: number;
  nome: string;
  nome_fantasia?: string;
  cnpj?: string | null;
  logo_url?: string | null;
  cor_primaria?: string;
  cor_secundaria?: string;
  configuracoes?: string | null;
}

export interface EmpresaDisponivel extends Empresa {
  cargo: 'admin' | 'gerente' | 'colaborador' | string;
  status: 'ativo' | 'inativo' | 'suspenso' | string;
}

export interface UltimaMensagem {
  id: number;
  texto: string;
  tipo: string;
  criado_em: string;
  id_usuario: number;
}

export interface Destinatario {
  id: number;
  nome: string;
  telefone: string;
  avatar?: string | null;
}

export interface Conversa {
  id: number;
  empresa_id: number;
  tipo: 'P' | 'G' | string;
  nome: string;
  imagem?: string | null;
  descricao?: string | null;
  fixada?: boolean;
  silenciado?: boolean;
  arquivado?: boolean;
  nao_lidas: number;
  ultima_atividade_em: string;
  destinatario?: Destinatario | null;
  ultima_mensagem?: UltimaMensagem | null;
}

export interface Mensagem {
  id: number;
  id_usuario: number;
  tipo: 'texto' | 'imagem' | 'audio' | 'arquivo' | string;
  mensagem: string;
  criado_em: string;
  respondendo_id?: number | null;
  usuario_nome: string;
  usuario_avatar?: string | null;
  mensagem_respondida?: string | null;
  anexo_url?: string | null;
  anexo_nome?: string | null;
  anexo_tamanho?: number | null;
  enviado_por_mim: boolean;
  lida: boolean;
}

export interface Colaborador {
  id: number;
  name: string;
  phone: string;
  avatar_url?: string | null;
  cargo: 'admin' | 'gerente' | 'colaborador' | string;
  status: 'ativo' | 'inativo' | 'suspenso' | string;
  membro_desde?: string;
  status_presenca?: 'online' | 'offline' | string;
}

export interface Convite {
  id: number;
  empresa_id: number;
  empresa_nome?: string;
  email?: string | null;
  telefone?: string | null;
  cargo: 'admin' | 'gerente' | 'colaborador' | string;
  token: string;
  status: 'pendente' | 'aceito' | 'cancelado' | 'expirado' | string;
  expira_em: string;
  criado_em?: string;
}
