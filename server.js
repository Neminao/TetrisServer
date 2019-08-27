const path = require('path');
const express = require('express');
//const router = express.Router();
const bodyParser = require('body-parser');
const expresssLayouts = require('express-ejs-layouts');
const sharedsession = require('express-socket.io-session');
const bcrypt = require('bcryptjs');
/*const db = require('./models');
const passport = require('./config/passport');*/
const { database } = require('./database/MySQLConnection');



//require('./config/passport')(passport);

const app = express();
app.use(expresssLayouts);
app.set('view engine', 'ejs');

let server = require('http').createServer(app);

let io = module.exports.io = require('socket.io')(server);


const {
	PORT = 3231,
	sID = 'sid'
} = process.env
const session = require("express-session")({
	secret: 'tajna',
	resave: false,
	saveUninitialized: true,
	name: sID,
	cookie: {
		sameSite: true,

	}
})

/*let users = [
	{ id: 1, name: 'Test1', password: '123456' },
	{ id: 2, name: 'Test2', password: '123456' },
	{ id: 3, name: 'Test3', password: '123456' },
	{ id: 4, name: 'Test4', password: '123456' },
	{ id: 5, name: 'Test5', password: '123456' }
]*/

/*function verifyUser(name, password) {
	if (name && password) {
		const user = users.find(
			user => user.name === name && user.password === password
		)
		if (user) return user
	}

}*/
let connections = {};
function setConnections(con) {
	connections = con;

}
function removeUser(userList, username) {
	let newList = Object.assign({}, userList);
	delete newList[username];
	return newList;
}
//app.use(express.cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}))

/*
	app.use(flash());
	app.use((req, res, next) => {
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg);
		res.locals.error = req.flash('error');
		next();
	});

*/

app.use(session)

/*
	passport 
	app.use(passport.initialize());
	app.use(passport.session());	
*/

io.use(sharedsession(session, {
	autoSave: true
}))

const redirectHome = (req, res, next) => {
	if (req.session.userId) {
		res.redirect('/tetris')
	} else next()
}

const redirectLogin = (req, res, next) => {
	if (!req.session.userId) {
		res.redirect('/login')
	} else next()
}

function hashPassword(password) {
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(password, salt, (err, hash) => {
			if (err) throw err;

			password = hash; k
		})
	})
}

app.get('/', (req, res, next) => {
	res.render('Main')

});




app.use(express.static('views'))
app.get('/tetris', redirectLogin, (req, res) => {
	res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/login', redirectHome, (req, res) => {
	res.render('login');
})

app.post('/login', (req, res, next) => {
	const { name, password } = req.body;
	let error = '';
	//const user = verifyUser(name, password);
	database.getConnection(function (err, con) {
		if (err) throw err;
		con.query("SELECT * FROM user where name = ?", [name], function (err, result, fields) {
			con.release();
			if (err) throw err;
			if (result[0] && bcrypt.compareSync(password, result[0].password)) {

				req.session.userId = result[0];
				return res.redirect('/tetris');

			}
			/*
				passport.authenticate('local', {
					successRedirect: '/tetris',
					failureRedirect: '/login',
					failureFlash: true 
				})(req,res,next)
			*/
			/*if(user){
				req.session.userId = user;
				return res.redirect('/tetris');
		
			}*/
			else {
				error = "Incorrect username or password!"
				return res.render('login', { error })

			}

		})
	})
})

app.get('/register', redirectHome, (req, res) => {
	res.render('register');
})

app.post('/register', (req, res) => {
	const { name, password } = req.body;
	let exists = false;
	let hashedPassword = null;
	if (name && password) {
		//const exists = users.some(user => user.name === name)
		database.getConnection(function (err, con) {
			con.release()
			if(err) throw err;
			con.query("SELECT * FROM user where name = ?", [name], function (err, result, fields) {
				if (err) throw err;
				if (result[0]) {
					exists = true;
					res.render('register', { error: "Username already exists!" });
				}
			});
		})
		setTimeout(function(){
		if (!exists) {
			if(password.length < 6){
				return res.render('register', { error: "Password must be at least 6 characters!" });
			}
			const salt = bcrypt.genSaltSync(10)
			hashedPassword = bcrypt.hashSync(password, salt)
			/*const user = {
				id: users.length + 1,
				name,
				password
			}
			users.push(user);*/
			//req.session.userId = user;
			
			if (hashedPassword) {
				database.getConnection(function (err, con) {
				con.release();
				if(err) throw err;
				con.query("INSERT INTO user VALUES (null, ?, ?, 1)", [name, hashedPassword]);
				return res.render('login', { error: "Registration successful!" });
				})
			}
		
		}}, 3000)
		
	
	}
})

app.post('/logout', redirectLogin, (req, res) => {
	connections = removeUser(connections, req.session.userId.name);
	io.emit('USER_DISCONNECTED', connections);
	req.session.destroy(err => {
		if (err) {
			return res.redirect('/tetris')
		}
		res.clearCookie(sID);
		res.render('login', { error: "You've been logged out successfully!" });
	})
})


const SocketManager = require('./SocketManager')

io.on('connection', function (socket) {

	SocketManager(socket, connections, setConnections);
	socket.on('SETTINGS', ({difficulty, showAnimation}) => {
		console.log('yo')
		app.use(function(req,res,next){
			req.session.userId.showAnimation = showAnimation;
			console.log(req.session)
		})
	})
	console.log('connected')
}

)


server.listen(PORT, console.log("Listening on port: " + PORT));