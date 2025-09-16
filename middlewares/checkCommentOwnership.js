const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function checkCommentOwnership(req, res, next) {
  const commentId = Number(req.params.commentId);

  if (!commentId || commentId <= 0)
    return res
      .status(400)
      .json({ success: false, message: "Invalid comment ID" });

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    if (comment.userId !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    req.comment = comment;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { checkCommentOwnership };
