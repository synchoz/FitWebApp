const express = require('express');
/* const fileUpload = require('express-fileupload'); */
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const helmet = require('helmet');
const sequelizeDB = require('./utils/database');
const userRoutes = require('./routes/users');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiters');
const refreshTokenService = require('./services/refreshTokenService');
const passwordResetService = require('./services/passwordResetService');
const port = process.env.PORT;

const EXPIRED_TOKEN_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

function purgeExpiredTokens() {
    refreshTokenService.purgeExpired().catch((error) => {
        console.error('Failed to purge expired refresh tokens:', error);
    });
    passwordResetService.purgeExpired().catch((error) => {
        console.error('Failed to purge expired password reset tokens:', error);
    });
}

/* app.use(fileUpload()); */
app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use('/api/', apiLimiter);
app.use('/api/users', userRoutes);

/* app.get('/', function(req, res ) {
    res.send('Hello im listening to get requests on /');
}); */

app.use(errorHandler);

async function initializeDB() {
    await sequelizeDB.authenticate();
    console.log('Connection has been established successfully.');
    const { hostname, pathname } = new URL(process.env.DATABASE_URL);
    console.log(`Connected to ${pathname.slice(1)} on ${hostname}`);
}

initializeDB()
    .then(() => {
        app.listen(port, function () {
            console.log(`App listening on port ${port}!`);
        });
        purgeExpiredTokens();
        setInterval(purgeExpiredTokens, EXPIRED_TOKEN_CLEANUP_INTERVAL_MS);
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    });