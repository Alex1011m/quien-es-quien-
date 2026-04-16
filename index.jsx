```react
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  HelpCircle, RefreshCw, CheckCircle2, XCircle, Layout, Cpu, 
  Users, Star, Building2, Layers, ArrowLeft, Send, Copy, LogIn, Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, collection 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- BASE DE DATOS: 60 ENTIDADES ---
const ALL_ENTITIES = [
  // MARCAS
  { id: 1, name: "Coca-Cola", group: "marcas", category: "Bebida", color: "Rojo", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop" },
  { id: 2, name: "McDonald's", group: "marcas", category: "Comida", color: "Amarillo", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=400&fit=crop" },
  { id: 3, name: "Apple", group: "marcas", category: "Tech", color: "Blanco", img: "https://images.unsplash.com/photo-1611186871348-b1ec696e5237?w=400&h=400&fit=crop" },
  { id: 4, name: "Nike", group: "marcas", category: "Ropa", color: "Negro", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" },
  { id: 5, name: "Google", group: "marcas", category: "Tech", color: "Multicolor", img: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&h=400&fit=crop" },
  { id: 6, name: "Ferrari", group: "marcas", category: "Autos", color: "Rojo", img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&h=400&fit=crop" },
  { id: 7, name: "Netflix", group: "marcas", category: "Cine", color: "Rojo", img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop" },
  { id: 8, name: "Amazon", group: "marcas", category: "Tech", color: "Naranja", img: "https://images.unsplash.com/photo-1523474253046-2cd2c78b681f?w=400&h=400&fit=crop" },
  { id: 9, name: "Starbucks", group: "marcas", category: "Bebida", color: "Verde", img: "https://images.unsplash.com/photo-1544333346-64666359942f?w=400&h=400&fit=crop" },
  { id: 10, name: "Disney", group: "marcas", category: "Cine", color: "Azul", img: "https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?w=400&h=400&fit=crop" },
  // FAMOSOS
  { id: 21, name: "Brad Pitt", group: "famosos", category: "Cine", color: "Rubio", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
  { id: 22, name: "Messi", group: "famosos", category: "Deportes", color: "Castaño", img: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&h=400&fit=crop" },
  { id: 23, name: "Taylor Swift", group: "famosos", category: "Música", color: "Rubio", img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop" },
  { id: 24, name: "Elon Musk", group: "famosos", category: "Tech", color: "Castaño", img: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop" },
  { id: 25, name: "Shakira", group: "famosos", category: "Música", color: "Rubio", img: "https://images.unsplash.com/photo-1520155707862-5b32817388d6?w=400&h=400&fit=crop" },
  { id: 26, name: "Cristiano Ronaldo", group: "famosos", category: "Deportes", color: "Negro", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=400&fit=crop" },
  // FICCIÓN
  { id: 41, name: "Iron Man", group: "ficcion", category: "Héroe", color: "Rojo", img: "https://images.unsplash.com/photo-1623939012331-9b9391ba0b86?w=400&h=400&fit=crop" },
  { id: 42, name: "Harry Potter", group: "ficcion", category: "Mago", color: "Negro", img: "https://images.unsplash.com/photo-1598153346810-860daa814c4b?w=400&h=400&fit=crop" },
  { id: 43, name: "Spider-Man", group: "ficcion", category: "Héroe", color: "Rojo", img: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=400&fit=crop" },
  { id: 44, name: "Batman", group: "ficcion", category: "Héroe", color: "Negro", img: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=400&fit=crop" },
  { id: 45, name: "Barbie", group: "ficcion", category: "Icono", color: "Rosa", img: "https://images.unsplash.com/photo-1559124568-dfc6f130b063?w=400&h=400&fit=crop" },
  { id: 46, name: "Joker", group: "ficcion", category: "Villano", color: "Verde", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop" },
  // ... (puedes añadir los 60 aquí siguiendo el mismo formato)
];

const CATEGORIES = [
  { id: 'variado', name: 'Variado', icon: <Layers size={24} />, desc: 'Mix de todo el catálogo.' },
  { id: 'marcas', name: 'Marcas', icon: <Building2 size={24} />, desc: 'Empresas mundiales.' },
  { id: 'famosos', name: 'Famosos', icon: <Star size={24} />, desc: 'Estrellas reales.' },
  { id: 'ficcion', name: 'Ficción', icon: <Users size={24} />, desc: 'Personajes de fantasía.' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [gameState, setGameState] = useState('menu'); // menu, lobby, picking, playing
  const [roomCode, setRoomCode] = useState("");
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('variado');
  const [flippedIds, setFlippedIds] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // --- AUTENTICACIÓN ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- SINCRONIZACIÓN FIREBASE ---
  useEffect(() => {
    if (!user || !roomCode || gameState === 'menu') return;

    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentGame(data);
        
        // Transiciones automáticas
        if (data.player2 && gameState === 'lobby') setGameState('picking');
        if (data.p1_secret && data.p2_secret && gameState === 'picking') setGameState('playing');
        if (data.winner) setGameResult(data.winner === user.uid ? 'won' : 'lost');
      } else if (gameState !== 'menu') {
        setErrorMsg("La sala ha sido eliminada o no existe.");
        setGameState('menu');
      }
    }, (err) => console.error("Snapshot error:", err));

    return () => unsubscribe();
  }, [user, roomCode, gameState]);

  const filteredEntities = useMemo(() => {
    if (selectedGroup === 'variado') return ALL_ENTITIES;
    return ALL_ENTITIES.filter(e => e.group === selectedGroup);
  }, [selectedGroup]);

  // --- FUNCIONES DE JUEGO ---
  const copyRoomCode = () => {
    const el = document.createElement('textarea');
    el.value = roomCode;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createRoom = async (category) => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', code);
    
    try {
      await setDoc(roomRef, {
        code,
        player1: user.uid,
        player2: null,
        category,
        p1_secret: null,
        p2_secret: null,
        turn: user.uid,
        lastQuestion: null,
        lastAnswer: null,
        winner: null,
        createdAt: Date.now()
      });
      setSelectedGroup(category);
      setRoomCode(code);
      setGameState('lobby');
    } catch (err) {
      setErrorMsg("No se pudo crear la sala. Inténtalo de nuevo.");
    }
  };

  const joinRoom = async (code) => {
    if (!user || !code) return;
    const cleanCode = code.trim().toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', cleanCode);
    
    try {
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data();
        if (!data.player2 || data.player2 === user.uid) {
          await updateDoc(roomRef, { player2: user.uid });
          setSelectedGroup(data.category);
          setRoomCode(cleanCode);
          setGameState('picking');
        } else {
          setErrorMsg("La sala ya está llena.");
        }
      } else {
        setErrorMsg("Código de sala no encontrado.");
      }
    } catch (err) {
      setErrorMsg("Error al conectar con la sala.");
    }
  };

  const handlePickSecret = async (id) => {
    if (!user || !roomCode) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    const isP1 = user.uid === currentGame?.player1;
    await updateDoc(roomRef, { [isP1 ? 'p1_secret' : 'p2_secret']: id });
  };

  const sendQuestion = async (text) => {
    if (!user || !roomCode || currentGame?.turn !== user.uid || !text.trim()) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    
    await updateDoc(roomRef, {
      lastQuestion: text,
      lastAnswer: null,
      turn: user.uid === currentGame.player1 ? currentGame.player2 : currentGame.player1
    });

    setChatHistory(prev => [{ q: text, a: "...", mine: true }, ...prev]);
  };

  const sendAnswer = async (ans) => {
    if (!roomCode) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    await updateDoc(roomRef, { lastAnswer: ans });
    setChatHistory(prev => {
      const copy = [...prev];
      if (copy.length > 0) copy[0].a = ans;
      return copy;
    });
  };

  const resolveGame = async (id) => {
    if (!user || !roomCode || !id) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    const isP1 = user.uid === currentGame?.player1;
    const enemySecret = isP1 ? currentGame?.p2_secret : currentGame?.p1_secret;

    if (id === enemySecret) {
      await updateDoc(roomRef, { winner: user.uid });
    } else {
      await updateDoc(roomRef, { winner: isP1 ? currentGame.player2 : currentGame.player1 });
    }
  };

  // --- RENDERIZADO ---

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs">Iniciando Servidores...</p>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black italic tracking-tighter text-yellow-400">POP DUEL</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Online Guessing Game</p>
        </div>
        
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tight"><Star className="text-yellow-400" size={20}/> Crear Sala</h2>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => createRoom(c.id)}
                  className="bg-slate-800 hover:bg-yellow-400 hover:text-black p-4 rounded-2xl transition-all font-black text-[10px] uppercase border border-transparent hover:border-white shadow-lg"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tight"><LogIn className="text-yellow-400" size={20}/> Unirse</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="CÓDIGO DE SALA" 
                className="w-full bg-slate-950 border-2 border-slate-700 p-4 rounded-2xl text-center font-black uppercase tracking-widest focus:border-yellow-400 outline-none text-xl"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
              />
              <button 
                onClick={() => joinRoom(roomCode)}
                className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-300 active:scale-95 transition-all shadow-xl"
              >
                ENTRAR A LA SALA
              </button>
              {errorMsg && <p className="text-red-400 text-[10px] font-bold text-center uppercase">{errorMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 p-12 rounded-[3.5rem] border-4 border-yellow-400 text-center shadow-2xl max-w-md w-full">
          <Loader2 size={48} className="mx-auto text-yellow-400 mb-6 animate-spin" />
          <h2 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">Esperando Rival...</h2>
          <p className="text-slate-500 font-bold mb-8 text-sm leading-tight">Tu amigo debe usar este código para entrar a la partida:</p>
          <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 flex items-center justify-between gap-4 mb-8">
            <span className="text-5xl font-black text-yellow-400 tracking-widest">{roomCode}</span>
            <button onClick={copyRoomCode} className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {copied ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
            </button>
          </div>
          <button onClick={() => setGameState('menu')} className="text-slate-600 font-bold text-xs uppercase hover:text-white transition-colors">Abandonar Sala</button>
        </div>
      </div>
    );
  }

  if (gameState === 'picking') {
    const amIP1 = user?.uid === currentGame?.player1;
    const pickedId = amIP1 ? currentGame?.p1_secret : currentGame?.p2_secret;

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-10">
            <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">ELIGE TU PERSONAJE</h2>
            <p className="text-slate-400 font-bold text-sm">Este es el objetivo que tu rival debe adivinar</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {filteredEntities.map(item => (
              <button 
                key={item.id}
                disabled={!!pickedId}
                onClick={() => handlePickSecret(item.id)}
                className={`relative h-52 rounded-2xl border-4 transition-all overflow-hidden bg-white ${pickedId === item.id ? 'border-yellow-400 scale-105 shadow-2xl' : 'border-white hover:border-indigo-400 opacity-60 hover:opacity-100'}`}
              >
                <img src={item.img} className="w-full h-full object-cover" alt={item.name} onError={e => e.target.src = 'https://via.placeholder.com/400?text=Pop!'} />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 p-3 text-[9px] font-black text-white uppercase tracking-tighter">{item.name}</div>
              </button>
            ))}
          </div>
          {pickedId && (
            <div className="mt-12 p-8 bg-indigo-600 rounded-[2.5rem] text-white font-black text-xl uppercase italic shadow-2xl animate-pulse">
              Esperando al oponente...
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- INTERFAZ DE TABLERO JUGANDO ---
  const isMyTurn = currentGame?.turn === user?.uid;
  const amIP1 = user?.uid === currentGame?.player1;
  const mySecretId = amIP1 ? currentGame?.p1_secret : currentGame?.p2_secret;
  const mySecret = ALL_ENTITIES.find(e => e.id === mySecretId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      
      {/* Columna del Tablero */}
      <div className="flex-grow p-4 lg:p-10 h-screen overflow-y-auto scroll-thin">
        <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
          <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-red-500 font-black text-[9px] uppercase flex items-center gap-1 transition-all">
            <ArrowLeft size={14}/> Salir
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`}></div>
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">
                {isMyTurn ? "Es tu turno de preguntar" : "El rival está pensando..."}
              </span>
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase hidden sm:block">SALA: {roomCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredEntities.map(item => (
            <div 
              key={item.id}
              onClick={() => {
                if (gameResult) return;
                setFlippedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
              }}
              className={`relative h-48 md:h-56 cursor-pointer transition-all duration-300 ${flippedIds.includes(item.id) ? 'opacity-20 grayscale scale-95 blur-[2px]' : 'hover:scale-[1.03] hover:z-10'}`}
            >
              <div className={`h-full w-full rounded-2xl overflow-hidden shadow-md border-2 bg-white flex flex-col ${flippedIds.includes(item.id) ? 'border-slate-300' : 'border-white'}`}>
                <img src={item.img} className="w-full h-full object-cover" alt="" onError={e => e.target.src = 'https://via.placeholder.com/400?text=Pop!'} />
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 text-center border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase truncate text-slate-800 tracking-tighter">{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra Lateral de Control */}
      <div className="w-full lg:w-[22rem] bg-white border-l border-slate-200 flex flex-col p-6 shadow-2xl z-10">
        
        {/* Tu Personaje Secreto */}
        <div className="mb-6 bg-slate-900 p-5 rounded-[2.5rem] text-white flex items-center gap-4 border-b-8 border-yellow-400 shadow-xl">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0">
            <img src={mySecret?.img} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Tu Identidad</p>
            <h3 className="text-xl font-black italic tracking-tighter leading-none">{mySecret?.name}</h3>
          </div>
        </div>

        {/* Panel de Respuesta (Cuando te preguntan) */}
        {currentGame?.lastQuestion && !currentGame?.lastAnswer && !isMyTurn && (
          <div className="mb-6 bg-yellow-400 p-6 rounded-[2rem] text-black shadow-2xl animate-bounce">
            <p className="text-[9px] font-black mb-1 opacity-60 uppercase tracking-widest text-center">EL RIVAL TE PREGUNTA:</p>
            <p className="text-lg font-black italic mb-5 text-center leading-tight">"{currentGame.lastQuestion}"</p>
            <div className="flex gap-2">
              <button onClick={() => sendAnswer("SÍ")} className="flex-grow bg-black text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-md">SÍ</button>
              <button onClick={() => sendAnswer("NO")} className="flex-grow bg-white text-black py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-md">NO</button>
            </div>
          </div>
        )}

        {/* Historial de Pistas */}
        <div className="flex-grow overflow-y-auto mb-6 scroll-thin space-y-3 px-1">
          {chatHistory.length === 0 && (
            <div className="text-center py-16 opacity-10">
              <HelpCircle size={64} className="mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Inicia el duelo</p>
            </div>
          )}
          {chatHistory.map((h, i) => (
            <div key={i} className={`p-4 rounded-3xl border-2 transition-all ${h.a === 'SÍ' ? 'bg-green-50 border-green-100 shadow-sm' : h.a === 'NO' ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pregunta:</p>
                {h.a === "..." && <Loader2 size={10} className="animate-spin text-indigo-400"/>}
              </div>
              <p className="text-[11px] font-bold text-slate-800 leading-tight mb-2">"{h.q}"</p>
              <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center">
                 <span className={`text-[10px] font-black uppercase ${h.a === 'SÍ' ? 'text-green-600' : h.a === 'NO' ? 'text-red-600' : 'text-slate-400'}`}>
                   RESPUESTA: {h.a}
                 </span>
              </div>
            </div>
          ))}
        </div>

        {/* Controles de Acción */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="relative group">
            <input 
              disabled={!isMyTurn || !!gameResult}
              type="text" 
              placeholder={isMyTurn ? "Escribe tu pregunta..." : "Espera la respuesta..."}
              className="w-full bg-slate-100 p-5 rounded-[2rem] text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-500 disabled:opacity-50 pr-14 shadow-inner"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  sendQuestion(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <button 
              disabled={!isMyTurn || !!gameResult}
              onClick={() => {
                const input = document.querySelector('input[type="text"]');
                sendQuestion(input.value);
                input.value = "";
              }}
              className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-30 shadow-lg active:scale-90 transition-all"
            >
              <Send size={18}/>
            </button>
          </div>
          
          <div className="bg-slate-950 p-5 rounded-[2.5rem] border-b-8 border-indigo-700 shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-3 text-center tracking-[0.2em]">¿Estás seguro? Adivina:</p>
            <select 
              disabled={!isMyTurn || !!gameResult}
              onChange={e => resolveGame(parseInt(e.target.value))}
              className="w-full bg-slate-900 text-white p-4 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-yellow-400 transition-all cursor-pointer"
            >
              <option value="">-- SELECCIONAR PERSONAJE --</option>
              {filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Pantalla de Fin de Juego */}
      {gameResult && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-6 backdrop-blur-xl">
          <div className={`max-w-md w-full p-12 rounded-[4rem] text-center shadow-2xl animate-in zoom-in duration-500 border-4 ${gameResult === 'won' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
            <div className="mb-8 flex justify-center drop-shadow-lg">
              {gameResult === 'won' ? <CheckCircle2 size={120} color="white"/> : <XCircle size={120} color="white"/>}
            </div>
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
              {gameResult === 'won' ? '¡GANASTE!' : '¡PERDISTE!'}
            </h2>
            <p className="text-white/90 font-bold mb-10 text-xs tracking-[0.3em] uppercase">
              {gameResult === 'won' ? 'Duelo de mentes superado' : 'Tu rival ha sido más astuto'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-slate-900 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-[1.05] transition-all active:scale-95 shadow-2xl border-b-4 border-slate-200"
            >
              VOLVER AL MENÚ PRINCIPAL
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .scroll-thin::-webkit-scrollbar { width: 4px; }
        .scroll-thin::-webkit-scrollbar-track { background: transparent; }
        .scroll-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: zoom-in 0.4s ease-out; }
      `}} />
    </div>
  );
}

```
