import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";

//user interface for our data base
interface User {
  id: number;
  email: string;
  hashed_password?: string;
}

const router = Router();
const SALT_ROUNDS = 10;

//register route
router.get("/register", (req, res) => {
  res.render("register", {
    error: null,
    email: "",
  });
});

//handle registration form submission
router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  try {
    if (!email || !password) {
      res.status(400).render("register", {
        error: "Email and password required",
        email: email || "",
      });
      return;
    }

    const existingUser = await db.oneOrNone<{ id: number }>(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser) {
      res.status(400).render("register", {
        error: "Email already exists",
        email,
      });
      return;
    }

    //hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //store the new user in the database
    const user = await db.one<User>(
      `INSERT INTO users (email, hashed_password)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, hashedPassword],
    );

    //log the user in by creating a session
    req.session.user = {
      id: user.id,
      email: user.email,
    };

    //redirect to lobby after successful registration
    res.redirect("/auth/lobby");
    return;
  } catch (err) {
    console.error(err);
    res.status(500).render("register", {
      error: "Server error",
      email: email || "",
    });
    return;
  }
});

//login route
router.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    email: "",
  });
});

//handle login form submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  //checklogin credentials
  try {
    if (!email || !password) {
      res.status(400).render("login", {
        error: "Email and password required",
        email: email || "",
      });
      return;
    }

    //look up user by email
    const user = await db.oneOrNone<User>(
      "SELECT id, email, hashed_password FROM users WHERE email = $1",
      [email],
    );

    if (!user) {
      res.status(401).render("login", {
        error: "Invalid email or password",
        email,
      });
      return;
    }

    //compare provided password with hashed password in database
    const match = await bcrypt.compare(password, user.hashed_password ?? "");
    if (!match) {
      res.status(401).render("login", {
        error: "Invalid email or password",
        email,
      });
      return;
    }

    //log the user in by creating a session
    req.session.user = {
      id: user.id,
      email: user.email,
    };

    res.redirect("/auth/lobby");
    return;
  } catch (err) {
    console.error(err);
    res.status(500).render("login", {
      error: "Server error",
      email: email || "",
    });
    return;
  }
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      next(err);
      return;
    }

    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

router.get("/lobby", requireAuth, (req, res) => {
  res.render("lobby", {
    user: req.session.user,
  });
});

export default router;
