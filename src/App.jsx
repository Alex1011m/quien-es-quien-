
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

// --- CONFIGURACIÓN DE FIREBASE (Tus datos reales) ---
const firebaseConfig = {
  apiKey: "AIzaSyBBe77umMs5vu5zq1Xr9YkJzH27a-sZdsc",
  authDomain: "quien-es-quien-8edf0.firebaseapp.com",
  projectId: "quien-es-quien-8edf0",
  storageBucket: "quien-es-quien-8edf0.firebasestorage.app",
  messagingSenderId: "798538692524",
  appId: "1:798538692524:web:1b807793f38956c7a02c09",
  measurementId: "G-6FZ9TK8V5G"
};

// Inicialización de servicios
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "quien-es-quien-8edf0"; 

// --- BASE DE DATOS: 60 ENTIDADES ---
const ALL_ENTITIES = [
  // --- MARCAS (20) ---
  { id: 1, name: "Coca-Cola", group: "marcas", category: "Bebida", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop" },
  { id: 2, name: "McDonald's", group: "marcas", category: "Comida", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=400&fit=crop" },
  { id: 3, name: "Apple", group: "marcas", category: "Tech", img: "https://images.unsplash.com/photo-1611186871348-b1ec696e5237?w=400&h=400&fit=crop" },
  { id: 4, name: "Nike", group: "marcas", category: "Ropa", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" },
  { id: 5, name: "Google", group: "marcas", category: "Tech", img: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&h=400&fit=crop" },
  { id: 6, name: "Ferrari", group: "marcas", category: "Autos", img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&h=400&fit=crop" },
  { id: 7, name: "Netflix", group: "marcas", category: "Streaming", img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop" },
  { id: 8, name: "Amazon", group: "marcas", category: "Tech", img: "https://images.unsplash.com/photo-1523474253046-2cd2c78b681f?w=400&h=400&fit=crop" },
  { id: 9, name: "Starbucks", group: "marcas", category: "Bebida", img: "https://images.unsplash.com/photo-1544333346-64666359942f?w=400&h=400&fit=crop" },
  { id: 10, name: "Disney", group: "marcas", category: "Cine", img: "https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?w=400&h=400&fit=crop" },
  { id: 11, name: "Tesla", group: "marcas", category: "Autos", img: "https://images.unsplash.com/photo-1617788131756-11394821a364?w=400&h=400&fit=crop" },
  { id: 12, name: "Spotify", group: "marcas", category: "Música", img: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop" },
  { id: 13, name: "Samsung", group: "marcas", category: "Tech", img: "https://images.unsplash.com/photo-1610945415295-d9baf0630d7f?w=400&h=400&fit=crop" },
  { id: 14, name: "Instagram", group: "marcas", category: "Social", img: "https://images.unsplash.com/photo-1611223235982-1f1e732a2882?w=400&h=400&fit=crop" },
  { id: 15, name: "TikTok", group: "marcas", category: "Social", img: "https://images.unsplash.com/photo-1596440225331-31365ea9ff88?w=400&h=400&fit=crop" },
  { id: 16, name: "Lego", group: "marcas", category: "Juguetes", img: "https://images.unsplash.com/photo-1560169897-bb333ef3df40?w=400&h=400&fit=crop" },
  { id: 17, name: "Adidas", group: "marcas", category: "Ropa", img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=400&fit=crop" },
  { id: 18, name: "Pepsi", group: "marcas", category: "Bebida", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop" },
  { id: 19, name: "Red Bull", group: "marcas", category: "Bebida", img: "https://images.unsplash.com/photo-1622543925917-763c34d1538c?w=400&h=400&fit=crop" },
  { id: 20, name: "Microsoft", group: "marcas", category: "Tech", img: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400&h=400&fit=crop" },

  // --- FAMOSOS (20) ---
  { id: 21, name: "Lionel Messi", group: "famosos", category: "Deportes", img: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&h=400&fit=crop" },
  { id: 22, name: "Cristiano Ronaldo", group: "famosos", category: "Deportes", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=400&fit=crop" },
  { id: 23, name: "Taylor Swift", group: "famosos", category: "Música", img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop" },
  { id: 24, name: "Shakira", group: "famosos", category: "Música", img: "https://images.unsplash.com/photo-1520155707862-5b32817388d6?w=400&h=400&fit=crop" },
  { id: 25, name: "Elon Musk", group: "famosos", category: "Tech", img: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop" },
  { id: 26, name: "Brad Pitt", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
  { id: 27, name: "Rihanna", group: "famosos", category: "Música", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { id: 28, name: "Beyoncé", group: "famosos", category: "Música", img: "https://images.unsplash.com/photo-1570158268183-d296b2892211?w=400&h=400&fit=crop" },
  { id: 29, name: "Robert Downey Jr.", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { id: 30, name: "Tom Cruise", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" },
  { id: 31, name: "Zendaya", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1531746020798-e795c5399c47?w=400&h=400&fit=crop" },
  { id: 32, name: "Bad Bunny", group: "famosos", category: "Música", img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400&h=400&fit=crop" },
  { id: 33, name: "Jennifer Aniston", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" },
  { id: 34, name: "LeBron James", group: "famosos", category: "Deportes", img: "https://images.unsplash.com/photo-1505235687559-289547c1f01d?w=400&h=400&fit=crop" },
  { id: 35, name: "Will Smith", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" },
  { id: 36, name: "Michael Jordan", group: "famosos", category: "Deportes", img: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=400&fit=crop" },
  { id: 37, name: "Leonardo DiCaprio", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
  { id: 38, name: "Rosalía", group: "famosos", category: "Música", img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop" },
  { id: 39, name: "Dwayne Johnson", group: "famosos", category: "Cine", img: "https://images.unsplash.com/photo-1520156555701-bc3077755b40?w=400&h=400&fit=crop" },
  { id: 40, name: "Mark Zuckerberg", group: "famosos", category: "Tech", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },

  // --- FICCIÓN / CARTOONS (20) ---
  { id: 41, name: "Mordecai", group: "ficcion", category: "Un Show Más", img: "https://via.placeholder.com/400?text=Mordecai" },
  { id: 42, name: "Rigby", group: "ficcion", category: "Un Show Más", img: "https://via.placeholder.com/400?text=Rigby" },
  { id: 43, name: "Dipper Pines", group: "ficcion", category: "Gravity Falls", img: "https://via.placeholder.com/400?text=Dipper" },
  { id: 44, name: "Mabel Pines", group: "ficcion", category: "Gravity Falls", img: "https://via.placeholder.com/400?text=Mabel" },
  { id: 45, name: "Bill Cipher", group: "ficcion", category: "Gravity Falls", img: "https://via.placeholder.com/400?text=Bill+Cipher" },
  { id: 46, name: "Finn el Humano", group: "ficcion", category: "Hora de Aventura", img: "https://via.placeholder.com/400?text=Finn" },
  { id: 47, name: "Jake el Perro", group: "ficcion", category: "Hora de Aventura", img: "https://via.placeholder.com/400?text=Jake" },
  { id: 48, name: "Marceline", group: "ficcion", category: "Hora de Aventura", img: "https://via.placeholder.com/400?text=Marceline" },
  { id: 49, name: "Bombón", group: "ficcion", category: "Chicas Superpoderosas", img: "https://via.placeholder.com/400?text=Bombon" },
  { id: 50, name: "Burbuja", group: "ficcion", category: "Chicas Superpoderosas", img: "https://via.placeholder.com/400?text=Burbuja" },
  { id: 51, name: "Bellota", group: "ficcion", category: "Chicas Superpoderosas", img: "https://via.placeholder.com/400?text=Bellota" },
  { id: 52, name: "Luz Noceda", group: "ficcion", category: "The Owl House", img: "https://via.placeholder.com/400?text=Luz+Noceda" },
  { id: 53, name: "Eda Clawthorne", group: "ficcion", category: "The Owl House", img: "https://via.placeholder.com/400?text=Eda" },
  { id: 54, name: "King", group: "ficcion", category: "The Owl House", img: "https://via.placeholder.com/400?text=King" },
  { id: 55, name: "Anne Boonchuy", group: "ficcion", category: "Amphibia", img: "https://via.placeholder.com/400?text=Anne" },
  { id: 56, name: "Marcy Wu", group: "ficcion", category: "Amphibia", img: "https://via.placeholder.com/400?text=Marcy" },
  { id: 57, name: "Sasha Waybright", group: "ficcion", category: "Amphibia", img: "https://via.placeholder.com/400?text=Sasha" },
  { id: 58, name: "Gumball Watterson", group: "ficcion", category: "Gumball", img: "https://via.placeholder.com/400?text=Gumball" },
  { id: 59, name: "Steven Universe", group: "ficcion", category: "Steven Universe", img: "https://via.placeholder.com/400?text=Steven" },
  { id: 60, name: "Ben 10", group: "ficcion", category: "Ben 10", img: "https://via.placeholder.com/400?text=Ben+10" },
];

const CATEGORIES = [
  { id: 'variado', name: 'Variado', icon: <Layers size={24} /> },
  { id: 'marcas', name: 'Marcas', icon: <Building2 size={24} /> },
  { id: 'famosos', name: 'Famosos', icon: <Star size={24} /> },
  { id: 'ficcion', name: 'Ficción/Cartoons', icon: <Users size={24} /> },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [gameState, setGameState] = useState('menu');
  const [roomCode, setRoomCode] = useState("");
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('variado');
  const [mySecretEntity, setMySecretEntity] = useState(null);
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
        if (data.p1_secret && data.p2_secret && gameState === 'picking') {
          setGameState('playing');
          const secretId = user.uid === data.player1 ? data.p1_secret : data.p2_secret;
          setMySecretEntity(ALL_ENTITIES.find(e => e.id === secretId));
        }
        if (data.winner) setGameResult(data.winner === user.uid ? 'won' : 'lost');
      }
    });
    return () => unsubscribe();
  }, [user, roomCode, gameState]);

  const filteredEntities = useMemo(() => {
    return selectedGroup === 'variado' ? ALL_ENTITIES : ALL_ENTITIES.filter(e => e.group === selectedGroup);
  }, [selectedGroup]);

  const createRoom = async (category) => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, 'rooms', code);
    await setDoc(roomRef, {
      code, player1: user.uid, player2: null, category,
      p1_secret: null, p2_secret: null, turn: user.uid,
      lastQuestion: null, lastAnswer: null, createdAt: Date.now()
    });
    setSelectedGroup(category);
    setRoomCode(code);
    setGameState('lobby');
  };

  const joinRoom = async (code) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    const roomRef = doc(db, 'rooms', cleanCode);
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
      setErrorMsg("Sala no encontrada.");
    }
  };

  const handlePickSecret = async (id) => {
    const roomRef = doc(db, 'rooms', roomCode);
    const isP1 = user.uid === currentGame?.player1;
    await updateDoc(roomRef, { [isP1 ? 'p1_secret' : 'p2_secret']: id });
  };

  const sendQuestion = async (text) => {
    if (!text.trim() || currentGame?.turn !== user.uid) return;
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
    if (!id || !currentGame) return;
    const roomRef = doc(db, 'rooms', roomCode);
    const enemySecret = user.uid === currentGame.player1 ? currentGame.p2_secret : currentGame.p1_secret;
    await updateDoc(roomRef, { winner: id === enemySecret ? user.uid : (user.uid === currentGame.player1 ? currentGame.player2 : currentGame.player1) });
  };

  if (isAuthLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-bold uppercase text-xs tracking-widest">
      <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-4" />
      Cargando...
    </div>
  );

  if (gameState === 'menu') return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <h1 className="text-6xl font-black italic tracking-tighter text-yellow-400 mb-12 uppercase">Pop Duel</h1>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800 shadow-xl">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-white"><Star className="text-yellow-400" size={20}/> Crear Sala</h2>
          <div className="grid grid-cols-2 gap-3 text-white">
            {CATEGORIES.map(c => <button key={c.id} onClick={() => createRoom(c.id)} className="bg-slate-800 hover:bg-yellow-400 hover:text-black p-4 rounded-2xl transition-all font-black text-[10px] uppercase border-2 border-transparent hover:border-white">{c.name}</button>)}
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800 shadow-xl text-white">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-widest"><LogIn className="text-yellow-400" size={20}/> Unirse</h2>
          <div className="space-y-4">
            <input type="text" placeholder="CÓDIGO" className="w-full bg-slate-950 border-2 border-slate-700 p-4 rounded-2xl text-center font-black uppercase text-xl text-white outline-none focus:border-yellow-400" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} />
            <button onClick={() => joinRoom(roomCode)} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all tracking-widest">Entrar</button>
            {errorMsg && <p className="text-red-400 text-[10px] font-bold text-center uppercase tracking-widest">{errorMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if (gameState === 'lobby') return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
      <div className="bg-slate-900 p-12 rounded-[3.5rem] border-4 border-yellow-400 max-w-md w-full shadow-2xl">
        <Loader2 size={48} className="mx-auto text-yellow-400 mb-6 animate-spin" />
        <h2 className="text-3xl font-black italic mb-8 uppercase tracking-tighter">Esperando Rival</h2>
        <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 flex items-center justify-between gap-4 mb-8 text-white">
          <span className="text-5xl font-black text-yellow-400 tracking-widest">{roomCode}</span>
          <button onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={copied ? "p-3 rounded-xl bg-green-500 text-white" : "p-3 rounded-xl bg-slate-800 text-slate-400"}>
            {copied ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
          </button>
        </div>
        <button onClick={() => setGameState('menu')} className="text-slate-600 font-bold text-xs uppercase hover:text-white transition-colors">Abandonar</button>
      </div>
    </div>
  );

  if (gameState === 'picking') {
    const pickedId = (user.uid === currentGame?.player1) ? currentGame?.p1_secret : currentGame?.p2_secret;
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-center flex flex-col items-center">
        <h2 className="text-4xl font-black italic text-slate-900 uppercase mb-4 tracking-tighter">Elige tu Secreto</h2>
        <p className="text-slate-400 text-xs font-bold uppercase mb-10 tracking-widest">Tu rival deberá adivinar este personaje</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {filteredEntities.map(item => (
            <button key={item.id} disabled={!!pickedId} onClick={() => handlePickSecret(item.id)} className={pickedId === item.id ? "relative h-52 rounded-2xl border-4 border-yellow-400 scale-105 shadow-2xl overflow-hidden bg-white" : "relative h-52 rounded-2xl border-4 border-white opacity-60 hover:opacity-100 overflow-hidden transition-all bg-white"}>
              <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] font-black text-white uppercase">{item.name}</div>
            </button>
          ))}
        </div>
        {pickedId && <div className="mt-12 p-8 bg-indigo-600 rounded-[2.5rem] text-white font-black text-xl uppercase italic animate-pulse shadow-xl tracking-tighter">Esperando al oponente...</div>}
      </div>
    );
  }

  const isMyTurn = currentGame?.turn === user?.uid;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden">
      <div className="flex-grow p-4 lg:p-10 h-screen overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
          <button onClick={() => window.location.reload()} className="text-slate-400 font-black text-[9px] uppercase flex items-center gap-1 hover:text-red-500 transition-colors"><ArrowLeft size={14}/> Salir</button>
          <div className="flex items-center gap-3">
            <div className={isMyTurn ? "w-3 h-3 rounded-full bg-green-500 animate-ping" : "w-3 h-3 rounded-full bg-slate-300"}></div>
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">{isMyTurn ? "Tu Turno" : "Turno del Rival"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredEntities.map(item => (
            <div key={item.id} onClick={() => setFlippedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} className={flippedIds.includes(item.id) ? "relative h-48 opacity-20 grayscale scale-95 blur-[2px] transition-all cursor-pointer" : "relative h-48 bg-white rounded-2xl shadow-md border-2 border-white transition-all overflow-hidden cursor-pointer hover:scale-105"}>
              <img src={item.img} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 text-center text-[10px] font-black uppercase truncate tracking-tighter text-slate-800">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[22rem] bg-white border-l p-6 flex flex-col shadow-2xl h-screen">
        <div className="mb-6 bg-slate-900 p-5 rounded-[2.5rem] text-white flex items-center gap-4 border-b-8 border-yellow-400 shadow-xl">
          <img src={mySecretEntity?.img} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tu Identidad</p>
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">{mySecretEntity?.name}</h3>
          </div>
        </div>

        {currentGame?.lastQuestion && !currentGame?.lastAnswer && !isMyTurn && (
          <div className="mb-6 bg-yellow-400 p-6 rounded-[2rem] text-black shadow-2xl animate-bounce border-2 border-yellow-500">
            <p className="text-[10px] font-black uppercase mb-1 opacity-60 tracking-widest text-center">Te preguntan:</p>
            <p className="text-lg font-black italic mb-5 leading-tight text-center">"{currentGame.lastQuestion}"</p>
            <div className="flex gap-2">
              <button onClick={() => sendAnswer("SÍ")} className="flex-grow bg-black text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-md">SÍ</button>
              <button onClick={() => sendAnswer("NO")} className="flex-grow bg-white text-black py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all border border-black/10 shadow-md">NO</button>
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto mb-6 space-y-3 custom-scrollbar pr-1">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-10">
               <HelpCircle size={48} className="mb-4" />
               <p className="text-xs font-black uppercase tracking-widest text-center">Hazle una pregunta a tu oponente</p>
            </div>
          )}
          {chatHistory.map((h, i) => (
            <div key={i} className={h.a === 'SÍ' ? "p-4 rounded-3xl border-2 bg-green-50 border-green-100 shadow-sm" : h.a === 'NO' ? "p-4 rounded-3xl border-2 bg-red-50 border-red-100 shadow-sm" : "p-4 rounded-3xl border-2 bg-slate-50 border-slate-100 shadow-sm"}>
              <p className="text-[11px] font-bold text-slate-800 leading-snug">"{h.q}"</p>
              <p className={h.a === 'SÍ' ? "text-[10px] font-black uppercase text-green-600 mt-2" : h.a === 'NO' ? "text-[10px] font-black uppercase text-red-600 mt-2" : "text-[10px] font-black uppercase text-slate-400 mt-2"}>RESPUESTA: {h.a}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <input disabled={!isMyTurn} type="text" placeholder={isMyTurn ? "Escribe tu pregunta..." : "Espera tu turno..."} className="w-full bg-slate-100 p-5 rounded-[2rem] text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-500 disabled:opacity-50 transition-all shadow-inner text-slate-900" onKeyPress={e => { if(e.key === 'Enter' && e.target.value.trim()){ sendQuestion(e.target.value); e.target.value = ""; }}} />
          <div className="bg-slate-900 p-4 rounded-[2.5rem] border-b-8 border-yellow-400 shadow-xl">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-2 text-center tracking-[0.2em]">Adivina el Personaje</p>
            <select disabled={!isMyTurn} onChange={e => { if(e.target.value) resolveGame(parseInt(e.target.value)); }} className="w-full bg-slate-900 text-white p-3 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer focus:text-yellow-400 transition-colors">
              <option value="">¿QUIÉN ES?</option>
              {filteredEntities.map(e => <option key={e.id} value={e.id} className="text-white">{e.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {gameResult && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-6 backdrop-blur-xl animate-in">
          <div className={gameResult === 'won' ? "bg-green-600 p-12 rounded-[4rem] text-center text-white shadow-2xl border-4 border-green-400 scale-in" : "bg-red-600 p-12 rounded-[4rem] text-center text-white shadow-2xl border-4 border-red-400 scale-in"}>
            <div className="mb-6 flex justify-center">
               {gameResult === 'won' ? <CheckCircle2 size={80} /> : <XCircle size={80} />}
            </div>
            <h2 className="text-6xl font-black italic mb-2 uppercase tracking-tighter text-white">{gameResult === 'won' ? '¡Ganaste!' : '¡Perdiste!'}</h2>
            <button onClick={() => window.location.reload()} className="w-full bg-white text-slate-900 py-5 rounded-3xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:bg-slate-100">Volver al Inicio</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .scale-in { animation: scale-in 0.3s ease-out; }
      `}} />
    </div>
  );
}
