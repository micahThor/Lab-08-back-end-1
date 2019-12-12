DROP TABLE IF EXISTS weathers;
DROP TABLE IF EXISTS locations;

CREATE TABLE IF NOT EXISTS locations ( 
    id SERIAL PRIMARY KEY NOT NULL, 
    search_query VARCHAR(255) NOT NULL, 
    formatted_query VARCHAR(255) NOT NULL, 
    latitude NUMERIC(10, 7) NOT NULL, 
    longitude NUMERIC(10, 7) NOT NULL
  );

CREATE TABLE IF NOT EXISTS weathers ( 
    id SERIAL PRIMARY KEY NOT NULL, 
    forecast VARCHAR(255) NOT NULL, 
    time VARCHAR(255) NOT NULL
  );

