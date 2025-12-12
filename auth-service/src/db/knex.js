const knex = require('knex');
const { PG_CONNECTION } = process.env;

module.exports = knex({
    client: 'pg',
    connection: PG_CONNECTION
});
