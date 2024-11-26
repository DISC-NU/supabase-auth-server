const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const app = express();

const supabase = createClient("SUPABASE_URL", "ANONYMOUS_KEY");

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    res.json({ message: "Registration successful!", user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json({ token: data.session.access_token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/api/protected", checkAuth, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user.email,
    timestamp: new Date().toISOString(),
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
