const knex = require('knex');
module.exports = knex({ client: 'pg', connection: process.env.PG_CONNECTION });
