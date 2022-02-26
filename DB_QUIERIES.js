const quieries = {
    CREATE_DATABASE: `CREATE DATABASE  IF NOT EXISTS tasks`,
    CREATE_TASKS_TABLE: `CREATE TABLE IF NOT EXISTS task (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(30) NOT NULL,
        description TEXT NOT NULL,
        status Enum ('toDo','InProgress','InQA','Blocked','Done','Deployed'),
        created_by INT(6) UNSIGNED,
        assigned_to INT(6) UNSIGNED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        )`,
    CREATE_AUDITS_LOG_TABLE: `CREATE TABLE IF NOT EXISTS audits_log (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        task_id INT(6) UNSIGNED NOT NULL,
       updated_by INT(6) UNSIGNED,
        type ENUM ('create','update status','update owner'),
        new_owner INT(6) UNSIGNED,
        new_status TEXT, 
        old_status TEXT ,
        old_owner INT(6) UNSIGNED,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
    GET_TASK_BY_ID: `SELECT * FROM TASK WHERE id = ?`,
    GET_TASK_LOGS : `SELECT * FROM audits_log WHERE task_id = ? ORDER BY updated_at `,
    CREATE_TASK: `INSERT INTO Task (title, description, status,created_by,assigned_to) VALUES (?,?,?,?,?)`,
    UPDATE_TASK_STATUS:`UPDATE Task SET status = ? WHERE id = ?`,
    UPDATE_TASK_ASSIGNED_TO:`UPDATE Task SET assigned_to = ? WHERE id = ?`,
    INSERT_EDIT_STATUS_LOG:`INSERT INTO audits_log (task_id,updated_by,type,old_status,new_status) VALUES (?,?,?,?,?)`,
    INSERT_EDIT_OWNER_LOG:`INSERT INTO audits_log (task_id,updated_by,type,old_owner,new_owner) VALUES (?,?,?,?,?)`,
    GET_LAST_INSERTED_ID:`SELECT MAX(id) AS last_id FROM task`,
    INSERT_CREATE_ACTION:`INSERT INTO audits_log (task_id,updated_by,type,new_owner,new_status) VALUES (?,?,?,?,?)`
}

module.exports = quieries;