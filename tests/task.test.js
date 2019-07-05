const request = require('supertest');
const Task = require('../src/models/task');
const {
    FirstTask,
    SecondUserId,
    FirstUserAuthorization,
    SecondUserAuthorization,
    setupDatabase,
} = require('./fixtures/db');

const app = require('../src/app');

beforeEach(setupDatabase);

test('get user tasks successfully', async ()=>{
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', FirstUserAuthorization)
        .send()
        .expect(200);

    expect(response.body.tasks).toHaveLength(2);
});

test('create new task successfully', async ()=>{
    await request(app)
        .post('/tasks')
        .set('Authorization', SecondUserAuthorization)
        .send(FirstTask)
        .expect(201);

    const tasks = await Task.find({owner: SecondUserId});
    expect(tasks).toHaveLength(2);
});