

## Steam Discoverer

A tool to discover Steam clients on your network and find out what they are playing. 

### Features

* Discovers steam clients on your LAN using the In Home Streaming discovery protocol
* Looks up Steam API to see what they're playing
* Optionally stores data in DB (postgres) for later analysis
* Optionally pipes data to a redis pub/sub queue
* Live graph of what people are playing (requires redis pub/sub queue)

### How it works

Steam In-Home Steaming uses a UDP discovery mechanism to find other steam clients.
We use this for the first step to find out which Steam IDs are present on 
the LAN.

Then, we query the Steam API to find out what each Steam ID is doing.
The API returns the user's display name and the current game. Hey presto,
we have our data!

There are three caveats here - 

1. If a user does not have steam in-home streaming enabled, we will not know that they exist
2. If a user has their Steam profile set to private, we will be able to see what their display name is, but not if they're online or which game they're playing
3. The Steam API is limited to "100k requests per hour" (or something like that, per the terms of use) - so if you're at a giant LAN party, don't set this to poll the API every 2 seconds. 

### FAQ

**Woah, this is scary. You can, like, totally stalk me?**

Correct. You can opt out of this by disabling in-home streaming. If you are 
the person running this utility, *please do not abuse the data*. Don't 
publish it online. Strip all identifiable data from your dataset ASAP. 
Be a Good Person, okay? 

In fact, if you just want to get the cool graph of how many people are
playing which games, you should just disable postgres (see config.json) so 
that no data is ever stored :)

**Can I see which non-steam games people are playing in Steam?**

According to the Steam API documentation, yes. But in reality, 
the API does not return this information, so I cannot give it to
you. I'm sorry :(

**Can I get this data for Origin, LoL, Battle.Net, etc?**

No. Not with this tool, as this is a very Steam-specific tool. 
The other services have APIs, and maybe there is a way to identify
users on your LAN - I don't know, I haven't looked :)

**Do you have any screenshots?**

Not yet. It's just a pie chart and a text console. Very exciting stuff. 

### Roadmap

* Make library to abstract this listening - expose just "we saw a client, here's details!"
* Add more configuration options, eg, immediately anonymise data (don't record steam ID)
* Add feature to auto-anonymise data, so that 

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
