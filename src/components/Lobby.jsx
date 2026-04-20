
import React from 'react';
import { 
  Bot, Users, ChevronRight, Tv, Film, Tag, LayoutGrid 
} from 'lucide-react';

/**
 * @param {Object} categories - Objeto con los datos de las categorías
 * @param {String} selectedCat - ID de la categoría seleccionada
 * @param {Function} onSelectCat - Setter para la categoría
 * @param {Function} onCreateGame - Función (mode) => void
 * @param {Function} onJoinGame - Función para unirse a sala existente
 * @param {String} roomIdInput - Estado del input del código
 * @param {Function} setRoomIdInput - Setter para el código
 */
const Lobby = ({ 
  categories, 
  selectedCat, 
  onSelectCat, 
  onCreateGame, 
  onJoinGame, 
  roomIdInput, 
  setRoomIdInput 
}) => {

  const getIcon = (key) => {
    switch (key) {
      case 'anime': return <Tv className="text-orange-400" />;
      case 'movies': return <Film className="text-blue-400" />;
      case 'brands': return <Tag className="text-emerald-400" />;
      default: return <LayoutGrid className="text-purple-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in fade-in zoom-in duration-500">
      {/* Cabecera del Lobby */}
      <div className="text-center space-y-2">
        <h1 className="text-6xl lg:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm">
          WHO?
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
          Multiverse Edition
        </p>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-slate-900/50 p-6 lg:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-10 backdrop-blur-md">
        
        {/* Sección 1: Categorías */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
            <span className="w-4 h-px bg-slate-800"></span>
            1. Selecciona tu Universo
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(categories).map(key => (
              <button 
                key={key}
                onClick={() => onSelectCat(key)}
                className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                  selectedCat === key 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 scale-[1.02]' 
                    : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className={`p-3 rounded-2xl ${selectedCat === key ? 'bg-indigo-500/20' : 'bg-slate-900/50'}`}>
                  {getIcon(key)}
                </div>
                <span className="font-black text-[11px] uppercase tracking-tight">
                  {categories[key].name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sección 2: Modos de Juego */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
            <span className="w-4 h-px bg-slate-800"></span>
            2. Modo de Juego
          </label>
          <div className="grid gap-3">
            {/* Botón IA */}
            <button 
              onClick={() => onCreateGame('ai')}
              className="bg-indigo-600 hover:bg-indigo-500 p-5 rounded-[1.8rem] flex items-center justify-between group transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <div className="flex items-center gap-5">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Bot size={28} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1">DUELO VS IA</p>
                  <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-tighter">Gemini 2.5 Flash Engine</p>
                </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform opacity-50" />
            </button>

            {/* Botón PVP */}
            <button 
              onClick={() => onCreateGame('online')}
              className="bg-slate-800 hover:bg-slate-700 p-5 rounded-[1.8rem] flex items-center justify-between group transition-all border border-slate-700 active:scale-95"
            >
              <div className="flex items-center gap-5 text-slate-300">
                <div className="bg-slate-900 p-3 rounded-2xl">
                  <Users size={28} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1 text-white">ONLINE PVP</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Juega con un amigo remoto</p>
                </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform opacity-50" />
            </button>
          </div>
        </div>

        {/* Sección 3: Unirse a Sala */}
        <div className="pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-3xl border border-slate-800 focus-within:border-indigo-500 transition-all">
            <input 
              value={roomIdInput} 
              onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
              placeholder="CÓDIGO DE SALA" 
              className="flex-1 bg-transparent p-4 outline-none font-mono text-center tracking-[0.4em] font-bold text-sm text-indigo-400 placeholder:text-slate-700 placeholder:tracking-normal"
            />
            <button 
              onClick={onJoinGame}
              disabled={!roomIdInput}
              className="bg-slate-700 hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-white px-8 py-4 rounded-[1.4rem] font-black text-xs transition-all uppercase tracking-widest"
            >
              Unirse
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
        Vercel Edge Network • Google Gemini AI • Firebase Realtime
      </p>
    </div>
  );
};

export default Lobby;


