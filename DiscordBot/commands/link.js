let main = require('../main');

module.exports = {
	name: 'link',
	description: 'Ping!',
	args: true,
	usage: '<battletag> <platform> <region>',
	async execute(message, args) {
		let a = {
			battletag: args[0],
			platform: args[1].toLowerCase(),
			region: args[2].toLowerCase()
		}

		if (!/\w+#\d+/.test(a.battletag)) {
			message.channel.send(`${a.battletag} isn't a valid battletag.`);
			return;
		} else if (a.platform != "pc" && a.platform != "psn" && a.platform != "xbl" && a.platform != "nintendo-switch") {
			message.channel.send(`\`${a.platform}\` isn't a valid platform. \`pc | psn | xbl | nintendo-switch\``);
			return;
		} else if (a.region != 'us' && a.region != 'eu' && a.region != 'asia') {
			message.channel.send(`${a.region} isn't a valid region.`);
			return;
		}

		await main.Register(message, a);
	}
}