// reports.js - API routes for reports
import express from 'express';
import db from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  autoCategorise, 
  detectDuplicates, 
  calculatePriority, 
  analyzeSentiment,
  predictTrend,
  getGeoClusters,
  getResolutionAnalytics
} from '../intelligence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// multer setup for photo uploads (from tutorial)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'content', 'photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/reports - get all reports
router.get('/reports', (req, res) => {
  let { status, category, priority, search, sort } = req.query;
  
  let query = 'SELECT * FROM reports WHERE 1=1';
  const params = [];
  
  // add filters if provided
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (priority && priority !== 'all') {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  // sorting
  if (sort === 'oldest') {
    query += ' ORDER BY created_at ASC';
  } else if (sort === 'priority') {
    query += " ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END";
  } else {
    query += ' ORDER BY created_at DESC';
  }
  
  const reports = db.prepare(query).all(...params);
  res.json(reports);
});

// GET /api/reports/:id - get one report
router.get('/reports/:id', (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

// POST /api/reports - create new report
router.post('/reports', upload.single('photo'), (req, res) => {
  console.log('Creating new report:', req.body);
  
  const { title, description, category, lat, lng } = req.body;
  
  if (!title || !lat || !lng) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  // auto categorise if not provided
  let finalCategory = category;
  let autoCategory = null;
  let autoConfidence = null;
  
  if (!category) {
    const result = autoCategorise(title, description || '');
    finalCategory = result.category;
    autoCategory = result.category;
    autoConfidence = result.confidence;
  }

  // check for duplicates nearby
  const duplicateCheck = detectDuplicates(latNum, lngNum, finalCategory);

  // calculate priority
  const priority = calculatePriority(finalCategory, latNum, lngNum);

  // sentiment analysis
  const sentiment = analyzeSentiment(description || '');

  // create report
  const reportID = uuidv4();
  const photoFilename = req.file ? req.file.filename : null;

  db.prepare(`
    INSERT INTO reports (id, title, description, category, lat, lng, photo_filename, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(reportID, title, description, finalCategory, latNum, lngNum, photoFilename, priority);

  const newReport = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportID);
  console.log('Report created:', newReport);
  
  res.status(201).json({
    ...newReport,
    intelligence: {
      autoCategory: autoCategory,
      autoConfidence: autoConfidence,
      duplicateCheck: duplicateCheck,
      calculatedPriority: priority,
      sentiment: sentiment
    }
  });
});

// PATCH /api/reports/:id - update report
router.patch('/reports/:id', (req, res) => {
  const { status, priority, category } = req.body;
  const updates = [];
  const params = [];
  
  if (status) {
    updates.push('status = ?');
    params.push(status);
  }
  if (priority) {
    updates.push('priority = ?');
    params.push(priority);
  }
  if (category) {
    updates.push('category = ?');
    params.push(category);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);
  
  const query = `UPDATE reports SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...params);
  
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  res.json(report);
});

// DELETE /api/reports/:id - delete report
router.delete('/reports/:id', (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  
  // delete photo if exists
  if (report && report.photo_filename) {
    const photoPath = path.join(__dirname, '..', '..', 'content', 'photos', report.photo_filename);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }
  
  db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/analytics - get stats
router.get('/analytics', (req, res) => {
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count FROM reports GROUP BY category
  `).all();
  
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM reports GROUP BY status
  `).all();
  
  const byPriority = db.prepare(`
    SELECT priority, COUNT(*) as count FROM reports GROUP BY priority
  `).all();
  
  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
    FROM reports 
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 12
  `).all();
  
  const total = db.prepare('SELECT COUNT(*) as count FROM reports').get();
  
  const avgResolution = db.prepare(`
    SELECT AVG((julianday(updated_at) - julianday(created_at))) as days
    FROM reports
    WHERE status = 'resolved'
  `).get();
  
  res.json({
    byCategory,
    byStatus,
    byPriority,
    byMonth,
    total: total.count,
    avgResolutionDays: avgResolution.days || 0
  });
});

// heatmap data
router.get('/heatmap-data', (req, res) => {
  const reports = db.prepare(`SELECT lat, lng, category FROM reports`).all();
  res.json(reports);
});

// intelligence endpoints
router.get('/intelligence/trend', (req, res) => {
  res.json(predictTrend());
});

router.get('/intelligence/clusters', (req, res) => {
  res.json(getGeoClusters());
});

router.get('/intelligence/resolution', (req, res) => {
  res.json(getResolutionAnalytics());
});

router.post('/intelligence/categorise', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }
  res.json(autoCategorise(title, description || ''));
});

router.post('/intelligence/check-duplicates', (req, res) => {
  const { lat, lng, category } = req.body;
  if (!lat || !lng || !category) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  res.json(detectDuplicates(parseFloat(lat), parseFloat(lng), category));
});

// CSV export
router.get('/export/csv', (req, res) => {
  const reports = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
  
  const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Latitude', 'Longitude', 'Created At', 'Updated At'];
  const csvRows = [headers.join(',')];
  
  for (const r of reports) {
    const row = [
      r.id,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      r.category,
      r.status,
      r.priority,
      r.lat,
      r.lng,
      r.created_at,
      r.updated_at
    ];
    csvRows.push(row.join(','));
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=civictrack-reports.csv');
  res.send(csvRows.join('\n'));
});

// comments
router.get('/reports/:id/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT * FROM report_comments WHERE report_id = ? ORDER BY created_at DESC
  `).all(req.params.id);
  res.json(comments);
});

router.post('/reports/:id/comments', (req, res) => {
  const { content, is_internal, author_type } = req.body;
  const reportId = req.params.id;

  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }

  const author = author_type || 'citizen';
  if (author !== 'council') {
    return res.status(403).json({ error: 'Only council can add updates' });
  }

  const commentID = uuidv4();
  db.prepare(`
    INSERT INTO report_comments (id, report_id, content, is_internal, author_type)
    VALUES (?, ?, ?, ?, ?)
  `).run(commentID, reportId, content, is_internal ? 1 : 0, author);

  const comment = db.prepare('SELECT * FROM report_comments WHERE id = ?').get(commentID);
  res.status(201).json(comment);
});

router.delete('/comments/:id', (req, res) => {
  const userType = (req.get('x-user-type') || '').toLowerCase();
  if (userType !== 'council') {
    return res.status(403).json({ error: 'Only council can delete' });
  }

  db.prepare('DELETE FROM report_comments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
