import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;

//Usamos la DB para saber qué IDs de nodos existen
const pool = new Pool({
  user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT)
 });

const start = async () => {
  //Nodos reales que insertamos
  const res = await pool.query('SELECT id FROM nodos');
  const nodosIds = res.rows.map(n => n.id);

  console.log("Simulador corriendo cada 5 segundos...");

  setInterval(async () => {
    //Genera datos aleatorios
    const data = {
      nodo_id: nodosIds[Math.floor(Math.random() * nodosIds.length)],
      vatios: parseFloat((Math.random() * 500).toFixed(2)),
      voltaje: parseFloat((Math.random() * (240 - 210) + 210).toFixed(2)),
      status_code: 200,
      criticidad: 'info',
      mensaje: 'Lectura normal'
    };

    //Llamada a la API para enviar los datos 
    try {
      await axios.post('http://localhost:4000/api/metricas', data);
      console.log(`✅ Enviado: ${data.nodo_id} - ${data.vatios}W`);
    } catch (err) {
      console.log("❌ Error: Asegúrate que el servidor esté encendido");
    }
  }, 5000);
};

start();