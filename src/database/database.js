const config = require('../../knexfile');
const promisify = require('promisify-node');
const knex = promisify('knex')(config.development);

module.exports = knex;