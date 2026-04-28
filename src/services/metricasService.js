import pool from "../config/basedatos.js";
import { getIO } from "../../socketManager.js";

/**
 * Determina status_code y criticidad a partir de vatios y voltaje.
 * Reglas:
 *  - vatios >= 200  → 200 / info
 *  - vatios 50-199  → 400 / warning
 *  - vatios <  50   → 500 / error
 *  - voltaje < 215 o > 238 → fuerza error independiente de vatios
 */
const calcularEstado = (vatiosGenerados, voltaje) => {
  const voltajeAnomalo = voltaje < 215 || voltaje > 238;

  if (voltajeAnomalo || vatiosGenerados < 50) {
    return { status_code: 500, criticidad: "error" };
  }
  if (vatiosGenerados < 200) {
    return { status_code: 400, criticidad: "warning" };
  }
  return { status_code: 200, criticidad: "info" };
};

//Genera el mensaje descriptivo del evento.
const generarMensaje = (criticidad, vatiosGenerados, voltaje, nodoNombre) => {
  if (criticidad === "error") {
    return `Falla crítica en ${nodoNombre}: ${vatiosGenerados}W / ${voltaje}V`;
  }
  if (criticidad === "warning") {
    return `Eficiencia baja en ${nodoNombre}: ${vatiosGenerados}W generados`;
  }
  return `Operación normal en ${nodoNombre}: ${vatiosGenerados}W / ${voltaje}V`;
};

//Servicios
//Guarda una nueva métrica en metricas_log.
const saveMetric = async ({ nodoId, vatiosGenerados, voltaje }) => {
  // Obtener nombre del nodo para el mensaje
  const nodoResult = await pool.query(
    "SELECT nombre FROM nodos WHERE id = $1",
    [nodoId],
  );

  if (nodoResult.rowCount === 0) {
    const err = new Error(`Nodo no encontrado: ${nodoId}`);
    err.status = 404;
    throw err;
  }

  const nodoNombre = nodoResult.rows[0].nombre;
  const { status_code, criticidad } = calcularEstado(vatiosGenerados, voltaje);
  const mensaje = generarMensaje(
    criticidad,
    vatiosGenerados,
    voltaje,
    nodoNombre,
  );

  const result = await pool.query(
    `INSERT INTO metricas_log
       (nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nodoId, vatiosGenerados, voltaje, status_code, criticidad, mensaje],
  );

  const row = result.rows[0];

  //Emitir eventos sin variable global
  const io = getIO();
  io.emit("nueva_metrica", row);

  if (criticidad === "error") {
    io.emit("alerta_critica", {
      nodo_id: row.nodo_id,
      nodoNombre,
      mensaje: row.mensaje,
      timestamp: row.timestamp,
      voltaje: row.voltaje,
      vatios: row.vatios_generados,
    });
  }

  return row;
};

//Retorna las métricas de un nodo en los últimos minutos.
//Usado para la Gráfica de Línea en tiempo real.
//@param {string} nodoId
//@param {number} minutes
const getRecentMetrics = async (nodoId, minutes = 5) => {
  const result = await pool.query(
    `SELECT id, nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje, timestamp
     FROM metricas_log
     WHERE nodo_id = $1
       AND timestamp >= NOW() - ($2 || ' minutes')::interval
     ORDER BY timestamp ASC`,
    [nodoId, minutes],
  );
  return result.rows;
};

//Retorna la generación total de vatios agrupada por día o mes.
//Usado para la Gráfica de Barras histórica.
//@param {'day' | 'month'} groupBy
const getAggregatedMetrics = async (groupBy = "day") => {
  const trunc = groupBy === "month" ? "month" : "day";

  const result = await pool.query(
    `SELECT
       DATE_TRUNC($1, timestamp)     AS periodo,
       SUM(vatios_generados)::float  AS total_vatios,
       COUNT(*)::int                 AS lecturas
     FROM metricas_log
     GROUP BY periodo
     ORDER BY periodo DESC
     LIMIT 30`,
    [trunc],
  );
  return result.rows;
};

export { saveMetric, getRecentMetrics, getAggregatedMetrics };
