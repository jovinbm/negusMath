var envVariables = require('./environment_config.js');
var databaseURL = envVariables.databaseURL();
var databaseURL2 = envVariables.databaseURL2();
var databaseURL3 = "mongodb://localhost:27017/math4";

//THE APP
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 2000;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var moment = require('moment');

console.log("ENVIRONMENT = " + process.env.NODE_ENV);

//mongoose.set('debug', true);
mongoose.connect(databaseURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: Problem while attempting to connect to database'));
db.once('open', function () {
    console.log("Successfully connected to database");
});

var basic = require('./functions/basic.js');
var consoleLogger = require('./functions/basic.js').consoleLogger;
var middleware = require('./functions/middleware.js');
var routes = require('./routes/router.js');
var basicAPI = require('./routes/basic_api.js');
var postAPI = require('./routes/post_api.js');
var loginAPI = require('./routes/login_api.js');
var logoutAPI = require('./routes/logout_api.js');

var fileName = 'app.js';

var receivedLogger = function (module) {
    var rL = require('./functions/basic.js').receivedLogger;
    rL(fileName, module);
};

var successLogger = function (module, text) {
    var sL = require('./functions/basic.js').successLogger;
    return sL(fileName, module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('./functions/basic.js').errorLogger;
    return eL(fileName, module, text, err);
};

function getTheUser(req) {
    return req.customData.theUser;
}

app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use("/bower_components", express.static(path.join(__dirname, '/bower_components')));
app.use("/public", express.static(path.join(__dirname, '/public')));
app.use("/views", express.static(path.join(__dirname, '/views')));
app.use("/error", express.static(path.join(__dirname, '/public/error')));

app.use(require('prerender-node').set('prerenderServiceUrl', 'https://jbmprerender.herokuapp.com/'));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    key: 'hstatickey',
    cookie: {path: '/', httpOnly: true, secure: false, maxAge: 604800000000},
    secret: 'hssjbm12234bsidh)))^Hjdsb',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    saveUninitialized: false,
    resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

//configure passport
require('./passport/passport.js')(passport, LocalStrategy);

io.on('connection', function (socket) {
    socket.on('joinRoom', function (data) {
        var room = data.room;
        socket.join(room);
        socket.emit('joined');
    });
});

//app.post('/contactUs', basicAPI.contactUs);
app.get('/socket.io/socket.io.js', function (req, res) {
    res.sendfile("socket.io/socket.io.js");
});

//getting files
app.get('/', routes.renderHome_Html);
app.get('/index', routes.index_Html);
app.get('/search', routes.search_Html);

//login api
app.post('/createAccount', loginAPI.createAccount);
app.post('/localUserLogin', loginAPI.localUserLogin);

//logout api
app.post('/api/logoutClient', middleware.ensureAuthenticatedAngular, middleware.addUserData, logoutAPI.logoutClient);

//info api
app.get('/api/getUserData', loginAPI.getUserData);

app.post('/api/getPosts', postAPI.getPosts);
app.post('/api/getSuggestedPosts', postAPI.getSuggestedPosts);
app.post('/api/getPost', postAPI.getPost);
app.post('/api/newPost', middleware.ensureAuthenticatedAngular, middleware.addUserData, postAPI.newPost);
app.post('/api/updatePost', middleware.ensureAuthenticatedAngular, middleware.addUserData, postAPI.updatePost);
app.post('/api/getHotThisWeek', postAPI.getHotThisWeek);
app.post('/api/searchForPosts', postAPI.searchForPosts);

//error handlers
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        console.log("XHR ERROR HANDLED by clientErrorHandler");
        //if this is an ajax request
        res.status(500).send({
            code: 500,
            notify: true,
            type: 'error',
            banner: true,
            bannerClass: 'alert alert-dismissible alert-warning',
            msg: 'An error occurred. Please reload page',
            disable: true
        });
    } else {
        //request is not ajax, forward error
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    console.log("NON XHR ERROR HANDLED by errorHandler");
    res.status(500);
    res.sendFile(path.join(__dirname, './public/error/', '500.html'));
}

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

server.listen(port, function () {
    consoleLogger("Server listening at port " + port);
});
exports.io = io;