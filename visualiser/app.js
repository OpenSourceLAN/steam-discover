var redis = require('redis'),
	socketio = require('socket.io'),
	http = require('http'),
	url = require('url'),
	fs = require('fs')
	;
/** 
 * TODO: wrap this in express or similar for less crappy hacks. 
 */

var server = http.createServer();
var io = socketio(server);

server.on("request", (req, res) => {
	var urlObj = url.parse(req.url);
	if (!urlObj.path || urlObj.path == '/') {
		var f = fs.readFileSync('./page.html');
		res.writeHead(200);
		res.write(f);
		res.end();
	} else if (urlObj.path.indexOf('socket.io') === -1) {
		// This is TERRIBLE - someone could put 'socket.io' in the 
		// url and if socket.io module doesn't handle it, we'll leak 
		// all the everythings. But quick hack for demo purposes. 
		res.writeHead(400);
		res.end();
	}
});


server.listen(8000);