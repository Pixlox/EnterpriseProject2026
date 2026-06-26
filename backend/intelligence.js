// intelligence.js - auto categorisation and duplicate detection
import db from './database.js';

// keyword matching for categories
const KEYWORDS = {
  pothole: ['pothole', 'hole', 'crack', 'road damage'],
  signage: ['sign', 'signage', 'street sign', 'traffic sign'],
  graffiti: ['graffiti', 'vandalism', 'spray paint', 'tag'],
  dumping: ['dumping', 'rubbish', 'trash', 'garbage', 'waste', 'litter'],
  maintenance: ['maintenance', 'repair', 'broken', 'damaged', 'overgrown', 'tree'],
  lighting: ['light', 'street light', 'lamp', 'dark', 'streetlight'],
  other: []
};

// auto categorise based on keywords
export function autoCategorise(title, description) {
  console.log('running auto categorise for:', title);
  const text = `${title} ${description}`.toLowerCase();
  let bestCat = 'other';
  let bestScore = 0;

  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (cat === 'other') continue;
    let score = 0;
    for (const word of words) {
      if (text.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  const confidence = bestScore > 0 ? Math.min(bestScore * 30, 95) : 0;
  return { category: bestCat, confidence };
}

// check for duplicates nearby
// haversine formula from: https://www.movable-type.co.uk/scripts/latlong.html
export function detectDuplicates(lat, lng, category, excludeId = null) {
  const RADIUS = 25; // metres
  
  // need subquery because sqlite HAVING without GROUP BY doesnt work
  let query = `
    SELECT * FROM (
      SELECT id, title, category, lat, lng, status,
        (6371000 * acos(
          cos(radians(?)) * cos(radians(lat)) *
          cos(radians(lng) - radians(?)) +
          sin(radians(?)) * sin(radians(lat))
        )) AS distance
      FROM reports
      WHERE category = ?
    ) subq
    WHERE distance <= ?
  `;
  const params = [lat, lng, lat, category, RADIUS];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  query += ' ORDER BY distance LIMIT 5';

  try {
    const dupes = db.prepare(query).all(...params);
    return {
      isDuplicate: dupes.length > 0,
      duplicates: dupes.map(d => ({
        id: d.id,
        title: d.title,
        distance: Math.round(d.distance),
        status: d.status
      })),
      nearestDistance: dupes.length > 0 ? Math.round(dupes[0].distance) : null
    };
  } catch (e) {
    console.log('duplicate detection error:', e);
    return { isDuplicate: false, duplicates: [], nearestDistance: null };
  }
}

// calculate priority based on category and nearby reports
export function calculatePriority(category, lat, lng) {
  const severity = { pothole: 8, signage: 5, graffiti: 4, dumping: 7, maintenance: 6, lighting: 9, other: 5 };
  const base = severity[category] || 5;

  // count nearby reports
  const nearbyCount = db.prepare(`
    SELECT COUNT(*) as count FROM (
      SELECT (6371000 * acos(
        cos(radians(?)) * cos(radians(lat)) *
        cos(radians(lng) - radians(?)) +
        sin(radians(?)) * sin(radians(lat))
      )) AS dist FROM reports
    ) subq WHERE dist <= 100
  `).get(lat, lng, lat).count;

  const score = base + Math.min(nearbyCount, 5);

  if (score >= 10) return 'urgent';
  if (score >= 7) return 'high';
  if (score >= 5) return 'normal';
  return 'low';
}

// simple sentiment analysis
export function analyzeSentiment(text) {
  if (!text) return { sentiment: 'neutral', score: 0 };

  const lower = text.toLowerCase();
  const posWords = ['good', 'great', 'fixed', 'resolved', 'thanks', 'happy', 'fine', 'okay'];
  const negWords = ['bad', 'broken', 'damaged', 'dangerous', 'urgent', 'hazard', 'frustrated', 'terrible'];

  let pos = 0, neg = 0;
  for (const w of posWords) { if (lower.includes(w)) pos++; }
  for (const w of negWords) { if (lower.includes(w)) neg++; }

  const total = pos + neg;
  if (total === 0) return { sentiment: 'neutral', score: 0 };

  const score = (pos - neg) / total;
  const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
  return { sentiment, score: Math.round(score * 100) / 100 };
}

// predict trend using linear regression
// formula from: https://en.wikipedia.org/wiki/Simple_linear_regression
export function predictTrend() {
  const monthlyData = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM reports
    GROUP BY month
    ORDER BY month ASC
  `).all();

  if (monthlyData.length < 2) {
    return { 
      trend: 'insufficient_data',
      prediction: monthlyData.length > 0 ? monthlyData[0].count : 0,
      slope: 0,
      monthlyData 
    };
  }

  // i dont really get how this works, copied from:
  // https://en.wikipedia.org/wiki/Simple_linear_regression
  const n = monthlyData.length;
  const xVals = monthlyData.map((_, i) => i);
  const yVals = monthlyData.map(d => d.count);

  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);
  const sumXY = xVals.reduce((a, x, i) => a + x * yVals[i], 0);
  const sumX2 = xVals.reduce((a, x) => a + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const prediction = Math.max(0, Math.round(slope * n + intercept));

  let trend = 'stable';
  if (slope > 0.5) trend = 'increasing';
  else if (slope < -0.5) trend = 'decreasing';

  return {
    trend,
    slope: Math.round(slope * 100) / 100,
    prediction,
    monthlyData
  };
}

// simple grid-based clustering
export function getGeoClusters() {
  const reports = db.prepare(`SELECT lat, lng, category, status FROM reports`).all();

  const clusters = {};
  
  for (const r of reports) {
    const gridLat = Math.round(r.lat * 100) / 100;
    const gridLng = Math.round(r.lng * 100) / 100;
    const key = `${gridLat},${gridLng}`;
    
    if (!clusters[key]) {
      clusters[key] = { lat: gridLat, lng: gridLng, count: 0, categories: {}, statuses: {} };
    }
    
    clusters[key].count++;
    clusters[key].categories[r.category] = (clusters[key].categories[r.category] || 0) + 1;
    clusters[key].statuses[r.status] = (clusters[key].statuses[r.status] || 0) + 1;
  }

  return Object.values(clusters).sort((a, b) => b.count - a.count);
}

// resolution analytics
export function getResolutionAnalytics() {
  const byCategory = db.prepare(`
    SELECT category,
      AVG(julianday(updated_at) - julianday(created_at)) as avg_days,
      MIN(julianday(updated_at) - julianday(created_at)) as min_days,
      MAX(julianday(updated_at) - julianday(created_at)) as max_days,
      COUNT(*) as total_resolved
    FROM reports
    WHERE status = 'resolved'
    GROUP BY category
  `).all();

  const overall = db.prepare(`
    SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days
    FROM reports WHERE status = 'resolved'
  `).get();

  const total = db.prepare('SELECT COUNT(*) as count FROM reports').get();
  const resolved = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'resolved'").get();

  return {
    byCategory,
    overall: overall || { avg_days: 0 },
    resolutionRate: total.count > 0 ? Math.round((resolved.count / total.count) * 100) : 0,
    totalReports: total.count,
    totalResolved: resolved.count
  };
}
