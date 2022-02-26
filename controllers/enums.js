const Enum = require('enum');
const states_enum = new Enum(
    { 'toDo': "toDo", 'inProgress': 'InProgress', 
      'inQA': 'InQA' ,'Blocked': 'Blocked' ,
      'Done': 'Done','Deployed':'Deployed' });
const audit_types = new Enum(
    {
     'create': 'create',
     'updateStatus': 'update status',
     'updateOwner': 'update owner' ,
       });
module.exports = {states_enum,audit_types}