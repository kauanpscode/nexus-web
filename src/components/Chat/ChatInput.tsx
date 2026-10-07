'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatFileSize } from '../../utils/formatters';

interface ChatInputProps {
  onSendMessage: (text: string, file: File | null) => Promise<void>;
  sending: boolean;
}

export default function ChatInput({ onSendMessage, sending }: ChatInputProps) {
  const { theme } = useTheme();

  const [text, setText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filePreviewUrl = useMemo(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !selectedFile) || sending) return;

    const messageText = text.trim();
    const messageFile = selectedFile;

    // Limpa estado antes do envio para agilidade
    setText('');
    clearSelectedFile();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(messageText, messageFile);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <footer className="w-full bg-[#f0f2f5] border-t border-gray-200 px-4 py-2.5 shrink-0 flex flex-col gap-2">
      {/* Pré-visualização do Anexo Selecionado */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 shadow-xs max-w-sm">
          {filePreviewUrl ? (
            <img
              src={filePreviewUrl}
              alt="Prévia"
              className="h-12 w-12 rounded object-cover border"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <FileText size={20} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="font-medium text-xs text-gray-800 block truncate">
              {selectedFile.name}
            </span>
            <span className="text-[11px] text-gray-500 block">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>

          <button
            onClick={clearSelectedFile}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remover anexo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Linha de Envio e Ações */}
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />

        {/* Botão de Anexo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Anexar arquivo ou foto"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors shrink-0 mb-0.5"
        >
          <Paperclip size={20} />
        </button>

        {/* Campo de Texto */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 px-3 py-1.5 focus-within:border-gray-300 shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="w-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none resize-none max-h-32 leading-relaxed"
          />
        </div>

        {/* Botão de Enviar */}
        <button
          onClick={handleSend}
          disabled={(!text.trim() && !selectedFile) || sending}
          className="p-2.5 rounded-full text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
          style={{ backgroundColor: theme.primary }}
          title="Enviar (Enter)"
        >
          {sending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </footer>
  );
}
