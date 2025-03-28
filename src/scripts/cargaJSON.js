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

// Ruta absoluta para el nuevo JSON de provincias
const filePath = 'C:\\Users\\usuario\\Practicum\\servicio-calculo\\src\\assets\\data\\provincias.json';

try {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const provinciasData = JSON.parse(rawData);

  // Función para subir los datos de provincias a Firestore
  async function subirDatosProvinciasAFirestore() {
    try {
      // Asegúrate de que la estructura de tu JSON es correcta para Firestore
      for (const provincia of provinciasData) {
        // Crear un documento para cada provincia
        const provinciaRef = db.collection('provincias').doc(provincia.id.toString());
        await provinciaRef.set({
          name: provincia.name,
          cities: provincia.cities.map(city => ({
            id: city.id,
            name: city.name
          }))
        });
        
        console.log(`Provincia ${provincia.name} subida exitosamente.`);
      }
      console.log('Todas las provincias han sido subidas a Firestore.');
    } catch (error) {
      console.error('Error al subir datos de provincias a Firestore:', error);
    } finally {
      // Cierra la conexión después de subir los datos
      admin.app().delete().then(() => {
        console.log('Aplicación de Firebase cerrada.');
      });
    }
  }

  // Ejecuta la función para subir los datos
  subirDatosProvinciasAFirestore();
} catch (error) {
  console.error('Error al leer o parsear el archivo JSON de provincias:', error);
}