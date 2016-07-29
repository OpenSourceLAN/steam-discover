"use strict";


var pg = require("pg");


class dbwrapper {
	constructor(options, readyCallback) {
		this.conString = options.connectionString;
		this.excludeFields = options.excludeFields;
	}

	insertClient(clientInfo, batchId) {
		pg.connect(this.conString, (err, client, done) => {
			if (err) {
				throw err;
			}

			var steamId = clientInfo.users[0].steamid;
			batchId = batchId || null;

			client.query("INSERT INTO clientinfo (steamid, data, batchid) VALUES ($1::bigint, $2::jsonb, $3)",
				[
					steamId.toString(),
					clientInfo,
					batchId
				],
				(err, result) => {
					done();
					if (err) throw err;
				});
		});
	}

	insertAccount(accountInfo, batchId) {
		pg.connect(this.conString, (err, client, done) => {
			if (err) {
				throw err;
			}

			var steamId = accountInfo.steamid;
			batchId = batchId || null;

			client.query("INSERT INTO accountinfo (steamid, data, batchid) VALUES ($1::bigint, $2::jsonb, $3)",
				[
					steamId.toString(),
					accountInfo,
					batchId
				],
				(err, result) => {
					done();
					if (err) throw err;
				});
		});
	}
}

module.exports = dbwrapper;
