import React, { useState, useEffect } from 'react';
import { 
  doc, setDoc, onSnapshot, updateDoc, arrayUnion, getDoc 
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { LogOut, Sparkles } from 'lucide-react';

// Importación de configuración y datos
import { db, auth } from './firebase/config';
import { CATEGORIES } from './data/characters';

// Importación de Componentes Modulares
import Lobby from './components/Lobby';
import Board from './components/Board';
import Chat from './components/Chat';

// Variables de Entorno (Se configuran en Vercel)
const appId = import.meta.env.VITE_APP_ID || 'quien-es-quien-v1';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";

export default function App() {
  // --- ESTADOS GLOBALES ---
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [gameMode, setGameMode] = useState(null); 
  const [selectedCat, setSelectedCat] = useState('classic');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [eliminated, setEliminated] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. AUTENTICACIÓN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        signInAnonymously(auth).catch(err => console.error("Error Auth:", err));
      }
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. SINCRONIZACIÓN DE SALA ---
  useEffect(() => {
    if (!user || !roomIdInput || !gameMode) return;
    
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomIdInput);
    
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        setRoom(snap.data());
      }
    }, (err) => console.error("Error de conexión:", err));

    return () => unsubscribe();
  }, [user, roomIdInput, gameMode]);

  // --- 3. LÓGICA DE IA (GEMINI) ---
  const fetchGemini = async (prompt, system) => {
    // Implementación con reintentos (Exponential Backoff)
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: system }] }
          })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (e) {
        if (i === 2) throw e;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  };

  // --- 4. GESTIÓN DE TURNOS ---
  const handleTurn = async (userMsg) => {
    if (!userMsg.trim() || loading || !room) return;
    setLoading(true);

    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', room.id);
    const currentItems = CATEGORIES[room.category].items;

    try {
      if (room.mode === 'ai') {
        // La IA responde al usuario
        const sysAns = `Estás jugando ¿Quién es Quién?. Categoría: ${CATEGORIES[room.category].name}. Tu personaje secreto es: ${JSON.stringify(room.p2Secret)}. Responde SOLO "SI" o "NO" a la pregunta del usuario. Si adivina el nombre correctamente, di "¡SI, HAS GANADO!".`;
        const aiAnswer = await fetchGemini(userMsg, sysAns);

        // La IA hace su pregunta estratégica
        const sysQuest = `Eres un estratega experto en ${CATEGORIES[room.category].name}. Estos son todos los personajes: ${JSON.stringify(currentItems)}. Haz una pregunta inteligente para descartar opciones. Responde SOLO con la pregunta.`;
        const aiQuestion = await fetchGemini("Haz tu pregunta de turno.", sysQuest);

        await updateDoc(roomRef, {
          logs: arrayUnion(
            { sender: 'Tú', text: userMsg },
            { sender: 'IA', text: `Respuesta: ${aiAnswer}` },
            { sender: 'IA', text: aiQuestion }
          ),
          turn: user.uid // En modo IA, el turno vuelve al usuario después de la respuesta de la IA
        });
      } else {
        // Modo Multijugador (PVP)
        const isP1 = room.players[0] === user.uid;
        const nextTurn = room.players.find(p => p !== user.uid);
        
        await updateDoc(roomRef, {
          logs: arrayUnion({ 
            sender: isP1 ? 'Jugador 1' : 'Jugador 2', 
            text: userMsg 
          }),
          turn: nextTurn
        });
      }
    } catch (e) {
      console.error("Error en el turno:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- 5. CREACIÓN Y UNIÓN A PARTIDAS ---
  const createGame = async (mode) => {
    if (!user) return;
    const id = Math.random().toString(36).substring(7).toUpperCase();
    const items = CATEGORIES[selectedCat].items;
    const p1Secret = items[Math.floor(Math.random() * items.length)];
    const p2Secret = items[Math.floor(Math.random() * items.length)];

    const roomData = {
      id,
      mode,
      category: selectedCat,
      players: [user.uid],
      status: mode === 'ai' ? 'playing' : 'waiting',
      p1Secret,
      p2Secret,
      turn: user.uid,
      logs: [{ sender: 'Sistema', text: `¡Bienvenidos al multiverso de ${CATEGORIES[selectedCat].name}! Haz tu primera pregunta.` }]
    };

    setRoomIdInput(id);
    setGameMode(mode);
    setEliminated([]);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', id), roomData);
  };

  const joinGame = async () => {
    if (!user || !roomIdInput) return;
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomIdInput);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      const data = snap.data();
      if (data.players.length < 2 && !data.players.includes(user.uid)) {
        await updateDoc(ref, { 
          players: arrayUnion(user.uid), 
          status: 'playing',
          logs: arrayUnion({ sender: 'Sistema', text: '¡Jugador 2 se ha unido! Comienza el duelo.' })
        });
        setGameMode('online');
      } else if (data.players.includes(user.uid)) {
        setGameMode('online');
      }
    }
  };

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {!gameMode ? (
        /* VISTA DE LOBBY */
        <Lobby 
          categories={CATEGORIES}
          selectedCat={selectedCat}
          onSelectCat={setSelectedCat}
          onCreateGame={createGame}
          onJoinGame={joinGame}
          roomIdInput={roomIdInput}
          setRoomIdInput={setRoomIdInput}
        />
      ) : (
        /* VISTA DE JUEGO ACTIVO */
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
          
          {/* Columna 1: Info Jugador */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
               <div className="relative">
                 <img 
                   src={room?.category === 'brands' 
                     ? `https://logo.clearbit.com/${(room?.players[0] === user.uid ? room?.p1Secret : room?.p2Secret)?.name.toLowerCase()}.com`
                     : `https://api.dicebear.com/7.x/avataaars/svg?seed=${(room?.players[0] === user.uid ? room?.p1Secret : room?.p2Secret)?.name}`
                   }
                   className="w-32 h-32 bg-slate-800 rounded-[2rem] border-4 border-indigo-500/20 p-2 object-contain"
                   alt="Secreto"
                 />
                 <div className="absolute -bottom-2 bg-indigo-600 px-4 py-1 rounded-full text-[9px] font-black uppercase shadow-xl ring-4 ring-slate-900">
                   TU CARTA
                 </div>
               </div>
               <div className="text-center">
                 <h2 className="text-2xl font-black text-white italic tracking-tighter">
                   {(room?.players[0] === user.uid ? room?.p1Secret : room?.p2Secret)?.name}
                 </h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                   {CATEGORIES[room?.category]?.name}
                 </p>
               </div>
               <button 
                 onClick={() => {setGameMode(null); setRoom(null);}} 
                 className="flex items-center gap-2 text-[10px] font-black text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-widest"
               >
                 <LogOut size={12} /> Abandonar
               </button>
            </div>

            <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${room?.turn === user.uid ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                <span className="text-xs font-bold uppercase tracking-tighter">
                  {room?.turn === user.uid ? 'Tu Turno' : 'Turno Rival'}
                </span>
              </div>
              <Sparkles size={14} className={room?.turn === user.uid ? 'text-indigo-400' : 'text-slate-700'} />
            </div>
          </div>

          {/* Columna 2: Tablero */}
          <div className="lg:col-span-6">
            <Board 
              items={CATEGORIES[room?.category]?.items || []}
              eliminated={eliminated}
              onToggle={(id) => setEliminated(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
              )}
              category={room?.category}
              onReset={() => setEliminated([])}
            />
          </div>

          {/* Columna 3: Chat */}
          <div className="lg:col-span-3">
            <Chat 
              logs={room?.logs}
              onSend={handleTurn}
              isTurn={room?.turn === user.uid}
              isLoading={loading}
            />
          </div>

        </div>
      )}
    </div>
  );
}

```
