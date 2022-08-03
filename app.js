var express = require('express');
const http = require('http');

const app = express();

app.get('/', (req, res) => {
  res.send('not hello');
});

app.get('/api/user', (req, res) => {
  res.json('hi, go away');
});

app.listen(3000, () => {
  console.log('Server is running at port 3000');
});
