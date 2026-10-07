'use client';

import React from 'react';
import { Mensagem } from '../../types';
import { formatTime, formatFileSize } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';

interface MessageBubbleProps {
  mensagem: Mensagem;
  isGroup: boolean;
  onImageClick?: (url: string) => void;
}

export default function MessageBubble({
  mensagem,
  isGroup,
  onImageClick,
}: MessageBubbleProps) {
  const { theme } = useTheme();
  const isMine = mensagem.enviado_por_mim;

  return (
    <div
      className={`flex w-full my-1 ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`relative max-w-[70%] sm:max-w-[65%] rounded-lg px-3 py-1.5 shadow-xs text-sm select-text ${
          isMine
            ? 'rounded-tr-none text-gray-900 border border-emerald-100/60'
            : 'rounded-tl-none bg-white text-gray-900 border border-gray-100'
        }`}
        style={
          isMine
            ? {
                backgroundColor: '#d9fdd3', // WhatsApp clássico de leitura confortável
              }
            : {}
        }
      >
        {/* Nome do Remetente em Grupos */}
        {isGroup && !isMine && (
          <div
            className="text-xs font-semibold mb-1 truncate"
            style={{ color: theme.primary }}
          >
            {mensagem.usuario_nome}
          </div>
        )}

        {/* Resposta citada */}
        {mensagem.mensagem_respondida && (
          <div className="mb-1.5 border-l-4 border-emerald-600 bg-black/5 p-1.5 rounded text-xs text-gray-600">
            <span className="font-semibold block text-[11px] text-gray-700">
              Respondendo
            </span>
            <span className="truncate block italic text-gray-500">
              {mensagem.mensagem_respondida}
            </span>
          </div>
        )}

        {/* Anexo de Imagem */}
        {mensagem.tipo === 'imagem' && mensagem.anexo_url && (
          <div className="mb-1.5 mt-0.5 rounded overflow-hidden">
            <img
              src={mensagem.anexo_url}
              alt="Imagem enviada"
              onClick={() => onImageClick && onImageClick(mensagem.anexo_url!)}
              className="max-h-72 w-full object-cover rounded cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>
        )}

        {/* Anexo de Arquivo/Documento */}
        {(mensagem.tipo === 'arquivo' || mensagem.tipo === 'documento') && mensagem.anexo_url && (
          <div className="flex items-center gap-3 p-2 my-1 bg-black/5 rounded-lg border border-black/5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-xs text-gray-800 block truncate">
                {mensagem.anexo_nome || 'Documento'}
              </span>
              <span className="text-[11px] text-gray-500 block">
                {formatFileSize(mensagem.anexo_tamanho)}
              </span>
            </div>
            <a
              href={mensagem.anexo_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-1.5 rounded-full hover:bg-black/10 text-gray-700 transition-colors shrink-0"
              title="Baixar arquivo"
            >
              <Download size={16} />
            </a>
          </div>
        )}

        {/* Texto da Mensagem */}
        {mensagem.mensagem ? (
          <p className="whitespace-pre-wrap break-words leading-relaxed text-[13.5px]">
            {mensagem.mensagem}
          </p>
        ) : null}

        {/* Rodapé: Horário e Confirmação de Leitura */}
        <div className="flex items-center justify-end gap-1 mt-0.5 -mr-1 text-[11px] text-gray-500 select-none">
          <span>{formatTime(mensagem.criado_em)}</span>

          {isMine && (
            <span className="ml-0.5">
              {mensagem.lida ? (
                <CheckCheck size={14} className="text-[#53bdeb]" />
              ) : (
                <Check size={14} className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
