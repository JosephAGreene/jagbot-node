const fetch = require('node-fetch');
const {steamList} = require("../../startup/steamApps");

module.exports = {
	type: 'steam-news',
	description: 'This is a single response description',
	execute(message, botModule) {
		let appName = "";
		const args = message.content.split(" ").slice(1);

		for (i = 0; i < args.length; i++) {
			appName += `${args[i]} `;
		}

		const appId = steamList[appName.trim().toLowerCase()];

		if (!appId) {
			message.channel.send(`Sorry! Steam doesn't appear to have ${appName}`);
			return;
		};

        fetch(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=1&maxlength=300&format=json`)
        .then(res => res.text())
        .then(body => {message.channel.send(JSON.parse(body).appnews.newsitems[0].url)})
		.catch((error) => {
			message.channel.send(`Sorry! "${appName}" doesn't appear to have any news.`);
		  });
	},
};