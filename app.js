var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(expressSession);
var flash = require('req-flash');
var chalk = require('chalk');
var User = require('./models/user');
var Chat = require('./models/chat');
var Room = require('./models/room');
var http = require('http');
var hbs = require('hbs');
var app = express();
var server = http.createServer(app);

/**
 * Hbs helper for JSON data.
 */
hbs.registerHelper('json', function (content) {
  return JSON.stringify(content);
});

hbs.registerHelper('eq', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args[0] == args[1]
});

var io = require('socket.io').listen(server);

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var homeRouter = require('./routes/home');
var forgotPass = require('./routes/forgot');
var resetPass = require('./routes/reset');
var accountRouter = require('./routes/account');
var chatRouter = require('./routes/chats');

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
app.use('/account', accountRouter);
app.use('/chats', chatRouter);

var users = {};
var chatsNs = io.of('/chats');

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

io.on('connection', (socket) => {
  socket.on('login', (data) => {
    User.findOne({
      _id: data.userid
    }).then(user => {
      console.log(chalk.red(user.username + ' connected!'));
      users[data.userid] = true;

      io.emit('publish', {
        usersStatus: users
      });

      socket.on('joinroom', (data) => {
        socket.join(data.room);
        console.log(user.username + ' joined chat room! ' + data.room)
      });

      socket.on('chat', (data) => {
        io.to(data.room).emit('message', {
          username: user.username,
          ...data,
          time: formatAMPM(new Date)
        });
        Room.findOne({
          users: []
        }).then(room => {
          Chat.create({
            username: user.username,
            userid: user._id,
            roomid: room._id,
            message: data.message,
            created: formatAMPM(new Date)
          })
        })
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

chatsNs.on('connection', (socket) => {
  socket.on('privatelogin', (data) => {
    User.findOne({
      _id: data.userid
    }).then(user => {
      console.log(chalk.red(user.username + ' connected!'))
      users[data.userid] = true;

      socket.emit('privatepublish', {
        usersStatus: users
      });

      socket.on('joinprivateroom', (data) => {
        User.findOne({
          _id: data.chatWith
        }).then(chatUser => {
          Room.findOne({
            users: {
              $all: [chatUser._id, user.id]
            }
          }).then(room => {
            if (room === null) {
              //console.log(chalk.red("Room not created! Creating the room"));
              Room.update({
                users: [chatUser._id, user.id]
              }, {
                $set: {
                  users: [chatUser._id, user.id],
                  roomName: data.room
                }
              }, {
                upsert: true
              }).then(newroom => {
                socket.join(newroom._id);
                console.log(chalk.red(user.username + ' joined room ' + room._id));
              });
            } else {
              console.log(chalk.red("Room exist already!"));
            }
            socket.join(room._id);
            console.log(chalk.red(user.username + ' joined room ' + room._id));
          });
        });
      });

      socket.on('privatechat', (data) => {
        Room.findOne({
          users: {
            $all: [data.userid, data.chatterid]
          }
        }).then(room => {
          //console.log("Message from " + data.userid + ": " + data.message);
          //console.log("Broadcasting the data to room " + room._id);
          io.of('/chats').emit('privatemessage', {
            username: user.username,
            ...data,
            time: formatAMPM(new Date)
          });
          Chat.create({
            username: user.username,
            userid: user._id,
            roomid: room._id,
            message: data.message,
            created: formatAMPM(new Date)
          })
        });
      });

      socket.on('disconnect', () => {
        users[data.userid] = false;
        socket.emit('publish', {
          userStatus: users
        })
        io.of('/chats').emit('leftmessage', { message: user.username + ' left Chat.'});
        console.log(user.username + ' disconnected!');
      })
    })
  })

})

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