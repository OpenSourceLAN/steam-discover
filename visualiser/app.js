"use strict";
var redis = require('redis'),
	socketio = require('socket.io'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	querybuffer = require("../querybuffer.js"),
	config = require('./config.json');

var expireInterval = (config.expireStaleUsersAfterSeconds || 120) * 1000,
	graphUpdateInterval = (config.graphUpdateIntervalSeconds || 10) * 1000,
	listenPort = config.listenPort || 8000;

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

server.listen(listenPort);

// This bit will probably scale badly, but it's bed time now and I want to get something working
var playerState = {};
var qb = new querybuffer(graphUpdateInterval, (update) => {
	var now = new Date();

	// Update teh state of any seen players
	update.forEach((player) => {
		player.timestamp = now;
		playerState[player.steamid] = player;
	});

	var games = new gameCounter();

	// Purge any old players, aggregate others
	var expire = new Date(now - expireInterval); // 2 minutes

	Object.keys(playerState).forEach((key) => {
		var player = playerState[key];
		if (player.timestamp < expire) {
			delete playerState[key];
		} else {
			games.addToGame(player.gameid, player.gamename);
		}
	});

	io.emit("message", games.flatten());
});

var redisClient = redis.createClient();
redisClient.on("message", (channel, message) => {
	qb.addItem(JSON.parse(message));
});
redisClient.subscribe("steam-update");


class gameCounter {
	constructor() {
		this.games = {};
	}

	addToGame(gameid, gamename) {
		if (!gameid) {
			gameid = 0;
			gamename = "Not in game, or not playing a Steam game";
		}

		if (this.games[gameid] == undefined) {
			this.games[gameid] = { id: gameid, hits: 1, name: gamename };
		} else {
			this.games[gameid].hits++;
		}
	}

	flatten() {
		var d = [];
		var notInGame = this.games[0];
		Object.keys(this.games).forEach((key) => {
			if (config.showPeopleNotPlayingGames == true || key != 0) {
				d.push(this.games[key]);
			}
		});
		return { games: d, notInGame: notInGame };
	}
}
