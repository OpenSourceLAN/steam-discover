"use strict";

var events = require("events"),
	dgram = require("dgram"),
    addressFinder = require("./addressFinder.js");

function getOptions(opts) {
	opts = opts || {};
	var addressesGiven = Array.isArray(opts.addresses);

	if (opts.allAddresses === undefined && addressesGiven == false) {
		opts.allAddresses = true;
	}

	if (opts.addresses != undefined && addressesGiven == false) {
		throw "addresses must be an array";
	}

	if (opts.allAddresses && addressesGiven) {
		throw "You can't specify all addresses, and also provide specific addresses";
	}

	if (!opts.defaultPort) {
		throw "You need to give a port because I havent' programmed support for giving the port in the address yet";
	}
	// opts.defaultPort = 1234;
	// opts.addresses = 

	return opts;
}

/**
 * TODO:
 * * Add ipv6 support
 * * Parse all of the supported address types
 */
class multiSocket extends events {
	/**
	 * addresses - array of IP addresses
	 *    Each address can be one of:
	 *      string "10.0.0.10"
	 *      string "10.0.0.10:1234"
	 *      string "eth0"
	 *      object {address: "10.0.0.10", port: "1234"}
	 *      number 123
	 */
	constructor(options) {
		super();
		this.options = getOptions(options);
		this.sockets = [];

		var addresses = this.getAddresses();
		this.createSockets(addresses);

	}

	messageReceived(m, rinfo) {
		this.emit("message", m, rinfo);
	}

	send(buffer, port, destAddress) {
		this.sockets.forEach((socket) => {
			var address = socket && socket.address ? socket.address() : {address: "ERROR"};

			try {
				console.log(`Sending to address ${destAddress} on ${address.address}:${address.port}`);
				socket.send(buffer, 0, buffer.length, port, destAddress);
			}
			catch (e) {
				console.error(`Could not send on ${address.address}:${address.port}`);
			}
		});
	}

	createSockets(addresses) {
		addresses.forEach((addr) => {
			this.createSocket(addr);
		});
	}

	createSocket(address) {
		var newSocket = dgram.createSocket(address.family);
		newSocket.on("message", this.messageReceived.bind(this));

		// Should we do the same thing on error? When does error happen?
		newSocket.on("close", () => {
			this.removeSocket(newSocket);
		});

		newSocket.on("error", (e) => {
			console.error("The socket broke! ", e);
		})

		newSocket.bind(address.port, address.ipAddress,  () => {
			newSocket.setBroadcast(true);
			this.sockets.push(newSocket);
		});

		return newSocket;
	}

	removeSocket(socket) {
		var index = this.sockets.indexOf(socket);
		if (index >= 0) {
			this.sockets.splice(index,1);
		}
	}
	getAddresses() {
		var systemAddresses = addressFinder();

		if (this.options.allAddresses) {
			return systemAddresses.map((addr) => {
				return this.getAddress(addr,this.options.defaultPort);
			});
		} else {
			return this.options.addresses.map((addr) => {
				return this.getAddress(addr, this.options.defaultPort);
			})
			.filter((addr) => {
				return systemAddresses.indexOf(addr.ipAddress) != -1;
			});
		}

	}

	// For each of the elements in the addresses array,
	// we normalise them.
	getAddress(addr, defaultPort) {
		if (typeof addr == 'string') {
			return new ipAddress(addr, defaultPort);
		} else if (typeof addr == 'object') {
			throw "unsupported";
		} else if (typeof addr == 'number') {
			throw "unsupported";
		}
		throw "unsupported";
	}
}

class ipAddress {
	constructor(ipAddress, port, family) {
		family = family || "udp4";
		if (!port || !ipAddress) {
			throw "no port and/or IP given";
		}

		this.ipAddress = ipAddress;
		this.port = port;
		this.family = family;
	}
}

module.exports = multiSocket;
