const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// PostgreSQL connection using Kubernetes service name
const pool = new Pool({
  user: 'postgres',
  host: 'postgres-postgresql', // Kubernetes service name
  database: 'postgres',
  password: 'mysecurepass', // From our helm install
  port: 5432,
});

// Initialize database table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        customer_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Payment Service',
    status: 'running',
    database: 'connected',
    version: '1.0.0'
  });
});

// Create a new payment
app.post('/payments', async (req, res) => {
  try {
    const { amount, currency = 'USD', customer_id } = req.body;
    
    if (!amount || !customer_id) {
      return res.status(400).json({ error: 'Amount and customer_id are required' });
    }

    const result = await pool.query(
      'INSERT INTO payments (amount, currency, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [amount, currency, customer_id]
    );

    res.status(201).json({
      message: 'Payment created successfully',
      payment: result.rows[0]
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get payment by ID
app.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      message: 'Payment retrieved successfully',
      payment: result.rows[0]
    });
  } catch (err) {
    console.error('Payment retrieval error:', err);
    res.status(500).json({ error: 'Failed to retrieve payment' });
  }
});

// Get all payments
app.get('/payments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json({
      message: 'Payments retrieved successfully',
      payments: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Payments retrieval error:', err);
    res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});

// Update payment status
app.patch('/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      message: 'Payment status updated successfully',
      payment: result.rows[0]
    });
  } catch (err) {
    console.error('Payment status update error:', err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      database: 'connected',
      timestamp: result.rows[0].now,
      status: 'healthy'
    });
  } catch (err) {
    console.error('Database health check error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Payment service running on port ${PORT}`);
  await initDatabase();
});
