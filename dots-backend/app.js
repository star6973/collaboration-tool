/**********************************************************
 * DoTS (Digitalization of Thinking Strategy)
 * KOREATECH CSE Graduation Portfolio Project
 *
 * Created by Haewoong Kwak, Myeonghwa Ji, Seongchan Kim
 **********************************************************/

var express = require('express')
var path = require('path')
var createError = require('http-errors')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var cors = require('cors')
var mongoose = require('mongoose')
var history = require('connect-history-api-fallback')

var db = require('./config/database')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var projectsRouter = require('./routes/projects')
var crawledDataRouter = require('./routes/user-crawled-data')
var mailRouter = require('./routes/mail')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// CORS option
var corsOptions = {
	origin: app.get('env') === 'production' ? 'https://dots-00.appspot.com' : 'http://localhost:8080'
	// origin: 'https://dots-00.appspot.com'
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(history())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors(corsOptions))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/projects', projectsRouter)
app.use('/data', crawledDataRouter)
app.use('/mail', mailRouter)

// connect MongoDB
mongoose.connect(db.uri, db.options)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connetion error'))
db.once('open', function() {
	console.log('Mongoose connected')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
