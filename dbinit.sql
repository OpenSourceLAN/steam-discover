
-- postgres db init script

CREATE TABLE clientinfo (
	id bigint PRIMARY KEY,
	steamid bigint null,
	data jsonb,
	batchid int null,
	time timestamp DEFAULT current_timestamp
);

CREATE TABLE accountinfo (
	id bigint PRIMARY KEY,
	steamid bigint null,
	data jsonb,
	batchid int null,
	time timestamp DEFAULT current_timestamp
);

CREATE INDEX  IF NOT EXISTS clientinfo_steamid ON clientinfo ( steamid );
CREATE INDEX  IF NOT EXISTS accountinfo_steamid ON accountinfo ( steamid );