console.log("Hello from FRAMS!");
git addconst express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to FRAMS!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});vvss