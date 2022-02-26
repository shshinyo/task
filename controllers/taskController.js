
const enums = require('./enums');
const connection = require('../utilis/dbConnection');
const quieries = require('../DB_QUIERIES');

async function createTask(req, res) {
    try {
        let task = req.body;
        let title = task.title;
        let description = task.description;
        let created_by = task.created_by;
        if (!title || !description || !created_by) return res.status(400).send({ message: "BAD REQUEST" })
        connection.beginTransaction(async (err) => {
            if (err) {
                res.status(400).send({ message: 'Create Task Transaction Error' });
            }
            connection.query(quieries.CREATE_TASK, [title, description, enums.states_enum.toDo.value, created_by, created_by], async (err, results) => {
                if (err) {
                    return connection.rollback(function () {
                        res.status(400).send({ message: 'Create Task Error,Transaction rollback' });
                    });
                }
                connection.query(quieries.GET_LAST_INSERTED_ID, (err, lastId) => {
                    if (err) {
                        return connection.rollback(function () {
                            res.status(400).send({ message: 'Insert Audit Log Error!,Transaction rollback' });
                        });
                    }
                    connection.query(quieries.INSERT_CREATE_ACTION, [lastId[0].last_id, created_by, enums.audit_types.create.value, created_by, enums.states_enum.toDo.value], (err, results) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(400).send({ message: 'Create Task Transaction Error,Transaction rollback' });
                            });
                        }

                        connection.commit(function (err) {
                            console.log('Commiting transaction.....');
                            if (err) {
                                return connection.rollback(() => {
                                    return res.status(400).send({ message: 'Create Task Transaction Error,Transaction rollback' });
                                });
                            } else {
                                return res.status(201).send({ message: "Task created successfully" })
                            }
                        })

                    })
                });

            })

        })

    } catch (err) {
        res.status(400).send('Create Task error');
    }
}
async function updateTaskStatus(req, res) {
    try {
        let task_id = req.body.task_id;
        let user_id = req.body.user_id;
        let new_status = req.body.new_status;
        if (!user_id||!task_id||!new_status)res.status(400)
        await connection.query(quieries.GET_TASK_BY_ID, [task_id], (err, rows, fields) => {
            if (err) {
                res.status(400).send(err);
            }
            let task = rows[0];
            if(!task) return res.status(400).send({message:"TASK IS NOT EXISTS"});
            let isvalid_new_state = checkIfAcceptedStatusChange(task, new_status);
            if (!isvalid_new_state) {
               return res.status(400).send({message:"INVALID STATUS"});
            }
            let assigned_to = task.assigned_to;
            let old_status = task.status;
            if (assigned_to != user_id) {
                // unauthorized operation
               return res.status(401).send({message:"only the user who assigned to the  task can update it "})
            } else {
                connection.beginTransaction(async (err) => {
                    if (err) {
                        res.status(400);
                    }
                    connection.query(quieries.UPDATE_TASK_STATUS, [new_status, task_id], async (err, results) => {
                        if (err) {
                            return connection.rollback(function () {
                                res.status(400);
                            });
                        }
                        // let insert_log_query = `INSERT INTO audits_log (task_id,updated_by,type,old_status,new_status) VALUES (?,?,?,?,?)`
                        connection.query(quieries.INSERT_EDIT_STATUS_LOG, [task_id, assigned_to, enums.audit_types.updateStatus.value, old_status, new_status], (err, results) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(400);
                                });
                            }
                            connection.commit(function (err) {
                                console.log('Commiting transaction.....', results);
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(400);
                                    });
                                }else{
                                    return res.status(200).send({message:"task status updated"})
                                }
                            })

                        })
                    })

                })
            }
        })

    } catch (err) {
        console.log(err)
    }
}

async function updateTaskOwner(req, res) {
    try {
        let task_id = req.body.task_id;
        let user_id = req.body.user_id;
        let new_owner = req.body.new_owner;
        if (!user_id || !task_id || !new_owner)res.status(401)
        await connection.query(quieries.GET_TASK_BY_ID, [task_id], (err, rows, fields) => {
            if (err) {
                res.status(400).send(err);
            }
            let task = rows[0];
            if(!task) return res.status(400).send({message:"TASK IS NOT EXISTS"});
            let assigned_to = task.assigned_to;
            let old_status = task.status;
            if (assigned_to != user_id) {
                // unauthorized operation
                res.status(401).send({message:"Only the user who assigned to the  task can update it "})
            }else if(assigned_to == new_owner){
                res.status(400).send({message:`task already assigned to user with id ${new_owner}`})
            } else {
                connection.beginTransaction(async (err) => {
                    if (err) {
                        res.status(400);
                        res.send(err)
                    }
                    connection.query(quieries.UPDATE_TASK_ASSIGNED_TO, [new_owner, task_id], async (err, results) => {
                        if (err) {
                            return connection.rollback(function () {
                                res.status(400);
                                res.send(err)
                            });
                        }
                        connection.query(quieries.INSERT_EDIT_OWNER_LOG, [task_id, assigned_to, enums.audit_types.updateOwner.value, assigned_to, new_owner], (err, results) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(400);
                                    res.send(err)
                                });
                            }
                            connection.commit(function (err) {
                                console.log('Commiting transaction.....', results);
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(400);
                                        res.send(err)
                                    });
                                }else{
                                    return res.status(200).send({message:"task owner updated"})
                                }
                            })

                        })
                    })

                })
            }
        })

    } catch (err) {
        console.log(err)
    }
}

async function getTaskHistory(req, res) {
 try {
     let task_id = req.params.taskId;
     let user_id = req.params.userId;

     if(!task_id) {
        return res.status(400).send({message: 'bad task id'});
     }
     if(!task_id) {
        return res.status(401).send({message: 'bad user_id, un authorized operation'});
     }

     await connection.query(quieries.GET_TASK_BY_ID, [task_id], async (err, rows, fields) => {
         if(!rows || !rows[0]) {
            return res.status(400).send({message:"TASK IS NOT EXISTS"});
         }
        let task = rows[0];
        if(user_id != task.assigned_to){
        return res.status(401).send({message: 'only assigned to user is allowed to access the requested task'});
        }

     await connection.query(quieries.GET_TASK_LOGS, [task_id], (err, rows, fields) => {
        if(!rows){ 
            return res.status(400).send([]);
        }else {
            return res.status(200).send(rows)
        }
     })
     })
 } catch (error) {
     
 }
}

function checkIfAcceptedStatusChange(task,new_status){
    try{

        let statusTransitions = {
            'toDo': [enums.states_enum.inProgress.value],
            'InProgress': [enums.states_enum.Blocked.value,enums.states_enum.inQA.value],
            'Blocked': [enums.states_enum.toDo.value],
            'InQA': [enums.states_enum.toDo.value,enums.states_enum.Done.value],
            'Done': [enums.states_enum.Deployed.value],
            'Deployed': []
      }
      let status = statusTransitions[task.status].includes(new_status);
      return status;
    }catch(err){
        return false
    }
}
module.exports = {
    createTask,
    updateTaskStatus,
    getTaskHistory,
    updateTaskOwner
}