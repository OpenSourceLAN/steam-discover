

## Steam Discoverer

Listens to broadcast traffic for Steam clients advertising their in home streaming. 

This traffic contains some useful metadata, like their Steam ID, OS version, if they're playing a game and other such lovely things. 

### Roadmap

* Make library to abstract this listening - expose just "we saw a client, here's details!"
* Add discovery broadcast packet so we can ask Steam clients for their information, we don't have to wait for them to advertise
* Use library to correlate with the Steam API to find out who is playing which game
