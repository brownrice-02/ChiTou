const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//const port = 3000;  // for main server
const port = 3011; // for development only

// routes require
const user_route = require('./server/routes/user_route');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/users', user_route);

app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center; padding: 20px;">Hello, My Server!</h1>');
});

app.listen(port, () => {
    console.log('running successfully');
});