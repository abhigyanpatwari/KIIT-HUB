// File to trigger a new Vercel deployment
module.exports = (req, res) => {
  res.json({
    message: 'Deployment trigger file',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}; 