import { getLogs } from '../services/logsService.js';

const fetchLogs = async (req, res, next) => {
  try {
    const { dateRange, criticality, search, page, limit } = req.query;
    const result = await getLogs({
      dateRange,
      criticality,
      search,
      page:  page  ? parseInt(page)  : 1,
      limit: limit ? parseInt(limit) : 50,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export { fetchLogs };
