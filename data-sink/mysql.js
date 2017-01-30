"use strict";


var mysql = require('mysql');


class dbwrapper {
	constructor(options, readyCallback) {
		options.connectionLimit == options.connectionLimit || 20;
		this.connection = mysql.createPool(options);
	}

	insertClient(clientInfo, batchId) {
		
		var steamId = clientInfo.users[0].steamid;
		batchId = batchId || null;

		this.connection.query("INSERT INTO clientinfo (steamid, data, batchid) VALUES (?, ?, ?)",
			[
				steamId.toString(),
				JSON.stringify(clientInfo),
				batchId
			],
			(err, result) => {
				if (err) throw err;
			});
	}

	insertAccount(accountInfo, batchId) {
		
		var steamId = accountInfo.steamid;
		batchId = batchId || null;

		this.connection.query("INSERT INTO accountinfo (steamid, data, batchid) VALUES (?, ?, ?)",
			[
				steamId.toString(),
				JSON.stringify(accountInfo),
				batchId
			],
			(err, result) => {
				if (err) throw err;
			});
	}
}

module.exports = dbwrapper;
