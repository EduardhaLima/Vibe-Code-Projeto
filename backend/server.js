const path = require('path');
const express = require('express');
const cors = require('cors');

const recordsRoutes = require('./routes/records');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/records', recordsRoutes);
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

app.listen(PORT, () => console.log(`Avistamento rodando em http://localhost:${PORT}`));
