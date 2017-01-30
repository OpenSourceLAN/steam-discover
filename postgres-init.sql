
-- postgres db init script

DROP TABLE clientinfo;
DROP TABLE accountinfo;

CREATE TABLE clientinfo (
	id bigserial PRIMARY KEY,
	steamid bigint null,
	data jsonb,
	batchid int null,
	time timestamp DEFAULT current_timestamp
);

CREATE TABLE accountinfo (
	id bigserial PRIMARY KEY,
	steamid bigint null,
	data jsonb,
	batchid int null,
	time timestamp DEFAULT current_timestamp
);

CREATE INDEX  IF NOT EXISTS clientinfo_steamid ON clientinfo ( steamid );
CREATE INDEX  IF NOT EXISTS accountinfo_steamid ON accountinfo ( steamid );