import React, { useState, useEffect } from 'react';
import { 
  doc, setDoc, onSnapshot, updateDoc, arrayUnion, getDoc 
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Importación de configuración y datos
import { db, auth } from './firebase/config';
import { CATEGORIES } from './data/characters';

// Importación de Componentes
import Lobby from './components/Lobby';
import Board from './components/Board';
import Chat from './components/Chat';

const appId = import.meta.env.VITE_APP_ID || 'quien-es-quien-v1';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";

export default function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [gameMode, setGameMode] = useState(null); 
  const [selectedCat, setSelectedCat] = useState('classic');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [eliminated, setEliminated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) signInAnonymously(auth).catch(console.error);
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !roomIdInput || !gameMode) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomIdInput);
    return onSnapshot(roomRef, (snap) => {
      if (snap.exists()) setRoom(snap.data());
    }, (err) => console.error("Error en Snapshot:", err));
  }, [user, roomIdInput, gameMode]);

  const fetchGemini = async (prompt, system) => {
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: system }] }
          })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } catch (e) {
        if (i === 2) throw e;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  };

  const handleTurn = async (userMsg) => {
    if (!userMsg.trim() || loading || !room) return;
    setLoading(true);
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', room.id);

    try {
      if (room.mode === 'ai') {
        const sysAns = `Juego Quien es Quien. Categoria: ${CATEGORIES[room.category].name}. Personaje Secreto: ${room.p2Secret.name}. Responde solo SI o NO.`;
        const aiAnswer = await fetchGemini(userMsg, sysAns);
        const aiQuestion = await fetchGemini("Haz una pregunta inteligente para descartar personajes.", "Eres un jugador experto de Quien es Quien.");

        await updateDoc(roomRef, {
          logs: arrayUnion(
            { sender: 'Tú', text: userMsg },
            { sender: 'IA', text: aiAnswer },
            { sender: 'IA', text: aiQuestion }
          ),
          turn: user.uid
        });
      } else {
        const isP1 = room.players[0] === user.uid;
        await updateDoc(roomRef, {
          logs: arrayUnion({ sender: isP1 ? 'Jugador 1' : 'Jugador 2', text: userMsg }),
          turn: room.players.find(p => p !== user.uid)
        });
      }
    } catch (e) { console.error("Error en turno:", e); }
    setLoading(false);
  };

  const createGame = async (mode) => {
    const id = Math.random().toString(36).substring(7).toUpperCase();
    const items = CATEGORIES[selectedCat].items;
    const p1 = items[Math.floor(Math.random() * items.length)];
    const p2 = items[Math.floor(Math.random() * items.length)];

    const data = {
      id, mode, category: selectedCat, players: [user.uid], status: 'playing',
      p1Secret: p1, p2Secret: p2, turn: user.uid,
      logs: [{ sender: 'Sistema', text: 'Partida iniciada.' }]
    };

    setRoomIdInput(id);
    setGameMode(mode);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', id), data);
  };

  const joinGame = async () => {
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomIdInput);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { players: arrayUnion(user.uid), status: 'playing' });
      setGameMode('online');
    }
  };

  if (!user) return <div className="flex items-center justify-center h-screen bg-slate-950 text-white font-bold">Conectando al Multiverso...</div>;

  const mySecret = room?.players[0] === user.uid ? room?.p1Secret : room?.p2Secret;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {!gameMode ? (
        <Lobby 
          categories={CATEGORIES} selectedCat={selectedCat} onSelectCat={setSelectedCat}
          onCreateGame={createGame} onJoinGame={joinGame} roomIdInput={roomIdInput} setRoomIdInput={setRoomIdInput}
        />
      ) : (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Mi Personaje */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-4">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 text-center">Tu Identidad Secreta</h2>
              <div className="bg-slate-800 rounded-3xl p-4 mb-4 aspect-square flex items-center justify-center overflow-hidden">
                <img 
                  src={room?.category === 'brands' ? `https://logo.clearbit.com/${mySecret?.name.toLowerCase()}.com` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${mySecret?.name}`}
                  className="w-full h-full object-contain"
                  alt="Secreto"
                />
              </div>
              <p className="text-xl font-black text-center text-indigo-400 uppercase tracking-tighter">{mySecret?.name}</p>
              <button 
                onClick={() => { setGameMode(null); setRoom(null); }} 
                className="w-full mt-8 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
              >
                Abandonar Partida
              </button>
            </div>
          </div>

          {/* Columna Central: Tablero */}
          <div className="lg:col-span-6">
            <Board 
              items={CATEGORIES[room?.category]?.items || []} eliminated={eliminated}
              onToggle={(id) => setEliminated(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
              category={room?.category} onReset={() => setEliminated([])}
            />
          </div>

          {/* Columna Derecha: Chat */}
          <div className="lg:col-span-3">
            <Chat 
              logs={room?.logs || []} 
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