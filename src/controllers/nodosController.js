import * as nodosService from '../services/nodosService.js';
import { query } from '../config/basedatos.js';

export const getNodes = async (req, res) => {
    try {
        const result = await query('SELECT id, nombre, ubicacion FROM nodos');
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