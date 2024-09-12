const express = require('express');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const connectEnsureLogin = require('connect-ensure-login');
const { exec, spawn } = require('child_process');
const path = require('path');
const { roles } = require('./utils/constants');

// Initialization
const app = express();
const port = process.env.PORT || 3000;
let pythonProcess = null;

app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Init Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
      httpOnly: true
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.DB_NAME
    }),
  })
);

// For passport.js authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/user', connectEnsureLogin.ensureLoggedIn({ redirectTo: '/auth/login' }), require('./routes/user.route'));
app.use('/admin', connectEnsureLogin.ensureLoggedIn({ redirectTo: '/auth/login' }), ensureAdmin, require('./routes/admin.route'));

// Guidelines Route
app.use('/guide', require('./routes/guide.route'));

// Python script control routes
app.get('/start-python', (req, res) => {
  if (pythonProcess) {
    res.send('Python script is already running.');
    return;
  }

  pythonProcess = spawn('python', ['first.py']);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  

  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    pythonProcess = null;
  });

  res.send('Camera is Starting!!');
});

app.get('/stop-python', (req, res) => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    res.send('Camera stopped.');
  } else {
    res.send('Python script is not running.');
  }
});

// Error handling
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render('error_40x', { error });
});

// Start the server
mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.DB_NAME
})
  .then(() => {
    console.log("Database Connected");
    app.listen(port, () => console.log(`Running on port ${port}`));
  })
  .catch((err) => console.log(err.message));

function ensureAdmin(req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
    req.flash('warning', 'You are not authorized to visit');
    res.redirect('/');
  }
}
