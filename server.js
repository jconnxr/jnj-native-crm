/**
 * Railway-compatible: entry point is server.js; PORT is read at runtime (process.env.PORT || 4000)
 * so the platform can inject PORT. No build-time PORT reference. start script runs node server.js.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const insertStmt = db.prepare(`
  INSERT INTO conversations (name, email, company, phone, reason, source, pathway, system_level)
  VALUES (@name, @email, @company, @phone, @reason, @source, @pathway, @system_level)
`);

// Root route: Railway often probes / for health; responding here ensures the service is marked healthy.
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "jnj-native-crm" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/intake", (req, res) => {
  const { name, email, company, phone, reason, source, pathway, system_level } = req.body;

  if (!name || !email || !reason) {
    return res.status(400).json({ error: "name, email, and reason are required" });
  }

  try {
    insertStmt.run({
      name: String(name).trim(),
      email: String(email).trim(),
      company: company != null ? String(company).trim() : null,
      phone: phone != null ? String(phone).trim() : null,
      reason: String(reason).trim(),
      source: source != null ? String(source).trim() : null,
      pathway: pathway != null ? String(pathway).trim() : null,
      system_level: system_level != null ? String(system_level).trim() : null,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save submission" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
