const express = require('express');
const app = express();
const dotenv = require('dotenv');
const sequelize = require('./utils/database');
dotenv.config();
const port = process.env.PORT;

sequelize.authenticate();

app.get('/', function(req, res ) { 
    res.send('Hello im listening to get requests on /');
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});