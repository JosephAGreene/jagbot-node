const fetch = require('node-fetch');

let steamList = {};

const getSteamApps = () => {
    fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/?')
    .then(res => res.text())
    .then(body => {
        let applist = JSON.parse(body).applist.apps;
        for (i = 0; i < applist.length; i++) {
            if (applist[i].name.includes("™")) {
                let newName = applist[i].name.replace("™",'').trim().toLowerCase();
                console.log(newName);
                steamList[newName] = applist[i].appid;
            } else {
                steamList[applist[i].name.toLowerCase()] = applist[i].appid;
            }
            
        }
    });

    
}

exports.getSteamApps = getSteamApps;
exports.steamList = steamList;