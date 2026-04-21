import { query } from '../config/basedatos.js'; 

export const getLogs = async ({ dateRange, criticality, search, page, limit }) => {
  //Inicializamos los filtros y parámetros
  let whereClauses = [];
  let filterParams = []; // parámetros de filtro para la consulta de conteo

  //Construcción dinámica de(WHERE)
  if (criticality) {
    filterParams.push(criticality);
    whereClauses.push(`criticidad = $${filterParams.length}`);
  }

  if (search) {
    filterParams.push(`%${search}%`);
    whereClauses.push(`mensaje ILIKE $${filterParams.length}`);
  }

  // Ejemplo de fecha 
  if (dateRange) {
    filterParams.push(dateRange);
    whereClauses.push(`timestamp::date = $${filterParams.length}`);
  }

  //Juntamos todas las condiciones
  let whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sqlCount = `SELECT COUNT(*) FROM metricas_log ${whereSql}`;
  const totalRes = await query(sqlCount, filterParams); 
  const totalItems = parseInt(totalRes.rows[0].count);

  //Consulta principal: Datos con Paginación
  const offset = (page - 1) * limit;
  const fullParams = [...filterParams, limit, offset];
  
  const sqlData = `
    SELECT * FROM metricas_log 
    ${whereSql} 
    ORDER BY timestamp DESC 
    LIMIT $${fullParams.length - 1} OFFSET $${fullParams.length}
  `;

  const result = await query(sqlData, fullParams);


  //Retornamos todo listo para el frontend
  return {
    logs: result.rows,
    totalItems,
    totalPages: Math.ceil(totalItems / limit)
  };
};