
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "quien-es-quien-v2"; 

// --- GRAN BASE DE DATOS (Más de 100 entidades) ---
const DATABASE = [
  // --- MARCAS (35 aprox) ---
  { id: "m1", name: "Coca-Cola", group: "marcas", img: "/assets/marcas/coca-cola.jpg" },
  { id: "m2", name: "McDonald's", group: "marcas", img: "/assets/marcas/mcdonalds.jpg" },
  { id: "m3", name: "Apple", group: "marcas", img: "/assets/marcas/apple.jpg" },
  { id: "m4", name: "Nike", group: "marcas", img: "/assets/marcas/nike.jpg" },
  { id: "m5", name: "Google", group: "marcas", img: "/assets/marcas/google.jpg" },
  { id: "m6", name: "Ferrari", group: "marcas", img: "/assets/marcas/ferrari.jpg" },
  { id: "m7", name: "Netflix", group: "marcas", img: "/assets/marcas/netflix.jpg" },
  { id: "m8", name: "Amazon", group: "marcas", img: "/assets/marcas/amazon.jpg" },
  { id: "m9", name: "Starbucks", group: "marcas", img: "/assets/marcas/starbucks.jpg" },
  { id: "m10", name: "Disney", group: "marcas", img: "/assets/marcas/disney.jpg" },
  { id: "m11", name: "Tesla", group: "marcas", img: "/assets/marcas/tesla.jpg" },
  { id: "m12", name: "Spotify", group: "marcas", img: "/assets/marcas/spotify.jpg" },
  { id: "m13", name: "Samsung", group: "marcas", img: "/assets/marcas/samsung.jpg" },
  { id: "m14", name: "Lego", group: "marcas", img: "/assets/marcas/lego.jpg" },
  { id: "m15", name: "Adidas", group: "marcas", img: "/assets/marcas/adidas.jpg" },
  { id: "m16", name: "Burger King", group: "marcas", img: "/assets/marcas/burgerking.jpg" },
  { id: "m17", name: "Nintendo", group: "marcas", img: "/assets/marcas/nintendo.jpg" },
  { id: "m18", name: "Sony", group: "marcas", img: "/assets/marcas/sony.jpg" },
  { id: "m19", name: "YouTube", group: "marcas", img: "/assets/marcas/youtube.jpg" },
  { id: "m20", name: "Puma", group: "marcas", img: "/assets/marcas/puma.jpg" },
  { id: "m21", name: "Rolex", group: "marcas", img: "/assets/marcas/rolex.jpg" },
  { id: "m22", name: "Gucci", group: "marcas", img: "/assets/marcas/gucci.jpg" },
  { id: "m23", name: "Ford", group: "marcas", img: "/assets/marcas/ford.jpg" },
  { id: "m24", name: "X (Twitter)", group: "marcas", img: "/assets/marcas/x.jpg" },
  { id: "m25", name: "WhatsApp", group: "marcas", img: "/assets/marcas/whatsapp.jpg" },
  { id: "m26", name: "IKEA", group: "marcas", img: "/assets/marcas/ikea.jpg" },
  { id: "m27", name: "Pepsi", group: "marcas", img: "/assets/marcas/pepsi.jpg" },
  { id: "m28", name: "Red Bull", group: "marcas", img: "/assets/marcas/redbull.jpg" },
  { id: "m29", name: "Visa", group: "marcas", img: "/assets/marcas/visa.jpg" },
  { id: "m30", name: "MasterCard", group: "marcas", img: "/assets/marcas/mastercard.jpg" },

  // --- FAMOSOS (35 aprox) ---
  { id: "f1", name: "Lionel Messi", group: "famosos", img: "/assets/famosos/messi.jpg" },
  { id: "f2", name: "Cristiano Ronaldo", group: "famosos", img: "/assets/famosos/cr7.jpg" },
  { id: "f3", name: "Taylor Swift", group: "famosos", img: "/assets/famosos/taylor.jpg" },
  { id: "f4", name: "Shakira", group: "famosos", img: "/assets/famosos/shakira.jpg" },
  { id: "f5", name: "Elon Musk", group: "famosos", img: "/assets/famosos/musk.jpg" },
  { id: "f6", name: "Brad Pitt", group: "famosos", img: "/assets/famosos/pitt.jpg" },
  { id: "f7", name: "Rihanna", group: "famosos", img: "/assets/famosos/rihanna.jpg" },
  { id: "f8", name: "Beyoncé", group: "famosos", img: "/assets/famosos/beyonce.jpg" },
  { id: "f9", name: "Robert Downey Jr.", group: "famosos", img: "/assets/famosos/rdj.jpg" },
  { id: "f10", name: "Tom Cruise", group: "famosos", img: "/assets/famosos/cruise.jpg" },
  { id: "f11", name: "Zendaya", group: "famosos", img: "/assets/famosos/zendaya.jpg" },
  { id: "f12", name: "Bad Bunny", group: "famosos", img: "/assets/famosos/badbunny.jpg" },
  { id: "f13", name: "LeBron James", group: "famosos", img: "/assets/famosos/lebron.jpg" },
  { id: "f14", name: "Will Smith", group: "famosos", img: "/assets/famosos/smith.jpg" },
  { id: "f15", name: "The Rock", group: "famosos", img: "/assets/famosos/rock.jpg" },
  { id: "f16", name: "Billie Eilish", group: "famosos", img: "/assets/famosos/billie.jpg" },
  { id: "f17", name: "Ariana Grande", group: "famosos", img: "/assets/famosos/ariana.jpg" },
  { id: "f18", name: "Lady Gaga", group: "famosos", img: "/assets/famosos/gaga.jpg" },
  { id: "f19", name: "Drake", group: "famosos", img: "/assets/famosos/drake.jpg" },
  { id: "f20", name: "Justin Bieber", group: "famosos", img: "/assets/famosos/bieber.jpg" },
  { id: "f21", name: "Emma Watson", group: "famosos", img: "/assets/famosos/emma.jpg" },
  { id: "f22", name: "Margot Robbie", group: "famosos", img: "/assets/famosos/margot.jpg" },
  { id: "f23", name: "Chris Hemsworth", group: "famosos", img: "/assets/famosos/chris.jpg" },
  { id: "f24", name: "Rosalía", group: "famosos", img: "/assets/famosos/rosalia.jpg" },
  { id: "f25", name: "Mark Zuckerberg", group: "famosos", img: "/assets/famosos/zuck.jpg" },
  { id: "f26", name: "Michael Jordan", group: "famosos", img: "/assets/famosos/jordan.jpg" },
  { id: "f27", name: "Leonardo DiCaprio", group: "famosos", img: "/assets/famosos/dicaprio.jpg" },
  { id: "f28", name: "Selena Gomez", group: "famosos", img: "/assets/famosos/selena.jpg" },

  // --- FICCIÓN / CARTOONS (45 aprox) ---
  // Un Show Más
  { id: "c1", name: "Mordecai", group: "ficcion", img: "/assets/ficcion/mordecai.jpg" },
  { id: "c2", name: "Rigby", group: "ficcion", img: "/assets/ficcion/rigby.jpg" },
  { id: "c3", name: "Benson", group: "ficcion", img: "/assets/ficcion/benson.jpg" },
  { id: "c4", name: "Skips", group: "ficcion", img: "/assets/ficcion/skips.jpg" },
  // Gravity Falls
  { id: "c5", name: "Dipper Pines", group: "ficcion", img: "/assets/ficcion/dipper.jpg" },
  { id: "c6", name: "Mabel Pines", group: "ficcion", img: "/assets/ficcion/mabel.jpg" },
  { id: "c7", name: "Stan Pines", group: "ficcion", img: "/assets/ficcion/stan.jpg" },
  { id: "c8", name: "Bill Cipher", group: "ficcion", img: "/assets/ficcion/bill.jpg" },
  // Hora de Aventura
  { id: "c9", name: "Finn", group: "ficcion", img: "/assets/ficcion/finn.jpg" },
  { id: "c10", name: "Jake", group: "ficcion", img: "/assets/ficcion/jake.jpg" },
  { id: "c11", name: "Marceline", group: "ficcion", img: "/assets/ficcion/marceline.jpg" },
  { id: "c12", name: "Dulce Princesa", group: "ficcion", img: "/assets/ficcion/princesa.jpg" },
  { id: "c13", name: "Rey Helado", group: "ficcion", img: "/assets/ficcion/reyhelado.jpg" },
  // Chicas Superpoderosas
  { id: "c14", name: "Bombón", group: "ficcion", img: "/assets/ficcion/bombon.jpg" },
  { id: "c15", name: "Burbuja", group: "ficcion", img: "/assets/ficcion/burbuja.jpg" },
  { id: "c16", name: "Bellota", group: "ficcion", img: "/assets/ficcion/bellota.jpg" },
  { id: "c17", name: "Mojo Jojo", group: "ficcion", img: "/assets/ficcion/mojojojo.jpg" },
  // Amphibia
  { id: "c18", name: "Anne Boonchuy", group: "ficcion", img: "/assets/ficcion/anne.jpg" },
  { id: "c19", name: "Sasha Waybright", group: "ficcion", img: "/assets/ficcion/sasha.jpg" },
  { id: "c20", name: "Marcy Wu", group: "ficcion", img: "/assets/ficcion/marcy.jpg" },
  { id: "c21", name: "Hop Pop", group: "ficcion", img: "/assets/ficcion/hoppop.jpg" },
  // La Casa Búho
  { id: "c22", name: "Luz Noceda", group: "ficcion", img: "/assets/ficcion/luz.jpg" },
  { id: "c23", name: "Eda Clawthorne", group: "ficcion", img: "/assets/ficcion/eda.jpg" },
  { id: "c24", name: "King", group: "ficcion", img: "/assets/ficcion/king.jpg" },
  { id: "c25", name: "Amity Blight", group: "ficcion", img: "/assets/ficcion/amity.jpg" },
  // Harry Potter
  { id: "c26", name: "Harry Potter", group: "ficcion", img: "/assets/ficcion/harry.jpg" },
  { id: "c27", name: "Hermione Granger", group: "ficcion", img: "/assets/ficcion/hermione.jpg" },
  { id: "c28", name: "Ron Weasley", group: "ficcion", img: "/assets/ficcion/ron.jpg" },
  { id: "c29", name: "Lord Voldemort", group: "ficcion", img: "/assets/ficcion/voldemort.jpg" },
  { id: "c30", name: "Albus Dumbledore", group: "ficcion", img: "/assets/ficcion/dumbledore.jpg" },
  { id: "c31", name: "Severus Snape", group: "ficcion", img: "/assets/ficcion/snape.jpg" },
  { id: "c32", name: "Draco Malfoy", group: "ficcion", img: "/assets/ficcion/draco.jpg" },
  // Extras
  { id: "c33", name: "Gumball", group: "ficcion", img: "/assets/ficcion/gumball.jpg" },
  { id: "c34", name: "Darwin", group: "ficcion", img: "/assets/ficcion/darwin.jpg" },
  { id: "c35", name: "Steven Universe", group: "ficcion", img: "/assets/ficcion/steven.jpg" },
  { id: "c36", name: "Ben 10", group: "ficcion", img: "/assets/ficcion/ben10.jpg" },
  { id: "c37", name: "Homer Simpson", group: "ficcion", img: "/assets/ficcion/homer.jpg" },
  { id: "c38", name: "Spider-Man", group: "ficcion", img: "/assets/ficcion/spiderman.jpg" },
  { id: "c39", name: "Batman", group: "ficcion", img: "/assets/ficcion/batman.jpg" },
  { id: "c40", name: "Iron Man", group: "ficcion", img: "/assets/ficcion/ironman.jpg" },
];

const CATEGORIES = [
  { id: 'variado', name: 'Variado', icon: <Layers size={24} />, desc: 'Todo mezclado.' },
  { id: 'marcas', name: 'Marcas', icon: <Building2 size={24} />, desc: 'Logos del mundo.' },
  { id: 'famosos', name: 'Famosos', icon: <Star size={24} />, desc: 'Personas reales.' },
  { id: 'ficcion', name: 'Ficción/Cartoons', icon: <Users size={24} />, desc: 'Series y pelis.' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [gameState, setGameState] = useState('menu');
  const [roomCode, setRoomCode] = useState("");
  const [currentGame, setCurrentGame] = useState(null);
  const [flippedIds, setFlippedIds] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Auth inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincronización Online
  useEffect(() => {
    if (!user || !roomCode || gameState === 'menu') return;

    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentGame(data);
        if (data.player2 && gameState === 'lobby') setGameState('picking');
        if (data.p1_secret && data.p2_secret && gameState === 'picking') setGameState('playing');
        if (data.winner) setGameResult(data.winner === user.uid ? 'won' : 'lost');
      }
    }, (err) => console.error("Firestore error:", err));

    return () => unsubscribe();
  }, [user, roomCode, gameState]);

  // Función para barajar y elegir 20
  const getRandom20 = (category) => {
    let pool = category === 'variado' ? DATABASE : DATABASE.filter(e => e.group === category);
    return pool.sort(() => 0.5 - Math.random()).slice(0, 20);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createRoom = async (category) => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', code);
    
    // Elegimos los 20 personajes para ESTA partida
    const selectedList = getRandom20(category);

    await setDoc(roomRef, {
      code,
      player1: user.uid,
      player2: null,
      category,
      entities: selectedList, // Guardamos la lista en la DB
      p1_secret: null,
      p2_secret: null,
      turn: user.uid,
      lastQuestion: null,
      lastAnswer: null,
      createdAt: Date.now()
    });
    
    setRoomCode(code);
    setGameState('lobby');
  };

  const joinRoom = async (code) => {
    if (!user || !code) return;
    const cleanCode = code.trim().toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', cleanCode);
    const snap = await getDoc(roomRef);

    if (snap.exists()) {
      const data = snap.data();
      if (!data.player2 || data.player2 === user.uid) {
        await updateDoc(roomRef, { player2: user.uid });
        setRoomCode(cleanCode);
        setGameState('picking');
      } else {
        setStatusMsg("La sala está llena.");
      }
    } else {
      setStatusMsg("No se encontró la sala.");
    }
  };

  const pickSecret = async (id) => {
    if (!user || !roomCode) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    const isP1 = user.uid === currentGame?.player1;
    await updateDoc(roomRef, { [isP1 ? 'p1_secret' : 'p2_secret']: id });
  };

  const sendQuestion = async (text) => {
    if (!user || !roomCode || !text.trim() || currentGame?.turn !== user.uid) return;
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
    if (!user || !roomCode || !id || !currentGame) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    const enemySecret = user.uid === currentGame.player1 ? currentGame.p2_secret : currentGame.p1_secret;
    if (id === enemySecret) {
      await updateDoc(roomRef, { winner: user.uid });
    } else {
      await updateDoc(roomRef, { winner: user.uid === currentGame.player1 ? currentGame.player2 : currentGame.player1 });
    }
  };

  const mySecret = useMemo(() => {
    if (!currentGame || !user) return null;
    const sid = user.uid === currentGame.player1 ? currentGame.p1_secret : currentGame.p2_secret;
    return currentGame.entities.find(e => e.id === sid);
  }, [currentGame, user]);

  // --- UI RENDERS ---

  if (isAuthLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-bold uppercase text-xs tracking-widest">
      <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-4" />
      Cargando...
    </div>
  );

  if (gameState === 'menu') return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <h1 className="text-7xl font-black italic tracking-tighter text-yellow-400 mb-2 uppercase">Pop Duel</h1>
      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-12 italic">Online Edition</p>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-800 shadow-xl">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase text-white"><Star className="text-yellow-400" /> Crear Sala</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(c => <button key={c.id} onClick={() => createRoom(c.id)} className="bg-slate-800 hover:bg-yellow-400 hover:text-black p-4 rounded-2xl transition-all font-black text-xs uppercase">{c.name}</button>)}
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-800 shadow-xl text-white">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase"><LogIn className="text-yellow-400" /> Unirse</h2>
          <div className="space-y-4">
            <input type="text" placeholder="CÓDIGO" className="w-full bg-slate-950 border-2 border-slate-700 p-5 rounded-3xl text-center font-black uppercase text-2xl text-yellow-400 outline-none focus:border-yellow-400" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} />
            <button onClick={() => joinRoom(roomCode)} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase shadow-xl hover:scale-105 transition-all">Entrar</button>
            {statusMsg && <p className="text-red-400 text-xs font-bold text-center uppercase tracking-widest">{statusMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if (gameState === 'lobby') return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
      <div className="bg-slate-900 p-12 rounded-[4rem] border-4 border-yellow-400 max-w-md w-full shadow-2xl">
        <Loader2 size={48} className="mx-auto text-yellow-400 mb-6 animate-spin" />
        <h2 className="text-3xl font-black italic mb-2 uppercase">Esperando Rival</h2>
        <p className="text-slate-500 font-bold mb-8 uppercase text-xs tracking-widest">Comparte este código para jugar</p>
        <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 flex items-center justify-between gap-4 mb-8">
          <span className="text-5xl font-black text-yellow-400 tracking-widest">{roomCode}</span>
          <button onClick={copyCode} className={copied ? "p-3 rounded-xl bg-green-500 text-white scale-110" : "p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white"}>
            {copied ? <CheckCircle2 /> : <Copy />}
          </button>
        </div>
        <button onClick={() => setGameState('menu')} className="text-slate-600 font-bold text-xs uppercase hover:text-red-400 transition-colors">Cancelar</button>
      </div>
    </div>
  );

  if (gameState === 'picking') {
    const isP1 = user.uid === currentGame?.player1;
    const pickedId = isP1 ? currentGame?.p1_secret : currentGame?.p2_secret;
    return (
      <div className="min-h-screen bg-slate-100 p-6 text-center flex flex-col items-center">
        <h2 className="text-4xl font-black italic text-slate-900 uppercase mb-4 tracking-tighter">Tu Secreto</h2>
        <p className="text-slate-400 text-xs font-bold uppercase mb-10 tracking-widest">Personaje que el rival debe adivinar</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {currentGame?.entities.map(item => (
            <button key={item.id} disabled={!!pickedId} onClick={() => pickSecret(item.id)} className={pickedId === item.id ? "relative h-52 rounded-2xl border-4 border-yellow-400 scale-105 shadow-2xl overflow-hidden bg-white" : "relative h-52 rounded-2xl border-4 border-white opacity-60 hover:opacity-100 overflow-hidden bg-white shadow-lg transition-all"}>
              <img src={item.img} className="w-full h-full object-cover" alt="" />
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
      {/* Tablero */}
      <div className="flex-grow p-4 lg:p-10 h-screen overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
          <button onClick={() => window.location.reload()} className="text-slate-400 font-black text-[9px] uppercase flex items-center gap-1 hover:text-red-500 transition-colors"><ArrowLeft size={14}/> Salir</button>
          <div className="flex items-center gap-3">
            <div className={isMyTurn ? "w-3 h-3 rounded-full bg-green-500 animate-ping" : "w-3 h-3 rounded-full bg-slate-300"}></div>
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">{isMyTurn ? "Tu Turno" : "Turno del Rival"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentGame?.entities.map(item => (
            <div key={item.id} onClick={() => { if(!gameResult) setFlippedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}} className={flippedIds.includes(item.id) ? "relative h-48 opacity-20 grayscale scale-95 blur-[2px] transition-all cursor-pointer" : "relative h-48 bg-white rounded-2xl shadow-md border-2 border-white transition-all overflow-hidden cursor-pointer hover:scale-105"}>
              <img src={item.img} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 text-center text-[10px] font-black uppercase truncate tracking-tighter text-slate-800">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Control */}
      <div className="w-full lg:w-[22rem] bg-white border-l p-6 flex flex-col shadow-2xl h-screen">
        <div className="mb-6 bg-slate-900 p-5 rounded-[2.5rem] text-white flex items-center gap-4 border-b-8 border-yellow-400 shadow-xl">
          <img src={mySecret?.img} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tu Identidad</p>
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">{mySecret?.name}</h3>
          </div>
        </div>

        {currentGame?.lastQuestion && !currentGame?.lastAnswer && !isMyTurn && (
          <div className="mb-6 bg-yellow-400 p-6 rounded-[2rem] text-black shadow-2xl animate-bounce border-2 border-yellow-500">
            <p className="text-[10px] font-black uppercase mb-1 opacity-60 tracking-widest text-center text-slate-900">Te preguntan:</p>
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
               <p className="text-xs font-black uppercase tracking-widest text-center text-slate-900">Inicia el Duelo</p>
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
          <input disabled={!isMyTurn || gameResult} type="text" placeholder={isMyTurn ? "Tu pregunta..." : "Espera..."} className="w-full bg-slate-100 p-5 rounded-[2rem] text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-500 disabled:opacity-50 transition-all shadow-inner text-slate-900" onKeyPress={e => { if(e.key === 'Enter' && e.target.value.trim()){ sendQuestion(e.target.value); e.target.value = ""; }}} />
          <div className="bg-slate-900 p-4 rounded-[2.5rem] border-b-8 border-yellow-400 shadow-xl">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-2 text-center tracking-[0.2em]">Adivina el Personaje</p>
            <select disabled={!isMyTurn || gameResult} onChange={e => { if(e.target.value) resolveGame(e.target.value); }} className="w-full bg-slate-900 text-white p-3 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer focus:text-yellow-400 transition-colors">
              <option value="">¿QUIÉN ES?</option>
              {currentGame?.entities.map(e => <option key={e.id} value={e.id} className="text-white bg-slate-900">{e.name}</option>)}
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


