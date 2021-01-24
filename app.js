//Import the necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require("cors");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

//Import Modulo Employee
const Employee = require("./models/employee");

//Import Private values
const PrivInfo = require('./private');

//Connect to Heroku || Localhost: 5000 || Data base
const PORT = process.env.PORT || 5000
const MONGODB_URL = process.env.MONGODB_URL || PrivInfo.db;

//Initialize express
const app = express();

const sloopSession = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
})

//Initialize csrf
const csrfProtection = csrf();

//Setting up for deployin on Heroku
const corsOptions = {
    origin: PrivInfo.myUrl,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

//Setting up Data Base Options
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

//Require the routers
const mainPagesRoutes = require('./routes/mainRoutes');

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');

//Section Middleware
app.use(bodyParser({ extended: false }));
app.use(
    session({
        secret: PrivInfo.mySecret,
        resave: false,
        saveUninitialized: false,
        store: sloopSession
    }));

//CSRF Middleware | Flash 
app.use(csrfProtection)
    .use(flash())
    .use((req, res, next) => {
        if (!req.session.user) {
            return next();
        }
        Employee.findById(req.session.user._id)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err));
    })

//CSRF Middleware
.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

//Main Router
app.use(mainPagesRoutes);

//CONNECTION
mongoose
    .connect(
        MONGODB_URL, options
    )
    .then(result => {
        app.listen(PORT);
        console.log("LISTENING: 5000")
    })
    .catch(err => {
        console.log(err);
    });