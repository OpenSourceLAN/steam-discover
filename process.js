var redisModule= require('redis'),
    fs = require('fs'),
    redis = redisModule.createClient();

var games = {},
    hours = {},
    hourZero = 1 * new Date("2016-04-16T01:00:00.000Z");
        
function getUnique (arr) {
  var seen = {};
  var ret = [];

  arr.filter(function(item) {
    if (!seen[item]) {
      ret.push(item);
      seen[item] = true;
    }
  });
  return ret;
}

function addToHour(time, obj) {
    var hourNum = Math.floor(((1 * time) - hourZero ) / (1000 * 60 * 60) );
    if (!hours[hourNum]) {
        hours[hourNum] = [];
    }
    hours[hourNum].push(obj);
}

function addToCount(list, obj) {
    if (obj) {
        if (!list[obj]) {
            list[obj] = 1;
        } else {
            list[obj]++;
        }
    }
}

function getTotalsForHours() {
    var totals = {};
    console.log(hours.length);
    for (var i in hours) {
        h = hours[i];
        var gameCount = {};
        var time = new Date(hourZero + (i * 1000 * 60 * 60));
        h.forEach((d) => { addToCount(gameCount, d.gamename)});
        
        var gamePop = Object.keys(gameCount).map((key) => {
            return { game: key, count: gameCount[key]}
        }).
        sort((a,b) => { return b.count - a.count} );

        totals[time.toString()] = {
            count: h.length,
            uniques: getUnique(h.map((d) => { return d.name })).length,
            games:  gamePop
        }
    };
    return totals;
}

redis.llen('players', function(e,length) {
        console.log(Array.isArray(hours));

    console.log("Number of values: ", length);
    redis.lrange('players', 0, length, function(e, players) {
    	console.log(players.length);
    	
        players.forEach(function(p) {
    		var record = JSON.parse(p),
                time = new Date(record.time);
            addToHour(time, record);

    	});    console.log(hours.length);

        fs.writeFileSync("hourSummary3.json", JSON.stringify(getTotalsForHours(), null, 2));
console.log("DONE!");
    });
});
