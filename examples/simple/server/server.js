'use strict';

const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'static')));

app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.listen(process.env.PORT || 8000, '0.0.0.0', function () {
  console.log('app listening on port ', process.env.PORT || 8000);
});
