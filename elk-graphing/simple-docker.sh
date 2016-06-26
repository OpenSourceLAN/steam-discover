#!/bin/bash


DATA_DIR=`pwd`

docker build -t ourlogstash .

mkdir -p $DATA_DIR/esdata $DATA_DIR/logstash/data $DATA_DIR/kibanadata $DATA_DIR/logstash/conf.d


docker run -d --name elasticsearch -v "$DATA_DIR/esdata":/usr/share/elasticsearch/data -p 9200:9200 elasticsearch

docker run -d --name logstash -v $DATA_DIR/logstash/conf.d:/etc/logstash/conf.d:ro --net host ourlogstash logstash -f /etc/logstash/conf.d --debug

docker run -d --name kibana -p 5601:5601 -e ELASTICSEARCH_URL=http://localhost:9200 --net host kibana




