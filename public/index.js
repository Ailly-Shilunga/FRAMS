console.log("Hello from FRAMS!");

const express = require('express');
const path = require('path');
const app = express();

// Serve static files (HTML, JS, CSS, models, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'live-attendance.html'));
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});