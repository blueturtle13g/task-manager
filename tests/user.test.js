const request = require('supertest');
const Task = require('../src/models/task');
const User = require('../src/models/user');
const {
    FirstUser,
    SecondUser,
    FirstTask,
    SecondTask,
    ThirdTask,
    FirstUserId,
    SecondUserId,
    FirstUserAuthorization,
    SecondUserAuthorization,
    setupDatabase,
} = require('./fixtures/db');

const app = require('../src/app');

beforeEach(setupDatabase);

test('get current user successfully', async ()=>{
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', FirstUserAuthorization)
        .send()
        .expect(200);

    expect(response.body.user.name).toEqual(FirstUser.name);
});

test('cannot get current user without token', async ()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('signup successfully', async ()=>{
    const response = await request(app)
        .post('/users')
        .send({
            name: 'ali',
            email: 'ali@gmail.com',
            password: 'somepass',
        })
        .expect(201);

    expect(response.body.user.name).toEqual('ali');
});

test('cannot signup without email', async ()=>{
    await request(app)
        .post('/users')
        .send({
            name: 'ali',
            password: 'somepass',
        })
        .expect(400);
});

test('login successfully', async ()=>{
    const response = await request(app)
        .post('/users/login')
        .send({
            email: FirstUser.email,
            password: FirstUser.password,
        })
        .expect(200);

    expect(response.body.user.name).toEqual(FirstUser.name);
});

test('cannot login with wrong password', async ()=>{
    await request(app)
        .post('/users/login')
        .send({
            email: SecondUser.email,
            password: FirstUser.password,
        })
        .expect(400);
});

test('logout successfully', async ()=>{
    await request(app)
        .post('/users/logout')
        .set('Authorization', SecondUserAuthorization)
        .send()
        .expect(200);
});

test('cannot logout without token', async ()=>{
    await request(app)
        .post('/users/logout')
        .send()
        .expect(401);
});

test('upload avatar successfully', async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', SecondUserAuthorization)
        .attach('avatar', 'tests/fixtures/img.png')
        .expect(200);

    const user = await User.findById(SecondUserId);
    expect(user.avatar).not.toBeNull();
});

test('cannot upload files with types other than image', async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', SecondUserAuthorization)
        .attach('avatar', 'tests/fixtures/db.js')
        .expect(400);

    const user = await User.findById(SecondUserId);
    expect(user.avatar).not.toBeDefined();
});