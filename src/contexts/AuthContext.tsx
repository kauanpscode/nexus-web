'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, Empresa, EmpresaDisponivel } from '../types';

interface LoginResponse {
  status: number;
  message: string;
  token: string;
  user: User;
  empresa: Empresa;
  empresas_disponiveis?: EmpresaDisponivel[];
}

interface TrocarEmpresaResponse {
  status: number;
  message: string;
  token: string;
  empresa: Empresa;
}

interface AuthContextData {
  authenticated: boolean;
  user: User | null;
  empresa: Empresa | null;
  empresasDisponiveis: EmpresaDisponivel[];
  loading: boolean;
  login: (phone: string, password: string, empresaId?: number) => Promise<void>;
  logout: () => Promise<void>;
  trocarEmpresa: (empresaId: number) => Promise<void>;
  updateUser: (updatedUserData: Partial<User>) => void;
  updateEmpresa: (updatedEmpresaData: Partial<Empresa>) => void;
  refreshEmpresa: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<EmpresaDisponivel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    function loadStorageData() {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('tchat_token');
          const storedUser = localStorage.getItem('tchat_user');
          const storedEmpresa = localStorage.getItem('tchat_empresa');
          const storedEmpresas = localStorage.getItem('tchat_empresas_disponiveis');

          if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser) as User);
            if (storedEmpresa) {
              setEmpresa(JSON.parse(storedEmpresa) as Empresa);
            }
            if (storedEmpresas) {
              setEmpresasDisponiveis(JSON.parse(storedEmpresas) as EmpresaDisponivel[]);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao ler autenticação do localStorage:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  async function login(phone: string, password: string, empresaId?: number) {
    const payload: { phone: string; password: string; empresa_id?: number } = {
      phone,
      password,
    };
    if (empresaId) {
      payload.empresa_id = empresaId;
    }

    const response = await api.post<LoginResponse>('/login', payload);
    console.log(response);
    const { token, user: userData, empresa: empresaData, empresas_disponiveis } = response.data;

    if (!token) {
      throw new Error('Token de acesso não retornado pela API.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('tchat_token', token);
      localStorage.setItem('tchat_user', JSON.stringify(userData));
      if (empresaData) {
        localStorage.setItem('tchat_empresa', JSON.stringify(empresaData));
      }
      if (empresas_disponiveis) {
        localStorage.setItem(
          'tchat_empresas_disponiveis',
          JSON.stringify(empresas_disponiveis)
        );
      }
    }

    setUser(userData);
    if (empresaData) setEmpresa(empresaData);
    if (empresas_disponiveis) setEmpresasDisponiveis(empresas_disponiveis);
  }

  async function trocarEmpresa(empresaId: number) {
    try {
      const response = await api.post<TrocarEmpresaResponse>('/empresa/trocar', {
        empresa_id: empresaId,
      });

      const { token, empresa: novaEmpresa } = response.data;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('tchat_token', token);
      }
      if (novaEmpresa) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tchat_empresa', JSON.stringify(novaEmpresa));
        }
        setEmpresa(novaEmpresa);
      }

      // Atualiza também os dados do usuário na empresa atual (cargo)
      const meResponse = await api.get('/me');
      if (meResponse.data?.user) {
        const updatedUser = meResponse.data.user;
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tchat_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Erro ao alternar de empresa:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await api.post('/presenca/offline').catch(() => {});
    } catch {
      // Ignora erro de rede no logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tchat_token');
        localStorage.removeItem('tchat_user');
        localStorage.removeItem('tchat_empresa');
        localStorage.removeItem('tchat_empresas_disponiveis');
      }
      setUser(null);
      setEmpresa(null);
      setEmpresasDisponiveis([]);
    }
  }

  function updateUser(updatedUserData: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updatedUserData };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tchat_user', JSON.stringify(updated));
    }
  }

  function updateEmpresa(updatedEmpresaData: Partial<Empresa>) {
    if (!empresa) return;
    const updated = { ...empresa, ...updatedEmpresaData };
    setEmpresa(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tchat_empresa', JSON.stringify(updated));
    }
  }

  async function refreshEmpresa() {
    try {
      const response = await api.get('/empresa');
      const data = response.data?.data;
      if (data) {
        setEmpresa(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tchat_empresa', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated: !!user,
        user,
        empresa,
        empresasDisponiveis,
        loading,
        login,
        logout,
        trocarEmpresa,
        updateUser,
        updateEmpresa,
        refreshEmpresa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
}
