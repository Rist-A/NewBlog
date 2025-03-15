const {Pool} = require('pg')
const pool = new Pool({
    user : "userist",
    password:"rist",
    host:"localhost",
    post:"5432",
    database:"blogdb"
});
module.exports = pool;