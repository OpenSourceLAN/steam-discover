/**
 * Module to find all system IP addresses
 * Optionally filterable by interface name
 */

var os = require("os");

function getOptions(opts) {
	opts = opts || {};

	// opts.interfaces = ['eth0', 'eth1', ...]
	
	if (opts.allInterfaces === undefined) {
		opts.allInterfaces = true;
	}
	return opts;
}

function addressFinder(options) {
	options = getOptions(options);

	var systemInterfaces = os.networkInterfaces();

	if (options.interfaces) {
		for (var ifaceName in systemInterfaces) {
			if (opts.interfaces.indexOf(ifaceName) === -1) {
				delete systemInterfaces[ifaceName];
			}
		}
	}

	var addresses = getAddressesFromSystemInterfaces(systemInterfaces);
	return addresses;
}

function getAddressesFromSystemInterfaces(interfaces) {
	var addresses = [];

	for (var ifaceName in interfaces) {
		var iface = interfaces[ifaceName];
		var ifaceAddresses = iface.filter((address) => {
			return address.internal == false && address.family == "IPv4";
		})
		.map((address) => {
			return address.address;
		});

		addresses = addresses.concat(ifaceAddresses);
	}
	return addresses;
}

module.exports = addressFinder;