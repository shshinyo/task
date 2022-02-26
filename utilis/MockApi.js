const mockData = require("../test/mockData.json")

function simulateAsyncCall(request) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let task = mockData.tasks.find(task => task.id == request.body.task_id);
        switch (request.method) {
          case 'updateTaskStatus':
            if (task) {
                if (task.assigned_to != request.body.user_id) {
                    // unauthorized operation
                    resolve({ status: 401,body:{ message: 'only the user who assigned to the  task can update it '} });  
                }else{
                    resolve({ status: 200,body:{message:"task status updated"}});
                }
            } else {
              resolve({ status: 400,body:{ message: 'TASK IS NOT EXISTS' }});
            }
            break;
          case 'updateTaskOwner':
            if (task) {
                if (task.assigned_to != request.body.user_id) {
                    // unauthorized operation
                    resolve({ status: 401,body:{ message: 'only the user who assigned to the  task can update it '} });  
                }else if(task.assigned_to ==request.body.new_owner ){
                    resolve({ status: 400,body:{message:`task already assigned to user with id ${request.body.new_owner}`}});

                }
                else{
                    resolve({ status: 200,body:{message:"task owner updated"}});
                }
            } else {
              resolve({ status: 400,body:{ message: 'TASK IS NOT EXISTS' }});
            }
          default:
            resolve({ status: 400, message: 'Bad Request' });
        }
      }, 300);
    });
  }
  module.exports = {simulateAsyncCall}