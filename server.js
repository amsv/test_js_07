const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('.'));
app.use(bodyParser.json());

app.get('/catalogData', (req, res) => {
  fs.readFile('./catalog.json', 'utf8', (err, data) => {
    if (err) return;
    res.send(data);
  })
});

app.post('/addToCart', (req, res) => {
  fs.readFile('./cart.json', 'utf8', (err, data) => {
    const cart = JSON.parse(data);
    const item = req.body;

    cart.push(item);

    fs.writeFile('./cart.json', JSON.stringify(cart), err => {
      if (err) {
        res.send('{"result:" "error"');
      } else {
        const resBody = {};
        resBody.result = item;
        res.send(JSON.stringify(resBody));
      }
    });
  })
});

app.listen(3000, function () {
  console.log('server is running on port 3000');
});
