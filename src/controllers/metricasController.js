import { query } from '../config/basedatos.js';
import { getIO } from '../../socketManager.js';

/* POST /api/metricas ── Guarda una nueva métrica */
export const createMetric = async (req, res) => {
  // El simulador y la API aceptan tanto 'vatios' como 'vatios_generados'
  const {
    nodo_id,
    vatios_generados: vg,
    vatios,
    voltaje,
    status_code,
    criticidad,
    mensaje,
  } = req.body;

  const vatiosGenerados = vg ?? vatios; // prioriza vatios_generados

  try {
    const sql = `
      INSERT INTO metricas_log (nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`;

    const result = await query(sql, [
      nodo_id, vatiosGenerados, voltaje, status_code, criticidad, mensaje,
    ]);

    if (result.rowCount > 0) {
      const newMetric = result.rows[0];
      const io = getIO();

      // Nombres de evento que coinciden con el frontend
      io.emit('nueva_metrica', newMetric);

      if (criticidad === 'error' || status_code >= 500) {
        io.emit('alerta_critica', {
          nodo_id,
          mensaje: mensaje ?? `¡ALERTA! Nodo ${nodo_id} reporta falla.`,
          vatios:  vatiosGenerados,
          voltaje,
        });
      }

      return res.status(201).json(newMetric);
    }
  } catch (error) {
    console.error('Error al guardar métrica:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* GET /api/metricas/:nodeId ── Últimas métricas por nodo (gráfica línea) */
export const getRecentByNode = async (req, res) => {
  const { nodeId } = req.params;
  const minutes = parseInt(req.query.minutes) || 10;
  try {
    const sql = `
      SELECT *
      FROM metricas_log
      WHERE nodo_id = $1
        AND timestamp >= NOW() - ($2 || ' minutes')::interval
      ORDER BY timestamp ASC`;
    const result = await query(sql, [nodeId, minutes]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener métricas por nodo:', error.message);
    res.status(500).json({ error: 'Error al obtener métricas del nodo' });
  }
};

/* GET /api/metricas/aggregated ── Generación histórica (gráfica de barras) */
export const getAggregated = async (req, res) => {
  const groupBy = req.query.groupBy === 'month' ? 'month' : 'day';
  try {
    const sql = `
      SELECT
        DATE_TRUNC($1, timestamp)    AS periodo,
        SUM(vatios_generados)::float AS total_vatios,
        COUNT(*)::int                AS lecturas
      FROM metricas_log
      GROUP BY periodo
      ORDER BY periodo DESC
      LIMIT 30`;
    const result = await query(sql, [groupBy]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener métricas agregadas:', error.message);
    res.status(500).json({ error: 'Error al obtener métricas agregadas' });
  }
};

/* GET /api/metricas/recientes */
export const getRecentMetrics = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM metricas_log 
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
      ORDER BY timestamp ASC`;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener métricas recientes' });
  }
};

/* GET /api/metricas/:nodeId/distribution ── Dona por nodo (criticidad)*/
export const getNodeCriticalityDistribution = async (req, res) => {
  const { nodeId } = req.params;
  try {
    const sql = `
      SELECT
        criticidad   AS estado,
        COUNT(*)::int AS cantidad
      FROM metricas_log
      WHERE nodo_id = $1
        AND timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY criticidad
      ORDER BY criticidad`;
    const result = await query(sql, [nodeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener distribución por nodo:', error.message);
    res.status(500).json({ error: 'Error al obtener distribución' });
  }
};