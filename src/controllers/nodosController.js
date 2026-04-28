import * as nodosService from '../services/nodosService.js';
import { query } from '../config/basedatos.js';

export const getNodes = async (req, res) => {
    try {
        const result = await query(`
            SELECT
              n.id,
              n.nombre,
              n.ubicacion,
              n.version_fw,
              CASE
                WHEN ml.status_code = 200           THEN 'online'
                WHEN ml.status_code IN (400, 500)   THEN 'alerta'
                ELSE 'offline'
              END AS estado,
              ml.vatios_generados,
              ml.voltaje,
              ml.timestamp AS ultima_lectura
            FROM nodos n
            LEFT JOIN LATERAL (
              SELECT status_code, vatios_generados, voltaje, timestamp
              FROM metricas_log
              WHERE nodo_id = n.id
              ORDER BY timestamp DESC
              LIMIT 1
            ) ml ON true
            ORDER BY n.nombre
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo nodos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getNodebyId = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT id, nombre, ubicacion FROM nodos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Node no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo nodo por ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getStatus = async (req, res) => {
  try {
    const distribution = await nodosService.getStatusDistribution();
    res.json(distribution); // Esto va en la gráfica de dona en React
  } catch (error) {
    res.status(500).json({ error: 'Error en distribución' });
  }
};