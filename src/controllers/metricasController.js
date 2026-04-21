import { query } from '../config/basedatos.js';
import { getIO } from '../../socketManager.js';

export const createMetric = async (req, res) => {
  const { nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje } = req.body;

  try {
    const sql = `
      INSERT INTO metricas_log (nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`;

    const result = await query(sql, [nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje]);

    if (result.rowCount > 0) {
      const newMetric = result.rows[0];
      const io = getIO();

      // Emitimos a todos los clientes conectados en React
      io.emit('Nueva Métrica', newMetric);

      // Emite 'Alerta Critica' si se necesita
      if (criticidad === 'error' || status_code >= 500) {
        io.emit('Alerta Crítica', {
          msg: `¡ALERTA! Nodo ${nodo_id} reporta falla.`,
          data: newMetric
        });
      }

      return res.status(201).json(newMetric);
    }
  } catch (error) {
    console.error('Error al guardar métrica:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

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