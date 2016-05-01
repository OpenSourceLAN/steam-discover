var events = require("events"),
    addressFinder = require("./addressFinder.js");

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
	constructor(defaultPort, addresses) {
		super();
		this.sockets = [];
	}

	createSocker(address, port) {
		var newSocket = dgram.createSocker('udp4');
		newSocket.bind(port, address);
		newSocket.setBroadcast(true);
	}

	// For each of the elements in the addresses array,
	// we normalise them.
	getAddress(addr, defaultPort) {
		if (typeof addr == 'string') {

		} else if (typeof addr == 'object') {

		} else if (typeof addr == 'number') {

		}
	}
}

class ipAddress {

}