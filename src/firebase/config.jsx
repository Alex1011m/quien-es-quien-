import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Los datos de configuración se obtienen de las variables de entorno de Vite.
 * En desarrollo local, puedes crear un archivo .env en la raíz del proyecto.
 * En producción (Vercel), debes agregarlas en el panel de control.
 */
const firebaseConfig = JSON.parse(
  import.meta.env.VITE_FIREBASE_CONFIG || "{}"
);

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios para usarlos en App.jsx
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
