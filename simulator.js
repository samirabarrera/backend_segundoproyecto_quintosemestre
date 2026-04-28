import "dotenv/config";
import axios from "axios";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT),
});

const start = async () => {
  //Nodos reales que insertamos de la base de datos
  const res = await pool.query("SELECT id FROM nodos");
  const nodosIds = res.rows.map((n) => n.id);

  if (nodosIds.length === 0) {
    console.error("No hay nodos en la BD. Inserta nodos primero.");
    process.exit(1);
  }

  console.log(
    `Simulador corriendo cada 5 segundos con ${nodosIds.length} nodo(s)...`,
  );

  setInterval(async () => {
    const vatiosGenerados = parseFloat((Math.random() * 500).toFixed(2));
    const voltaje = parseFloat((Math.random() * (240 - 210) + 210).toFixed(2));

    const data = {
      nodo_id: nodosIds[Math.floor(Math.random() * nodosIds.length)],
      vatios_generados: vatiosGenerados, // ← nombre correcto para la BD
      voltaje,
      status_code: 200,
      criticidad: "info",
      mensaje: "Lectura normal",
    };

    try {
      await axios.post("http://localhost:4000/api/metricas", data);
      console.log(
        `Enviado: ${data.nodo_id} — ${data.vatios_generados}W / ${data.voltaje}V`,
      );
    } catch (err) {
      console.log(
        "❌ Error: Asegúrate que el servidor esté encendido",
        err.message,
      );
    }
  }, 5000);
};

start();
