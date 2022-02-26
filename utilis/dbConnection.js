const mysql      = require('mysql');
const dbQuieries  = require('../DB_QUIERIES');

let connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER_NAME,
  password : process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE_NAME
});
 
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
})

module.exports = connection;
connection.query(dbQuieries.CREATE_DATABASE, (err,results) => {
    if(err) throw err;
    if(results.warningCount == 0){
      let useQuery = `USE ${process.env.DB_DATABASE_NAME}`;
      connection.query(useQuery, (error) => {
          if(error) throw error;
          console.log("Using Database");            
          console.log(
          `Created and Using ${process.env.DB_DATABASE_NAME} Database`);
        })
        console.log("Database Created Successfully !");
    }
});


connection.query(dbQuieries.CREATE_TASKS_TABLE, (err) => {
    if(err) throw err;
});
connection.query(dbQuieries.CREATE_AUDITS_LOG_TABLE, (err) => {
    if(err) throw err;
});
