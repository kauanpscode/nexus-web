'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mensagem } from '../../types';
import MessageBubble from './MessageBubble';
import { X } from 'lucide-react';

interface MessageAreaProps {
  mensagens: Mensagem[];
  loading: boolean;
  isGroup: boolean;
}

export default function MessageArea({
  mensagens,
  loading,
  isGroup,
}: MessageAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    // Auto-scroll para a última mensagem
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 chat-background flex flex-col justify-start relative"
    >
      {loading && mensagens.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-full shadow-xs text-xs text-gray-500 font-medium">
            Carregando mensagens...
          </div>
        </div>
      ) : mensagens.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-full shadow-xs text-xs text-gray-500 text-center max-w-xs">
            Nenhuma mensagem trocada ainda. Diga olá para começar a conversa corporativa!
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {mensagens.map((msg) => (
            <MessageBubble
              key={msg.id}
              mensagem={msg}
              isGroup={isGroup}
              onImageClick={(url) => setLightboxUrl(url)}
            />
          ))}
          <div ref={bottomRef} className="h-1" />
        </div>
      )}

      {/* Lightbox para visualização de fotos */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors focus:outline-none"
          >
            <X size={28} />
          </button>
          <img
            src={lightboxUrl}
            alt="Foto expandida"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
