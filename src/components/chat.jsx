
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Bot, User as UserIcon } from 'lucide-react';

/**
 * @param {Array} logs - Historial de mensajes de la sala
 * @param {Function} onSend - Función para procesar el envío del mensaje
 * @param {Boolean} isTurn - Si es el turno del usuario actual
 * @param {Boolean} isLoading - Si la IA está procesando una respuesta
 */
const Chat = ({ logs, onSend, isTurn, isLoading }) => {
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll al final cuando llega un mensaje nuevo
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !isTurn || isLoading) return;
    
    onSend(text);
    setText(''); // Limpiar el input local
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-full bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
      
      {/* Header del Chat */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <MessageSquare size={18} className="text-indigo-400" />
          </div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-300">
            Registro de Duelo
          </h3>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-400 animate-pulse">IA PENSANDO</span>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Cuerpo del Chat (Mensajes) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/20">
        {logs?.map((log, i) => {
          const isMe = log.sender === 'Tú' || log.sender.includes('Jugador');
          const isSystem = log.sender === 'Sistema';

          return (
            <div 
              key={i} 
              className={`flex flex-col ${isMe ? 'items-end' : isSystem ? 'items-center' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed shadow-lg ${
                isSystem 
                  ? 'bg-slate-800/40 text-slate-500 border border-slate-700/30 italic text-center text-[10px]'
                  : isMe
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {!isSystem && (
                  <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                    {log.sender === 'IA' ? <Bot size={10} /> : <UserIcon size={10} />}
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {log.sender}
                    </span>
                  </div>
                )}
                {log.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input de Mensajes */}
      <div className="p-5 bg-slate-950/80 backdrop-blur-md border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isTurn || isLoading}
            placeholder={
              !isTurn ? "Espera el turno del oponente..." : 
              isLoading ? "La IA está respondiendo..." : 
              "Pregunta algo (ej: ¿Es mujer?)..."
            }
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 transition-all font-medium placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={!isTurn || isLoading || !text.trim()}
            className="bg-indigo-600 p-3.5 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Send size={18} className="text-white" />
          </button>
        </form>
        
        {/* Indicador de Turno Visual */}
        <div className="mt-3 flex justify-center">
          <p className={`text-[9px] font-bold uppercase tracking-widest ${isTurn ? 'text-green-500' : 'text-slate-600'}`}>
            {isTurn ? '● Es tu turno de preguntar' : '○ Esperando respuesta...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;

```
