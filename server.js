const path = require('path');
const express = require('express');
//const router = express.Router();
const bodyParser = require('body-parser');
const expresssLayouts = require('express-ejs-layouts');
const sharedsession = require('express-socket.io-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');

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

let users = [
	{id: 1, name: 'Test1', password: '123456'},
	{id: 2, name: 'Test2', password: '123456'},
	{id: 3, name: 'Test3', password: '123456'},
	{id: 4, name: 'Test4', password: '123456'},
	{id: 5, name: 'Test5', password: '123456'}
]

function verifyUser(name, password) {
	if(name && password){
		const user = users.find(
			user => user.name === name && user.password === password
		)
		if(user) return user
	}
	
}
let connections = {};
function setConnections(con){
	connections = con;
	console.log(connections)
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
app.use(session)

/*
	passport 
	app.use(passport.initialize());
	app.use(passport.session());	
*/

app.use(express.static(path.join(__dirname, '../..build')));
io.use(sharedsession(session, {
	autoSave: true
}))

const redirectHome = (req, res, next) => {
	if(req.session.userId) {
		res.redirect('/tetris')
	} else next()
}

const redirectLogin = (req, res, next) => {
	if(!req.session.userId) {
		res.redirect('/login')
	} else next()
}

function hashPassword(password) {
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(password, salt, (err, hash) => {
			if(err) throw err;

			password = hash;k
		})
	})
}

app.get('/',  (req,res,next) => {
	res.render('Main')

});


app.use(express.static('views'))
app.get('/tetris', redirectLogin, (req,res)=>{
	res.sendFile(path.join(__dirname+'/views/index.html'))
	console.log(req.sessionStore.sessions)
})

app.get('/login', redirectHome, (req, res) => {
	res.render('login');
})

app.post('/login', (req, res) => {
	const {name, password} = req.body;
	let error = '';
	const user = verifyUser(name, password);
	if(user){
		req.session.userId = user;
		return res.redirect('/tetris');

	}
	else {
		error = "Incorrect username or password!"
	    return res.render('login', {error})
}

})

app.get('/register', redirectHome, (req, res) => {
	res.send(`
		<div>
			<form method='post' action='/register'>
				<input name='name' type='text'  placeholder='Name' />
				<input name='password' type='password'  placeholder='Password' />
				<input type='submit'  placeholder='Submit' />
			</form>
		</div>
	`)
})

app.post('/register', (req, res) => {
	const {name, password} = req.body;
	if(name && password){
		const exists = users.some(user => user.name === name)
		if(!exists){
		const user = {
			id: users.length + 1,
			name,
			password
		}
		users.push(user);
		req.session.userId = user;
		return res.redirect('/tetris');
	}
	res.redirect('/register');
}	
})

app.post('/logout', redirectLogin, (req, res) => {
	connections = removeUser(connections, req.session.userId.name);
	io.emit('USER_DISCONNECTED', connections);
	req.session.destroy(err => {
		if(err) {
			return res.redirect('/tetris')
		}
		res.clearCookie(sID);
		res.redirect('/login');
	})
})


const SocketManager = require('./SocketManager')

io.on('connection', function(socket){ 
	
	SocketManager(socket, connections, setConnections);
	console.log('connected')
 }
 
)

server.listen(PORT, console.log("Listening on port: " + PORT));