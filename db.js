var sql = require('mysql');

function connect(){
    var con = sql.createConnection({
        host: "localhost",
        port: 3306, 
        user: "root",
        password: "password",
        database: "bamazon",
        multipleStatements: true
    });
    return con;
}

module.exports = {
    connect: connect
}