const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { auth } = require("./middlewares/auth");
const { checkPostOwnership } = require("./middlewares/checkPostOwnership");
const {
  checkCommentOwnership,
} = require("./middlewares/checkCommentOwnership");

const { usersRouter } = require("./routes/users");
app.use("/users", usersRouter);

const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

// List posts (paginated)
app.get("/posts", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const totalPosts = await prisma.post.count();

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: { id: true, name: true, username: true, createdAt: true },
        },
        _count: {
          select: { comments: true, postLikes: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.json({
      success: true,
      data: posts,
      meta: {
        total: totalPosts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get post details
app.get("/posts/:id", async (req, res) => {
  const postId = Number(req.params.id);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, name: true, username: true, createdAt: true },
        },
        postLikes: {
          include: {
            user: {
              select: { id: true, name: true, username: true, createdAt: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, username: true, createdAt: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { postLikes: true, comments: true },
        },
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create post
app.post("/posts", auth, async (req, res) => {
  try {
    const body = req.body?.body?.trim();
    if (!body) {
      return res.status(400).json({ success: false, message: "Body required" });
    }

    const post = await prisma.post.create({
      data: {
        body,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    res.json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update post (owner only)
app.put("/posts/:id", auth, checkPostOwnership, async (req, res) => {
  try {
    const body = req.body?.body?.trim();
    if (!body) {
      return res.status(400).json({ success: false, message: "Body required" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.post.id },
      data: { body },
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    });

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete post (owner only)
app.delete("/posts/:id", auth, checkPostOwnership, async (req, res) => {
  try {
    await prisma.post.delete({
      where: { id: req.post.id },
    });

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Like post
app.put("/posts/:id/like", auth, async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const like = await prisma.postLike.create({
      data: { postId, userId },
    });

    res.json({ success: true, data: like });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ success: false, message: "Already liked" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Unlike post
app.put("/posts/:id/unlike", auth, async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const unlike = await prisma.postLike.deleteMany({
      where: { postId, userId },
    });

    if (unlike.count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Like not found" });
    }

    res.json({ success: true, message: "Unliked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add comment
app.post("/posts/:postId/comments", auth, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const content = req.body?.content?.trim();

    if (!content)
      return res
        .status(400)
        .json({ success: false, message: "Content required" });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const comment = await prisma.comment.create({
      data: { content, postId, userId: req.user.id },
      include: { user: { select: { id: true, name: true, username: true } } },
    });

    res.json({ success: true, data: comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update comment (ownership)
app.put(
  "/posts/:postId/comments/:commentId",
  auth,
  checkCommentOwnership,
  async (req, res) => {
    try {
      const content = req.body?.content?.trim();
      if (!content)
        return res
          .status(400)
          .json({ success: false, message: "Content required" });

      const updatedComment = await prisma.comment.update({
        where: { id: req.comment.id },
        data: { content },
        include: { user: { select: { id: true, name: true, username: true } } },
      });

      res.json({ success: true, data: updatedComment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Delete comment (owner only)
app.delete(
  "/posts/:postId/comments/:commentId",
  auth,
  checkCommentOwnership,
  async (req, res) => {
    try {
      await prisma.comment.delete({ where: { id: req.comment.id } });
      res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

app.listen(8800, () => {
  console.log("Social API running at 8800...");
});
