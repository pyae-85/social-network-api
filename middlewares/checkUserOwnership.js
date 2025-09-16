const express = require("express");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function checkUserOwnership(req, res, next) {
  const id = Number(req.params.id);

  if (req.user.id !== id) {
    return res.status(403).json({ success: false, msg: "Not authorized" });
  }

  next();
}

module.exports = { checkUserOwnership };
