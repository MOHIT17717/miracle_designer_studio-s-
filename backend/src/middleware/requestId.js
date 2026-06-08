const { randomUUID } = require('crypto');

function createRequestId() {
  return function (req, res, next) {
    const existing = req.headers['x-request-id'];
    const requestId = typeof existing === 'string' && existing.length > 0 ? existing : randomUUID();
    req.id = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  };
}

module.exports = { createRequestId };

