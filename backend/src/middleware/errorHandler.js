function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error('[backend] error:', err);
  const status = err?.statusCode || 500;
  return res.status(status).json({
    error: err?.message || 'Internal Server Error',
  });
}

module.exports = { errorHandler };

