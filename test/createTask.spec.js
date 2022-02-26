const request = require('supertest');
// app is supposed to point to the app.js file
const app = require('../server');
const expect = require("chai").expect;


describe('Testing Create New Task', function () {
    it('respond with valid HTTP status code and message', async function () {
        let response = await request(app).post('/API/task/createtask').send(
            {
                title: "task number 1",
                description: "task number 1 description",
                created_by: 5
            }
        )
        expect(response.status).to.equal(201);
        expect(response.body.message).to.equal("Task created successfully");
    });

    it('respond with valid HTTP Error status code and message (Missing Task Parameters) ', async function () {
        let response = await request(app).post('/API/task/createtask').send(
            {
                description: "task number 1 description",
                created_by: 5
            }
        )
        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal("BAD REQUEST");
    });
});