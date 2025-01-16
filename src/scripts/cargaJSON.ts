import { initializeApp } from '@angular/fire/app';
import { getFirestore, collection, setDoc, doc } from '@angular/fire/firestore';
import { environment } from '@envs/environment';
import * as fs from 'fs';

// Inicializa Firebase
const app = initializeApp(environment.firebase);
const db = getFirestore(app);

// Lee el archivo JSON
const rawData = fs.readFileSync('assets/data/riesgos.json');
const riesgosData = JSON.parse(rawData.toString());

// Función para subir los datos a Firestore
async function subirDatosAFirestore() {
  try {
    // Asegúrate de que la estructura de tu JSON es correcta para Firestore
    for (const [key, value] of Object.entries(riesgosData.riesgos)) {
      await setDoc(doc(db, 'riesgos', key), value);
    }
    console.log('Datos subidos a Firestore exitosamente.');
  } catch (error) {
    console.error('Error al subir datos a Firestore:', error);
  } 
  // Ya no es necesario cerrar la aplicación aquí ya que estamos en un entorno de script
  // Si necesitas cerrar la aplicación por algún motivo específico, investiga la API actual de Firebase
}

// Ejecuta la función para subir los datos
subirDatosAFirestore();