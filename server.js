const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// In-memory database
const database = {
  feedback: [],
  responses: []
};

// Helper function to calculate sentiment score (simple mock implementation)
const calculateSentiment = (comments) => {
  const positiveWords = ['great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'good', 'clean', 'friendly'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'dirty', 'noisy', 'poor', 'disappointed'];
  
  const lowerComments = comments.toLowerCase();
  let score = 0.5;
  
  positiveWords.forEach(word => {
    if (lowerComments.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerComments.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
};

// Simple OAuth2 middleware simulation (for demonstration)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // In production, verify the token properly
  // For this demo, we'll accept any token
  next();
};

// Routes

// POST /feedback - Submit new feedback
app.post('/feedback', authenticateToken, (req, res) => {
  const { customer_name, customer_email, property_id, rating, category, comments } = req.body;
  
  // Validation
  if (!customer_name || !customer_email || !property_id || !rating || !comments) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!customer_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  const feedback = {
    feedback_id: uuidv4(),
    customer_name,
    customer_email,
    property_id,
    rating,
    category: category || 'General',
    comments,
    sentiment_score: calculateSentiment(comments),
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  database.feedback.push(feedback);
  
  res.status(201).json(feedback);
});

// GET /feedback - Retrieve feedback list
app.get('/feedback', authenticateToken, (req, res) => {
  const { property_id, category, status, limit = 20, offset = 0 } = req.query;
  
  let filtered = [...database.feedback];
  
  // Apply filters
  if (property_id) {
    filtered = filtered.filter(f => f.property_id === property_id);
  }
  
  if (category) {
    filtered = filtered.filter(f => f.category === category);
  }
  
  if (status) {
    filtered = filtered.filter(f => f.status === status);
  }
  
  // Apply pagination
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  
  if (limitNum < 0) {
    return res.status(400).json({ error: "Invalid value for 'limit'. Must be a positive integer." });
  }
  
  const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
  
  res.json(paginated);
});

// GET /feedback/:id - Retrieve specific feedback by ID
app.get('/feedback/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const feedback = database.feedback.find(f => f.feedback_id === id);
  
  if (!feedback) {
    return res.status(404).json({ error: `Feedback not found for ID: ${id}` });
  }
  
  res.json(feedback);
});

// PATCH /feedback/:id - Update feedback
app.patch('/feedback/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { category, status } = req.body;
  
  const feedbackIndex = database.feedback.findIndex(f => f.feedback_id === id);
  
  if (feedbackIndex === -1) {
    return res.status(404).json({ error: `Feedback not found for ID: ${id}` });
  }
  
  // Update fields
  if (category !== undefined) {
    database.feedback[feedbackIndex].category = category;
  }
  
  if (status !== undefined) {
    database.feedback[feedbackIndex].status = status;
  }
  
  database.feedback[feedbackIndex].updated_at = new Date().toISOString();
  
  res.json(database.feedback[feedbackIndex]);
});

// POST /feedback/:id/response - Post management response
app.post('/feedback/:id/response', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { response } = req.body;
  
  if (!response) {
    return res.status(400).json({ error: 'Missing required field: response' });
  }
  
  const feedback = database.feedback.find(f => f.feedback_id === id);
  
  if (!feedback) {
    return res.status(404).json({ error: `Feedback not found for ID: ${id}` });
  }
  
  const managementResponse = {
    response_id: uuidv4(),
    feedback_id: id,
    response,
    created_at: new Date().toISOString()
  };
  
  database.responses.push(managementResponse);
  
  res.status(201).json({
    message: 'Response posted successfully',
    ...managementResponse
  });
});

// GET /analytics/summary - Generate summary statistics
app.get('/analytics/summary', authenticateToken, (req, res) => {
  const totalFeedback = database.feedback.length;
  
  if (totalFeedback === 0) {
    return res.json({
      total_feedback: 0,
      average_rating: 0,
      category_counts: {},
      sentiment_average: 0
    });
  }
  
  // Calculate average rating
  const totalRating = database.feedback.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = totalRating / totalFeedback;
  
  // Calculate category counts
  const categoryCounts = {};
  database.feedback.forEach(f => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });
  
  // Calculate average sentiment
  const totalSentiment = database.feedback.reduce((sum, f) => sum + f.sentiment_score, 0);
  const sentimentAverage = totalSentiment / totalFeedback;
  
  res.json({
    total_feedback: totalFeedback,
    average_rating: parseFloat(averageRating.toFixed(2)),
    category_counts: categoryCounts,
    sentiment_average: parseFloat(sentimentAverage.toFixed(2))
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Customer Feedback Management API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;