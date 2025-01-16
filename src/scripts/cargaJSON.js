const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ajusta la ruta según donde hayas descargado el archivo JSON de la cuenta de servicio
const serviceAccountPath = 'C:\\Users\\usuario\\Downloads\\serviciosenfermeria-df5d5-firebase-adminsdk-girgd-905835400a.json';
const serviceAccount = require(serviceAccountPath);

// Inicializa la aplicación de Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serviciosenfermeria-df5d5-default-rtdb.firebaseio.com"
});

// Obtén una referencia a Firestore
const db = admin.firestore();

// Ruta absoluta que has confirmado que funciona
const filePath = 'C:\\Users\\usuario\\Practicum\\servicio-calculo\\src\\assets\\data\\riesgos.json';

try {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const riesgosData = JSON.parse(rawData);

  // Función para subir los datos a Firestore
  async function subirDatosAFirestore() {
    try {
      // Asegúrate de que la estructura de tu JSON es correcta para Firestore
      for (const [key, value] of Object.entries(riesgosData.riesgos)) {
        await db.collection('riesgos').doc(key).set(value);
      }
      console.log('Datos subidos a Firestore exitosamente.');
    } catch (error) {
      console.error('Error al subir datos a Firestore:', error);
    } finally {
      // Cierra la conexión después de subir los datos
      admin.app().delete().then(() => {
        console.log('Aplicación de Firebase cerrada.');
      });
    }
  }

  // Ejecuta la función para subir los datos
  subirDatosAFirestore();
} catch (error) {
  console.error('Error al leer o parsear el archivo JSON:', error);
}