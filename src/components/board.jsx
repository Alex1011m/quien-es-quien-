
import React from 'react';
import { X, RotateCcw } from 'lucide-react';

/**
 * @param {Array} items - Lista de personajes de la categoría actual
 * @param {Array} eliminated - IDs de personajes descartados
 * @param {Function} onToggle - Función para descartar/activar
 * @param {String} category - Categoría actual (para lógica de imágenes)
 * @param {Function} onReset - Función para limpiar el tablero
 */
const Board = ({ items, eliminated, onToggle, category, onReset }) => {
  
  // Función para obtener la URL de la imagen según la categoría
  const getImageUrl = (item) => {
    if (category === 'brands') {
      // Usamos Clearbit para logos de marcas
      return `https://logo.clearbit.com/${item.name.toLowerCase().replace(/\s/g, '')}.com`;
    }
    // Usamos DiceBear para personajes (estilo avatares)
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de herramientas del tablero */}
      <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-800">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Tablero de Deducción
        </span>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-white transition-colors uppercase"
        >
          <RotateCcw size={12} /> Reiniciar
        </button>
      </div>

      {/* Grid Responsivo */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 h-[65vh] lg:h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => {
          const isEliminated = eliminated.includes(item.id);
          
          return (
            <div 
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`relative group cursor-pointer transition-all duration-300 transform ${
                isEliminated 
                  ? 'opacity-10 grayscale scale-90 rotate-1' 
                  : 'hover:-translate-y-2 active:scale-95'
              }`}
            >
              {/* Card Container */}
              <div className={`bg-slate-900 border-2 rounded-[1.5rem] p-2 flex flex-col items-center gap-2 transition-colors ${
                isEliminated 
                  ? 'border-transparent' 
                  : 'border-slate-800 group-hover:border-indigo-500 shadow-xl'
              }`}>
                
                {/* Image Wrap */}
                <div className="w-full aspect-square bg-slate-800 rounded-2xl overflow-hidden relative">
                  <img 
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      // Fallback por si falla Clearbit o la imagen
                      e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${item.name}`;
                    }}
                  />
                </div>

                {/* Name Label */}
                <span className={`text-[9px] font-black uppercase text-center w-full truncate tracking-tighter ${
                  isEliminated ? 'text-slate-700' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.name}
                </span>
              </div>

              {/* X Overlay cuando está eliminado */}
              {isEliminated && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <X className="text-red-600/40" size={48} strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estilo para la scrollbar personalizada */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default Board;
