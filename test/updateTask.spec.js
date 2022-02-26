const request = require('supertest');
const MockAPI = require("../utilis/MockApi").simulateAsyncCall
const app = require('../server');
const expect = require("chai").expect;

describe('Testing update Task Status', function () {
    it('respond with valid HTTP status code and message', async function () {
        let body = {user_id:1,task_id:1,new_status:"InProgress"}
        let task = await MockAPI({method:'updateTaskStatus',body})
        expect(task.status).to.equal(200);
        expect(task.body.message).to.equal("task status updated");

    });

    it('respond with Error HTTP status code and message (with invalid task)', async function () {
        let body = {user_id:1 , task_id:20 , new_status:"InProgress"}
        let task = await MockAPI({method:'updateTaskStatus',body});
        expect(task.status).to.equal(400);
        expect(task.body.message).to.equal("TASK IS NOT EXISTS");

    });
});


describe('Testing update Task Owner', function () {
    it('respond with valid HTTP status code and message', async function () {
        let body = {user_id:1,task_id:1,new_owner:4}
        let task = await MockAPI({method:'updateTaskOwner',body})
        expect(task.status).to.equal(200);
        expect(task.body.message).to.equal("task owner updated");

    });
    it('check when the  new owner equals to old owner ', async function () {
        let body = {user_id:1,task_id:1,new_owner:1}
        let task = await MockAPI({method:'updateTaskOwner',body})
        expect(task.status).to.equal(400);
        expect(task.body.message).to.equal(`task already assigned to user with id ${body.new_owner}`);

    });
    

    it('respond with Error HTTP status code and message (with invalid task)', async function () {
        let body = {user_id:1 , task_id:20 , new_owner:2}
        let task = await MockAPI({method:'updateTaskOwner',body})
        expect(task.status).to.equal(400);
        expect(task.body.message).to.equal("TASK IS NOT EXISTS");

    });
});