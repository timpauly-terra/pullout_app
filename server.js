const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(require("cors")());
app.use(express.static("public"));

// Upload-Ordner sicherstellen
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
};

// WICHTIG: Dateiname aus originalname ziehen
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {

    let baseName = file.originalname.replace(".webm", "");

    // Alle vorhandenen Dateien lesen
    const files = fs.readdirSync("uploads");

    // Passende Dateien finden
    const matchingFiles = files.filter(f =>
      f.startsWith(baseName) && f.endsWith(".webm")
    );

    // Neue Nummer
    const number = matchingFiles.length + 1;

    // Finaler Name
    const finalName = `${baseName}_${number}.webm`;

    cb(null, finalName);
  }
});

const upload = multer({ storage });

// JSON speichern
app.post("/save-data", (req, res) => {
  const data = req.body;

  const id = data.id || ("unknown_" + Date.now());
  const filename = `${id}.json`;

  fs.writeFileSync(
    path.join("uploads", filename),
    JSON.stringify(data, null, 2)
  );

  res.json({ status: "ok", file: filename });
});

// 🎥 Video speichern
app.post("/upload-video", upload.single("video"), (req, res) => {
  res.json({
    status: "video saved",
    file: req.file.filename
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server läuft auf Port ${PORT}");
});