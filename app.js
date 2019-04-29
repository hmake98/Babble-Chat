var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(expressSession);
var flash = require('req-flash');
var User = require('./models/user');
var Chat = require('./models/chat');
var Room = require('./models/room');
var http = require('http');
var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var homeRouter = require('./routes/home');
var forgotPass = require('./routes/forgot');
var resetPass = require('./routes/reset');

mongoose.connect('mongodb://localhost:27017/forgotpass', {
  useNewUrlParser: true
});

mongoose.Promise = global.Promise;

app.use(expressSession({
  secret: 'Sh! Key',
  store: new MongoStore({
    url: 'mongodb://localhost:27017/forgotpass'
  }),
  resave: false,
  saveUninitialized: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('socketio', io);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/forgot', forgotPass);
app.use('/reset', resetPass);

var users = {};

io.on('connection', (socket) => {
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  socket.on('login', (data) => {
    User.findOne({
      _id: data.userid
    }).then(user => {
      console.log(user.username + ' connected!');
      users[data.userid] = true;
      io.emit('publish', {
        usersStatus: users
      });
      socket.on('joinroom', (data) => {
        socket.join(data.room);
        console.log(user.username + ' joined chat room! ' + data.room)
        Room.create({
          room: 'general',
          users: users
        })
      });
      socket.on('chat', (data) => {
        io.to(data.room).emit('message', { username: user.username, ...data, time: formatAMPM(new Date) });
        Room.findOneAndUpdate({room: 'general'}, {$set: { chat: { username: user.username, ...data, time: formatAMPM(new Date) } }});
      });
      socket.on('disconnect', () => {
        users[data.userid] = false;
        io.emit('publish', {
          usersStatus: users
        })
        console.log(user.username + ' disconnected!');
      })
    });
  });
});

app.set('users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(3001);

module.exports = app;