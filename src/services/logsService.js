import { query } from "../config/basedatos.js";

export const getLogs = async ({
  dateRange,
  criticality,
  search,
  page,
  limit,
}) => {
  //Inicializamos los filtros y parámetros
  let whereClauses = [];
  let filterParams = []; // parámetros de filtro para la consulta de conteo

  // Filtro de criticidad
  if (criticality) {
    filterParams.push(criticality);
    whereClauses.push(`ml.criticidad = $${filterParams.length}`);
  }

  // Filtro de búsqueda: nodo nombre o ubicación
  if (search) {
    filterParams.push(`%${search}%`);
    const idx = filterParams.length;
    whereClauses.push(`(n.nombre ILIKE $${idx} OR n.ubicacion ILIKE $${idx})`);
  }

  // Filtro de fecha: convierte 'today', 'yesterday' y 'last_month'
  if (dateRange === "today") {
    whereClauses.push(
      `ml.timestamp >= CURRENT_DATE AND ml.timestamp < CURRENT_DATE + INTERVAL '1 day'`,
    );
  } else if (dateRange === "yesterday") {
    whereClauses.push(
      `ml.timestamp >= CURRENT_DATE - INTERVAL '1 day' AND ml.timestamp < CURRENT_DATE`,
    );
  } else if (dateRange === "last_month") {
    whereClauses.push(`ml.timestamp >= CURRENT_DATE - INTERVAL '30 days'`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // JOIN con nodos para obtener nombre y ubicación
  const baseFrom = `
    FROM metricas_log ml
    LEFT JOIN nodos n ON n.id = ml.nodo_id
  `;

  // Conteo total
  const sqlCount = `SELECT COUNT(*) ${baseFrom} ${whereSql}`;
  const totalRes = await query(sqlCount, filterParams);
  const total = parseInt(totalRes.rows[0].count);

  // Datos con paginación
  const offset = (page - 1) * limit;
  const fullParams = [...filterParams, limit, offset];

  const sqlData = `
    SELECT
      ml.*,
      n.nombre    AS nodo_nombre,
      n.ubicacion AS ubicacion
    ${baseFrom}
    ${whereSql}
    ORDER BY ml.timestamp DESC
    LIMIT $${fullParams.length - 1} OFFSET $${fullParams.length}
  `;

  const result = await query(sqlData, fullParams);

  // Claves que espera el frontend: data / total / totalPages
  return {
    data: result.rows,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
