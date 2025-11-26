function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ message: 'Unexpected error' });
}

module.exports = errorHandler;
