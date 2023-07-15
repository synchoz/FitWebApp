const express = require('express');
const app = express();
const dotenv = require('dotenv');
const sequelizeDB = require('./utils/database');
const User = require('./models/user');
dotenv.config();
const port = process.env.PORT;

sequelizeDB.authenticate();

async function getUsers() {
    let users = await User.findAll();
    return users;
}


//this one worked user at carefulness
User.sync({ force: true }).then(async () => {
    const jane = await User.create({ username: "Dima2", email: "Dima@gmail.com" });
    console.log("Jane's auto-generated ID:", jane.id);
});

const users = getUsers().then(users => {
    console.log(users)
});


app.get('/', function(req, res ) { 
    res.send('Hello im listening to get requests on /');
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});