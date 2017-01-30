CREATE TABLE clientinfo (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	steamid bigint null,
	data json,
	batchid int null,
	time timestamp DEFAULT current_timestamp
);

CREATE TABLE accountinfo (
	id INTEGER  AUTO_INCREMENT PRIMARY KEY,
	steamid bigint null,
	data json,
	batchid int null,
	time timestamp DEFAULT current_timestamp
);
