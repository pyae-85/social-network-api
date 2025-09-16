const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function checkPostOwnership(req, res, next) {
  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid post ID" });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.userId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    req.post = post;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { checkPostOwnership };
