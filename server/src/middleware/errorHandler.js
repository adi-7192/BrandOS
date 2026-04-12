export function errorHandler(err, req, res, next) {
  // Stack traces stay out of production logs — only message is logged there.
  if (process.env.NODE_ENV === 'production') {
    console.error('[error]', err.message);
  } else {
    console.error('[error]', err.message, err.stack);
  }
  const status = err.status || 500;
  // Only forward the specific message when the code set an explicit HTTP status.
  // For unexpected 500s, return a generic message so DB constraint names and
  // internal details are never leaked to callers.
  const message = err.status ? (err.message || 'An error occurred.') : 'Internal server error.';
  res.status(status).json({ message });
}
