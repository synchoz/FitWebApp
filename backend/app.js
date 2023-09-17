const express = require('express');
const app = express();
const dotenv = require('dotenv');
const sequelizeDB = require('./utils/database');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const cors = require('cors');
dotenv.config();
const port = process.env.PORT;
let corsOptions = {
    origin: "http://localhost:3000",
};
  
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/users', userRoutes);

/* const _userName = 'synchoz';
const _email = 'synchoz@gmail.com' */

sequelizeDB.authenticate();

/* async function getUsers() {
    let users = await User.findAll();
    return users;
} */


//this one worked user at carefulness it drops table....
/* User.sync({ force: true }).then(async () => {
    const jane = await User.create({ username: "Dima2", email: "Dima@gmail.com" });
    console.log("Jane's auto-generated ID:", jane.id);
}); */

/* const users = getUsers().then(users => {
    console.log(users)
}); */

/* app.use('/users', users); */

app.get('/', function(req, res ) { 
    res.send('Hello im listening to get requests on /');
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});