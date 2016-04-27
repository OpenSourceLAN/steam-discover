



var getopt = require("posix-getopt");

var parser = new getopt.BasicParser('b:(broadcast)i:(interval)h(help)', process.argv),
	options = {
		interfaces: [],
		interval: 15
	},
	option;


function showUsage() {
	console._stdout.write( `Steam Discover:
	Usage:

	-h --help	Show help
	-b --broadcast	(Repeated) Define interface to broadcast on
	-i --interval 	Define how often to send broadcast discovery packets

	Example:

	node app.js -b 10.0.0.255 -b 10.1.1.255 -b 10.2.2.255 -i 60
`);
}

while (option = parser.getopt())
{
	switch (option.option) {
		case 'b':
			options.interfaces.push(option.optarg);
			break;
		case 'i':
			options.interval = parseInt(option.optarg,10);
			break;
		case 'h':
			showUsage();
			process.exit(0);
			break;

	}
}

if (!options.interval) {
	throw "Invalid interval specificed on command line";
}

module.export = options;