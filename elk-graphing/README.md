
### Pushing this data in to an ELK stack

Thanks to [/u/s0liddi](https://www.reddit.com/r/lanparty/comments/4nb8rs/vectorama_2016_trying_out_opensourcelans/d4gqpsr)
on reddit, we have a neat configuration for an ELK stack to display all of the data. 

To run this, simply run the docker-simple.sh script on a linux host with Docker
installed and configure steam-discover to run on the same host, with the
following entry in its `data-sinks` configuration:

```
{
	"type": "udp",
	"enabled": true,
	"options": {
		"udp6": false,
		"host": "127.0.0.1",
		"port": 9999
	}
}

```

Once both steam-discover and the 3 ELK docker containers are running, you
can access the Kibana interface on http://localhost:5601/

The script will make folders in the current working directory for the
logstash and ES containers to persist their data.
