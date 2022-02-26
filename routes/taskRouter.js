const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');



router.post('/createtask', taskController.createTask);
router.put('/updateTaskStatus', taskController.updateTaskStatus);
router.put('/updateTaskOwner', taskController.updateTaskOwner);
router.get('/getTaskHistory/:taskId/:userId', taskController.getTaskHistory);

module.exports = router;