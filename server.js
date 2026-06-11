const { Storage } = require("@google-cloud/storage");
const cloudStorage = new Storage();

const bucketName = "pullout-data";
const bucket = cloudStorage.bucket(bucketName);
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
app.post("/save-data", async (req, res) => {

  try {

    const data = req.body;

    const id = data.id || ("unknown_" + Date.now());
    const filename = `${id}.json`;

    await bucket.file(`json/${filename}`).save(
      JSON.stringify(data, null, 2),
      {
        contentType: "application/json"
      }
    );

    res.json({
      status: "ok",
      file: filename
    });

  } catch(err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

// 🎥 Video speichern
app.post("/upload-video", upload.single("video"), async (req, res) => {

  try {

    const localPath = req.file.path;

    const targetName = `videos/${req.file.filename}`;

    await bucket.upload(localPath, {
      destination: targetName
    });

    fs.unlinkSync(localPath);

    res.json({
      status: "ok",
      file: targetName
    });

  } catch(err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
