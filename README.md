

## Steam Discoverer

A tool to discover Steam clients on your network and find out what they are playing. 

### Features

* Discovers steam clients on your LAN using the In Home Streaming discovery protocol
* Looks up Steam API to see what they're playing
* Optionally stores data in DB (postgres) for later analysis
* Optionally pipes data to a redis pub/sub queue
* Live graph of what people are playing (requires redis pub/sub queue)

### How it works

Steam Home Broadcast uses a UDP discovery mechanism to find other steam clients.
We use this for the first step to find out which Steam IDs are present on 
the LAN.

Then, we query the Steam API to find out what each Steam ID is doing.
The API returns the user's display name and the current game. Hey presto,
we have our data!

There are two caveats here - 

1) If a user does not have steam home broadcast enabled, we will not know that they exist
2) If a user has their Steam profile set to private, we will be able to see what their display name is, but not if they're online or which game they're playing


### Roadmap

* Make library to abstract this listening - expose just "we saw a client, here's details!"
* Add more configuration options, eg, immediately anonymise data (don't record steam ID)

### Installation

```
npm install

cp config.example.json config.json

# Make sure to insert your own Steam API key and postgres connection info in here!
# Get your Steam API key from http://steamcommunity.com/dev/apikey
editor config.json

# Connect to your postgres DB, create a user and database, and run the dbinit.sql script

node app.js
```

In this configuration, data is saved to a postgres database for later analysis. 

Using the `config.json` file, you can disable postgres if you don't want 
to save the data. You can also enable Redis to enable the usage of the 
live updating graph (see next section)

### Live updating graph

The `visualiser` directory contains another small app that provides a web page 
with a live updating graph of which games people are playing. 
