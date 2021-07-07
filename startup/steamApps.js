const fetch = require('node-fetch');

let steamList = {};

const getSteamApps = () => {
    fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/?')
    .then(res => res.text())
    .then(body => {
        // Build a object of appname [key] and appid [value], sanitized to remove special characters for usability
        let applist = JSON.parse(body).applist.apps;
        for (i = 0; i < applist.length; i++) {
            let newName = applist[i].name.replace(/™/g,'').replace(/®/g, '').trim().toLowerCase();
            steamList[newName] = applist[i].appid;
        }
        console.log("Ready: steamList")
    });
}

exports.getSteamApps = getSteamApps;
exports.steamList = steamList;