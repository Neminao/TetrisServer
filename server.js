const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
let server = require('http').createServer(app);
let io = module.exports.io = require('socket.io')(server);
const sharedsession = require('express-socket.io-session');
const {
	PORT = 3231, 
	sID = 'sid'
} = process.env
const session = require("express-session")({
	secret: 'tajna',
	resave: false,
	saveUninitialized: false, 
	name: sID,
	cookie: {
		sameSite: true,

	}
})

const users = [
	{id: 1, name: 'Test1', password: '123456'},
	{id: 2, name: 'Test2', password: '123456'},
	{id: 3, name: 'Test3', password: '123456'}
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
//app.use(express.cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(session)
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

app.get('/',  (req,res,next) => {
	res.send(`
		<div>
			<a href='/login'>Login</a>
			<a href='/register'>Register</a>

			<form method='post' action='/logout'>
				<button>Logout</button>
			</form>
		</div>
	`)

});


app.use(express.static('build'))
app.get('/tetris', redirectLogin, (req,res)=>{
	res.sendFile(path.join(__dirname+'/build/index.html'))
	console.log(req.sessionStore.sessions)
})

app.get('/login', redirectHome, (req, res) => {
	res.send(`
		<div>
			<form method='post' action='/login'>
				<input name='name' type='text'  placeholder='Name' required/>
				<input name='password' type='password'  placeholder='Password' required/>
				<input type='submit'  value='Submit' />
			</form>
		</div>

	`)
})

app.post('/login', (req, res) => {
	const {name, password} = req.body;
	const user = verifyUser(name, password);
	if(user){
		req.session.userId = user;
		return res.redirect('/tetris');
	}
	else return res.redirect('/login')
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

server.listen(PORT);