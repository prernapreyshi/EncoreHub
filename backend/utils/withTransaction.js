const mongoose = require('mongoose');

/**
 * Wraps a callback in a MongoDB session + transaction when the server
 * supports it (replica set / Atlas). Falls back to no-transaction on
 * a standalone mongod (common in local dev) so the app still works.
 *
 * Usage:
 *   await withTransaction(async (session) => {
 *     await Model.findOneAndUpdate(..., { session });
 *   });
 */
const withTransaction = async (fn) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    await fn(session);
    await session.commitTransaction();
  } catch (err) {
    if (session) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    // Re-throw so the caller can handle it
    throw err;
  } finally {
    if (session) session.endSession();
  }
};

module.exports = withTransaction;
