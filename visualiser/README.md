### Steam Discover Visualiser

Displays a pie chart of the activity of steam users on your LAN. 

## Installation

```
# make sure Redis and the main steam-discover application are running, then...

cp config.example.json config.json

npm install

node app

#Now open http://localhost:8000/
```

## Including graph on another page

You can include the graph on another page. Because I did this the quick way,
it's not press-button-receive-bacon yet, but if you know HTML/JS it should be 
pretty easy - check out `page.html` and put it on your own page. 

You could create an iframe of this app and edit page.html to match your styles. 