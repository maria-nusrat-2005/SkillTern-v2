/**
 * Wraps an asynchronous middleware/controller function, catching any errors and passing them to next().
 * @param {Function} fn - The asynchronous route handler
 * @returns {Function} Express route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
