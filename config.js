let config = {};
config.sql = {};

config.sql.host = process.env.HOST;
config.sql.port = process.env.PORT;
config.sql.user = process.env.USER;
config.sql.password = process.env.PASSWORD;
config.sql.database = process.env.DATABASE;

module.exports = config;
