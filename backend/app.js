const express = require('express');
/* const fileUpload = require('express-fileupload'); */
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const sequelizeDB = require('./utils/database');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const cors = require('cors');
const port = process.env.PORT;

/* app.use(fileUpload()); */
app.use(cors())
app.use(express.json());
app.use('/api/users', userRoutes);

/* app.get('/', function(req, res ) { 
    res.send('Hello im listening to get requests on /');
}); */



app.use((err,req,res,next) => {
    console.log(err.stack);
    res.status(500).send('Something didnt go well...');
})

async function initializeDB() {
    try {
        await sequelizeDB.authenticate();
        console.log('Connection has been established successfully.');
        const dbName = process.env.DBDATABASE || process.env.DB_LOCAL_DATABASE;
        const dbUser = process.env.DBUSERNAME || process.env.DB_LOCAL_USERNAME;
        console.log(`${dbName} ${process.env.DBHOST} ${dbUser}`)
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

initializeDB();

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});