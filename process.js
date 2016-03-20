var redisModule= require('redis'),
    fs = require('fs'),
    redis = redisModule.createClient();

var games = {};

redis.llen('players', function(e,length) {
    console.log("Number of values: ", length);
    redis.lrange('players', 0, length, function(e, players) {
    	console.log(players.length);
    	players.forEach(function(p) {
    		var player = JSON.parse(p);
    		if (!games[player.gameid]) {
    			games[player.gameid] = 0;
            }
    		games[player.gameid]++;
    	});
    	console.log(games);

    	for (var key in games) {
    		redis.hset('games', key, games[key]);
    	}
    	
    });
});

