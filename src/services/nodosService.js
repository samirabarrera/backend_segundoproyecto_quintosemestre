import pool from "../config/basedatos.js";

/**
 *  - status_code 200  → 'online'
 *  - status_code 400  → 'alerta'
 *  - status_code 500  → 'alerta'
 *  - sin métricas     → 'offline'
 */
const getAllNodes = async () => {
  const result = await pool.query(
    `SELECT
       n.id,
       n.nombre,
       n.ubicacion,
       n.version_fw,
       CASE
         WHEN ml.status_code = 200 THEN 'online'
         WHEN ml.status_code IN (400, 500) THEN 'alerta'
         ELSE 'offline'
       END AS estado,
       ml.status_code,
       ml.criticidad,
       ml.vatios_generados,
       ml.voltaje,
       ml.timestamp AS ultima_lectura
     FROM nodos n
     LEFT JOIN LATERAL (
       SELECT status_code, criticidad, vatios_generados, voltaje, timestamp
       FROM metricas_log
       WHERE nodo_id = n.id
       ORDER BY timestamp DESC
       LIMIT 1
     ) ml ON true
     ORDER BY n.nombre`,
  );
  return result.rows;
};

const getStatusDistribution = async () => {
  const result = await pool.query(
    `WITH ultimo_estado AS (
       SELECT
         n.id,
         CASE
           WHEN ml.status_code = 200 THEN 'Online'
           WHEN ml.status_code IN (400, 500) THEN 'Alerta'
           ELSE 'Offline'
         END AS estado
       FROM nodos n
       LEFT JOIN LATERAL (
         SELECT status_code
         FROM metricas_log
         WHERE nodo_id = n.id
         ORDER BY timestamp DESC
         LIMIT 1
       ) ml ON true
     )
     SELECT estado, COUNT(*)::int AS cantidad
     FROM ultimo_estado
     GROUP BY estado
     ORDER BY estado`,
  );
  return result.rows;
};

export { getAllNodes, getStatusDistribution };
