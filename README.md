

## Steam Discoverer

A tool to discover Steam clients on your network and find out what they are playing. 

### Features

* Discovers steam clients on your LAN using the In Home Streaming discovery protocol
* Looks up Steam API to see what they're playing
* Stores data in DB (postgres) for later analysis
* Optionally pipes data to a redis pub/sub queue
* Live graph of what people are playing (requires redis pub/sub queue)

### Roadmap

* Make library to abstract this listening - expose just "we saw a client, here's details!"
* Add more configuration options, eg, immediately anonymise data (don't record steam ID)

### Installation

```
npm install

cp config.example.json config.json

# Make sure to insert your own Steam API key and postgres connection info in here!
editor config.json

# Connect to your postgres DB, create a user and database, and run the dbinit.sql script

node app.js
```

### Live updating graph

The `visualiser` directory contains another small app that provides a web page 
with a live updating graph of which games people are playing. 