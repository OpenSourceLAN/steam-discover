

## Steam Discoverer

A tool to discover Steam clients on your network and find out what they are playing. 

### Features

* Discovers steam clients on your LAN using the In Home Streaming discovery protocol
* Looks up Steam API to see what they're playing
* Stores data in DB (currently redis) for later analysis

### Roadmap

* Make library to abstract this listening - expose just "we saw a client, here's details!"
* Add web dashboard to get real time visualisation of the state of your LAN
* Add configuration options, eg, immediately anonymise data (don't record steam ID), Steam API polling interval, 


### Installation

```
npm install

# get patched version of certain steam-api file
wget -O node_modules/steam-api/steam/containers/Player.js https://raw.githubusercontent.com/sirsquidness/steam-api-node/master/steam/containers/Player.js

echo "Your-steam-api-key-here" > apikey.txt

node app.js
```

