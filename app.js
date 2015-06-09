var envVariables = require('./environment_config.js');
var databaseURL = envVariables.databaseURL();
var databaseURL2 = envVariables.databaseURL2();
var databaseURL3 = "mongodb://" + envVariables.math4Username() + ":" + envVariables.math4Password() + "@localhost:27017/math4";
var dbUrl = databaseURL3;

//THE APP
var express = require('express');
var params = require('express-params');
var app = require('express')();
params.extend(app);
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
var multer = require('multer');
var s3 = require('./functions/s3.js');
var emailModule = require('./functions/email.js');
var sideUpdates = require('./db/side_updates_db.js');
var upload_params = require('./functions/upload_params.js');

console.log("ENVIRONMENT = " + process.env.NODE_ENV);

//mongoose.set('debug', true);
mongoose.connect(dbUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: Problem while attempting to connect to database'));
db.once('open', function () {
    console.log("Successfully connected to database " + dbUrl);
});

var basic = require('./functions/basic.js');
var consoleLogger = require('./functions/basic.js').consoleLogger;
var middleware = require('./functions/middleware.js');
var routes = require('./routes/router.js');
var basicAPI = require('./routes/basic_api.js');
var postAPI = require('./routes/post_api.js');
var userAPI = require('./routes/user_api.js');
var uploadAPI = require('./routes/upload_api.js');
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
    return basic.getTheUser(req);
}

app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));

//skip sessions for these routes
app.use("/bower_components", express.static(path.join(__dirname, '/bower_components')));
app.use("/public", express.static(path.join(__dirname, '/public')));
app.use("/uploads", express.static(path.join(__dirname, '/uploads')));
app.use("/views", express.static(path.join(__dirname, '/views')));
app.use("/error", express.static(path.join(__dirname, '/public/error')));

//prerender-node
app.use(require('prerender-node').set('prerenderServiceUrl', 'https://jbmprerender.herokuapp.com/'));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(session({
    name: 'negusMath.id',
    secret: 'hjfdsvjf324yo2340',
    cookie: {path: '/', httpOnly: true, secure: false, maxAge: null},
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
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
app.get('/index', routes.index_Html);
app.get('/', middleware.ensureAuthenticated, middleware.addUserData, middleware.checkAccountStatus, routes.renderHome_Html);
app.param('pageNumber', /^[0-9]+$/);
app.get('/partial/posts/:pageNumber', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, routes.renderPosts_partial);
app.param('postIndex', /^[0-9]+$/);
app.get('/post/:postIndex', middleware.ensureAuthenticated, middleware.addUserData, middleware.checkAccountStatus, routes.renderIndividualPost);
app.get('/manage/users', middleware.ensureAuthenticated, middleware.addUserData, middleware.checkAccountStatus, middleware.checkUserIsAdmin, routes.manage_users);
app.get('/new/post', middleware.ensureAuthenticated, middleware.addUserData, middleware.checkAccountStatus, middleware.checkUserIsAdmin, routes.new_post);
app.get('/edit/post/:postIndex', middleware.ensureAuthenticated, middleware.addUserData, middleware.checkAccountStatus, middleware.checkUserIsAdmin, routes.edit_post);
app.param('pageNumber', /^[0-9]+$/);
app.get('/search/posts/:queryString/:pageNumber', middleware.ensureAuthenticated, middleware.addUserData, middleware.checkAccountStatus, routes.search_posts);
app.get('/partial/search/posts/:queryString/:pageNumber', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, routes.search_posts_partial);


//email api
app.get('/email_archive/:templateGroup', routes.renderEmail);
app.post('/resendConfirmationEmail', middleware.ensureAuthenticatedXhr, middleware.addUserData, basicAPI.resendConfirmationEmail);
app.get('/confirm_email/:hashedUniqueCuid', basicAPI.confirmEmail);

//login api
app.post('/createAccount', loginAPI.createAccount);
app.post('/localUserLogin', loginAPI.localUserLogin);
app.get('/pageNotFound', routes.render_not_found);
app.get('/notAuthorizedPage', routes.render_not_authorized_access_page);
app.get('/notLoggedIn', routes.render_not_logged_in);
app.get('/error/500', routes.render_error_500);

//logout api
app.post('/api/logoutClient', middleware.ensureAuthenticatedXhr, middleware.addUserData, logoutAPI.logoutClient);

//info api
app.get('/api/getUserData', loginAPI.getUserData);

//post and search api
app.post('/api/getPosts', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, postAPI.getPosts);
app.post('/api/getSuggestedPosts', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, postAPI.getSuggestedPosts);
app.post('/api/getPost', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, postAPI.getPost);
app.post('/api/getPopularStories', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, postAPI.getPopularStories);
app.post('/api/mainSearch', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, postAPI.mainSearch);
app.post('/api/newPost', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, postAPI.newPost);
app.post('/api/updatePost', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, postAPI.updatePost);
app.post('/api/trashPost', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, postAPI.trashPost);
app.post('/api/unTrashPost', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, postAPI.unTrashPost);
app.post('/api/deletePost', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, postAPI.deletePost);


//user management api
app.post('/api/getUsersCount', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getUsersCount);
app.post('/api/getAllUsers', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getAllUsers);
app.post('/api/getAdminUsers', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getAdminUsers);
app.post('/api/addAdminPrivileges', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.addAdminPrivileges);
app.post('/api/removeAdminPrivileges', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.removeAdminPrivileges);
app.post('/api/getLocalUsers', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getLocalUsers);
app.post('/api/getApprovedUsers', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getApprovedUsers);
app.post('/api/approveUser', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.approveUser);
app.post('/api/getUsersNotApproved', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getUsersNotApproved);
app.post('/api/getBannedUsers', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getBannedUsers);
app.post('/api/banUser', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.banUser);
app.post('/api/unBanUser', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.unBanUser);
app.post('/api/getUsersNotBanned', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, userAPI.getUsersNotBanned);

//upload api
app.post('/api/uploadPostImage', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, multer(upload_params.postImageParams()), uploadAPI.uploadPostImage);
app.post('/api/uploadPdf', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, multer(upload_params.pdfParams()), uploadAPI.uploadPdf);
app.post('/api/uploadZip', middleware.ensureAuthenticatedXhr, middleware.addUserData, middleware.checkAccountStatusXhr, middleware.checkUserIsAdminXhr, multer(upload_params.zipParams()), uploadAPI.uploadZip);

//not found
app.get('*', routes.render_not_found);
app.post('*', routes.render_not_found);

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
            msg: 'An error occurred. Please try again or reload page',
            disable: true
        });
    } else {
        //request is not ajax, forward error
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    console.log("ERROR HANDLED by ERROR-HANDLER");
    res.redirect('/error/500');
}

function resolveUploadErrors(err, req, res, next) {
    if (err.customStatus == 'upload') {
        res.status(500).send({
            code: 500,
            notify: true,
            type: 'warning',
            msg: 'An error has occurred. Please try again'
        });
    } else {
        next(err);
    }
}

app.use(logErrors);
app.use(resolveUploadErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

server.listen(port, function () {
    consoleLogger("Server listening at port " + port);
});
exports.io = io;