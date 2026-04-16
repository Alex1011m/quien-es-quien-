import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, RefreshCw, CheckCircle2, XCircle, Layout, Cpu, 
  Users, Star, Building2, Layers, ArrowLeft, Send, Copy, LogIn, Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIGURACIÓN DE FIREBASE (REEMPLAZA CON TUS LLAVES) ---
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "pop-duel-game"; // ID interno para Firestore

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
];

const CATEGORIES = [
  { id: 'variado', name: 'Variado', icon: <Layers size={24} />, desc: 'Todo mezclado.' },
  { id: 'marcas', name: 'Marcas', icon: <Building2 size={24} />, desc: 'Empresas.' },
  { id: 'famosos', name: 'Famosos', icon: <Star size={24} />, desc: 'Celebridades.' },
  { id: 'ficcion', name: 'Ficción', icon: <Users size={24} />, desc: 'Personajes.' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [gameState, setGameState] = useState('menu');
  const [roomCode, setRoomCode] = useState("");
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('variado');
  const [flippedIds, setFlippedIds] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !roomCode || gameState === 'menu') return;
    const roomRef = doc(db, 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentGame(data);
        if (data.player2 && gameState === 'lobby') setGameState('picking');
        if (data.p1_secret && data.p2_secret && gameState === 'picking') setGameState('playing');
        if (data.winner) setGameResult(data.winner === user.uid ? 'won' : 'lost');
      }
    });
    return () => unsubscribe();
  }, [user, roomCode, gameState]);

  const filteredEntities = useMemo(() => {
    return selectedGroup === 'variado' ? ALL_ENTITIES : ALL_ENTITIES.filter(e => e.group === selectedGroup);
  }, [selectedGroup]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createRoom = async (category) => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, 'rooms', code);
    await setDoc(roomRef, {
      code, player1: user.uid, player2: null, category,
      p1_secret: null, p2_secret: null, turn: user.uid,
      lastQuestion: null, lastAnswer: null, winner: null
    });
    setSelectedGroup(category);
    setRoomCode(code);
    setGameState('lobby');
  };

  const joinRoom = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    const roomRef = doc(db, 'rooms', cleanCode);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      await updateDoc(roomRef, { player2: user.uid });
      setSelectedGroup(snap.data().category);
      setRoomCode(cleanCode);
      setGameState('picking');
    } else {
      setErrorMsg("No existe esa sala.");
    }
  };

  const handlePickSecret = async (id) => {
    const roomRef = doc(db, 'rooms', roomCode);
    const isP1 = user.uid === currentGame?.player1;
    await updateDoc(roomRef, { [isP1 ? 'p1_secret' : 'p2_secret']: id });
  };

  const sendQuestion = async (text) => {
    if (!text.trim()) return;
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      lastQuestion: text, lastAnswer: null,
      turn: user.uid === currentGame.player1 ? currentGame.player2 : currentGame.player1
    });
    setChatHistory(prev => [{ q: text, a: "...", mine: true }, ...prev]);
  };

  const sendAnswer = async (ans) => {
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, { lastAnswer: ans });
    setChatHistory(prev => {
      const copy = [...prev];
      if (copy.length > 0) copy[0].a = ans;
      return copy;
    });
  };

  const resolveGame = async (id) => {
    const roomRef = doc(db, 'rooms', roomCode);
    const isP1 = user.uid === currentGame?.player1;
    const enemySecret = isP1 ? currentGame?.p2_secret : currentGame?.p1_secret;
    await updateDoc(roomRef, { winner: id === enemySecret ? user.uid : (isP1 ? currentGame.player2 : currentGame.player1) });
  };

  if (isAuthLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold uppercase tracking-widest text-xs">Cargando...</div>;

  if (gameState === 'menu') return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <h1 className="text-6xl font-black italic tracking-tighter text-yellow-400 mb-12">POP DUEL</h1>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase"><Star className="text-yellow-400" size={20}/> Crear Sala</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(c => <button key={c.id} onClick={() => createRoom(c.id)} className="bg-slate-800 hover:bg-yellow-400 hover:text-black p-4 rounded-2xl transition-all font-black text-[10px] uppercase">{c.name}</button>)}
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase"><LogIn className="text-yellow-400" size={20}/> Unirse</h2>
          <div className="space-y-4">
            <input type="text" placeholder="CÓDIGO" className="w-full bg-slate-950 border-2 border-slate-700 p-4 rounded-2xl text-center font-black uppercase text-xl" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} />
            <button onClick={() => joinRoom(roomCode)} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase">ENTRAR</button>
            {errorMsg && <p className="text-red-400 text-[10px] font-bold text-center">{errorMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if (gameState === 'lobby') return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
      <div className="bg-slate-900 p-12 rounded-[3.5rem] border-4 border-yellow-400 max-w-md w-full">
        <Loader2 size={48} className="mx-auto text-yellow-400 mb-6 animate-spin" />
        <h2 className="text-3xl font-black italic mb-8 uppercase">ESPERANDO RIVAL</h2>
        <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 flex items-center justify-between gap-4 mb-8">
          <span className="text-5xl font-black text-yellow-400 tracking-widest">{roomCode}</span>
          <button onClick={copyRoomCode} className={copied ? "p-3 rounded-xl bg-green-500 text-white" : "p-3 rounded-xl bg-slate-800 text-slate-400"}>
            {copied ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
          </button>
        </div>
        <button onClick={() => setGameState('menu')} className="text-slate-600 font-bold text-xs uppercase hover:text-white">Abandonar</button>
      </div>
    </div>
  );

  if (gameState === 'picking') {
    const pickedId = (user.uid === currentGame?.player1) ? currentGame?.p1_secret : currentGame?.p2_secret;
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-center">
        <h2 className="text-4xl font-black italic text-slate-900 uppercase mb-10">ELIGE TU SECRETO</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {filteredEntities.map(item => (
            <button key={item.id} disabled={!!pickedId} onClick={() => handlePickSecret(item.id)} className={pickedId === item.id ? "relative h-52 rounded-2xl border-4 border-yellow-400 scale-105" : "relative h-52 rounded-2xl border-4 border-white opacity-60"}>
              <img src={item.img} className="w-full h-full object-cover rounded-xl" />
            </button>
          ))}
        </div>
        {pickedId && <div className="mt-12 p-8 bg-indigo-600 rounded-[2.5rem] text-white font-black text-xl uppercase italic animate-pulse">Esperando rival...</div>}
      </div>
    );
  }

  const isMyTurn = currentGame?.turn === user?.uid;
  const mySecret = ALL_ENTITIES.find(e => e.id === ((user.uid === currentGame?.player1) ? currentGame?.p1_secret : currentGame?.p2_secret));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      <div className="flex-grow p-4 lg:p-10 h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-[2rem] shadow-sm">
          <button onClick={() => window.location.reload()} className="text-slate-400 font-black text-[9px] uppercase flex items-center gap-1"><ArrowLeft size={14}/> Salir</button>
          <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`}></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredEntities.map(item => (
            <div key={item.id} onClick={() => setFlippedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} className={flippedIds.includes(item.id) ? "relative h-48 opacity-20 grayscale scale-95 blur-[2px]" : "relative h-48 bg-white rounded-2xl shadow-md border-2 border-white"}>
              <img src={item.img} className="w-full h-full object-cover rounded-xl" />
              <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 text-center text-[10px] font-black uppercase truncate">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[22rem] bg-white border-l p-6 flex flex-col shadow-2xl">
        <div className="mb-6 bg-slate-900 p-5 rounded-[2.5rem] text-white flex items-center gap-4 border-b-8 border-yellow-400">
          <img src={mySecret?.img} className="w-16 h-16 rounded-2xl object-cover border-2 border-white" />
          <h3 className="text-xl font-black italic">{mySecret?.name}</h3>
        </div>

        {currentGame?.lastQuestion && !currentGame?.lastAnswer && !isMyTurn && (
          <div className="mb-6 bg-yellow-400 p-6 rounded-[2rem] text-black shadow-2xl animate-bounce">
            <p className="text-lg font-black italic mb-5">"{currentGame.lastQuestion}"</p>
            <div className="flex gap-2">
              <button onClick={() => sendAnswer("SÍ")} className="flex-grow bg-black text-white py-3 rounded-2xl font-black">SÍ</button>
              <button onClick={() => sendAnswer("NO")} className="flex-grow bg-white text-black py-3 rounded-2xl font-black">NO</button>
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto mb-6 space-y-3">
          {chatHistory.map((h, i) => (
            <div key={i} className={h.a === 'SÍ' ? "p-4 rounded-3xl border-2 bg-green-50 border-green-100" : h.a === 'NO' ? "p-4 rounded-3xl border-2 bg-red-50 border-red-100" : "p-4 rounded-3xl border-2 bg-slate-50 border-slate-100"}>
              <p className="text-[11px] font-bold">"{h.q}"</p>
              <p className="text-[10px] font-black mt-2">RESPUESTA: {h.a}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <input disabled={!isMyTurn} type="text" placeholder="Pregunta..." className="w-full bg-slate-100 p-5 rounded-[2rem] text-xs font-bold outline-none" onKeyPress={e => { if(e.key === 'Enter'){ sendQuestion(e.target.value); e.target.value = ""; }}} />
          <select disabled={!isMyTurn} onChange={e => resolveGame(parseInt(e.target.value))} className="w-full bg-slate-900 text-white p-4 rounded-2xl text-[10px] font-black uppercase">
            <option value="">¿QUIÉN ES?</option>
            {filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {gameResult && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-6 backdrop-blur-xl">
          <div className={gameResult === 'won' ? "bg-green-600 p-12 rounded-[4rem] text-center text-white" : "bg-red-600 p-12 rounded-[4rem] text-center text-white"}>
            <h2 className="text-6xl font-black italic mb-4">{gameResult === 'won' ? '¡GANASTE!' : '¡PERDISTE!'}</h2>
            <button onClick={() => window.location.reload()} className="w-full bg-white text-slate-900 py-5 rounded-3xl font-black uppercase">VOLVER</button>
          </div>
        </div>
      )}
    </div>
  );
}