const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { auth } = require("../middlewares/auth");
const { checkUserOwnership } = require("../middlewares/checkUserOwnership");

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// verify token
router.get("/verify", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    res.json({
      success: true,
      data: sanitizeUser(req.user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// user list
router.get("/", async (req, res) => {
  console.error("here");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// get user detail
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        posts: {
          select: { id: true, createdAt: true },
        },
        comments: {
          select: { id: true, createdAt: true },
        },
        postLikes: {
          select: { postId: true },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// create user
router.post("/register", async (req, res) => {
  const name = req.body?.name?.trim();
  const username = req.body?.username?.trim();
  const bio = req.body?.bio;
  const password = req.body?.password;

  if (!name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "name, username and password required",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        bio,
        password: hash,
      },
    });

    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// update user info
router.put("/edit/:id", auth, checkUserOwnership, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, username, bio, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== id) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }
      updateData.username = username;
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: sanitizeUser(updatedUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// delete user
router.delete("/:id", auth, checkUserOwnership, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "username and password required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return res.json({
          success: true,
          data: { token, expiresAt: Date.now() + 3600000 },
        });
      }
    }

    res
      .status(401)
      .json({ success: false, message: "Incorrect username or password" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = { usersRouter: router };
