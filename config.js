let config = {};
config.sql = {};

config.sql.host = process.env.MYSQLHOST;
config.sql.port = process.env.MYSQLPORT;
config.sql.user = process.env.MYSQLUSER;
config.sql.password = process.env.MYSQLPASSWORD;
config.sql.database = process.env.MYSQLDATABASE;

module.exports = config;
