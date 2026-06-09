const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { read, write } = require('../middleware/store');

const router = express.Router();
const RECORDS = 'records.json';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(new Error('Tipo de arquivo não permitido'));
    cb(null, true);
  },
});

router.get('/', (_req, res) => {
  const records = read(RECORDS, []);
  res.json(records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

router.post('/', upload.array('media', 5), (req, res) => {
  const { species, date, location, notes, username } = req.body || {};
  const errors = [];
  if (!username) errors.push('faça login antes');
  if (!species || species.length < 2 || species.length > 80) errors.push('espécie 2-80 chars');
  if (!date || isNaN(Date.parse(date)) || new Date(date) > new Date()) errors.push('data inválida ou futura');
  if (!location || location.length < 2 || location.length > 120) errors.push('local 2-120 chars');
  if (notes && notes.length > 1000) errors.push('notas ≤ 1000 chars');
  if (!req.files || req.files.length === 0) errors.push('envie ao menos 1 arquivo');
  if (errors.length) {
    (req.files || []).forEach(f => fs.unlink(f.path, () => {}));
    return res.status(400).json({ error: errors.join('; ') });
  }
  const records = read(RECORDS, []);
  const record = {
    id: crypto.randomUUID(),
    username: String(username).trim(),
    species: String(species).trim(),
    date,
    location: String(location).trim(),
    notes: notes ? String(notes).trim() : '',
    media: req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      mime: f.mimetype,
      size: f.size,
    })),
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  write(RECORDS, records);
  res.status(201).json(record);
});

module.exports = router;
