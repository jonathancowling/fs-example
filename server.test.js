const fs = require('fs');
const mock = require('mock-fs');
const request = require('supertest');
const app = require('./server');
require('iconv-lite').encodingExists('foo');


const users = [
    { "userId": "5b16d178-b6b3-4345-91c5-8c927dd0b063", "name": "Emily", "age": 26, "avatar": "135-0-4.jpg" },
    { "userId": "27407af6-d961-4041-a5b0-899976bead03", "name": "Mike", "age": 28, "avatar": "273-0-4.jpg" },
    { "userId": "147d5076-b31f-4be0-b1b6-04aec7844670", "name": "Edward", "age": 29, "avatar": "95-1-4.jpg" },
    { "userId": "147d5076-b31f-4be0-b1b6-04aec7844671", "name": "Clem", "age": 100 }
];

beforeEach(() => {
    mock({
        'data': {
            'users.json': JSON.stringify(users),
            '135-0-4.jpg': Buffer.from([1, 3, 5, 0, 4, 100]),
            '273-0-4.jpg': Buffer.from([2, 7, 3, 0, 4, 101]),
        },
    });
});

afterEach(() => {
    mock.restore();
})

describe('GET /users', () => {
    it('should return the users', done => {
        request(app)
            .get('/users')
            .expect('Content-Type', /json/)
            .expect(200, JSON.stringify(users))
            .end(done)
    });
});

describe('GET /users/names', () => {
    it('should return the users\' names', done => {
        request(app)
            .get('/users/names')
            .expect('Content-Type', /json/)
            .expect(200, JSON.stringify(users.map(u => u.name)))
            .end(done)
    });
});

describe('GET /user/:userId', () => {
    it('should return the user if it exists', done => {
        request(app)
            .get('/user/27407af6-d961-4041-a5b0-899976bead03')
            .expect('Content-Type', /json/)
            .expect(200, JSON.stringify(users[1]))
            .end(done)
    });

    it('should respond with a 404 error if the user does not exist', done => {
        request(app)
            .get('/user/27407af6-d961-4041-a5b0-899976bead0z')
            .expect(404)
            .end(done)
    });
});

describe('POST /users', () => {
    it('should add a user to the user list', done => {
        request(app)
            .post('/users')
            .send({
                "name": "Danielle",
                "age": 21,
            })
            .expect(200)
            .expect(() => {
                const newUsers = JSON.parse(fs.readFileSync('data/users.json'));
                expect(newUsers).toContainEqual(
                    expect.objectContaining({ name: "Danielle", age: 21 })
                );
            })
            .end(done)
    });
});

describe('PUT /user/:userId', () => {
    it('should update a user in the user list', done => {
        request(app)
            .put('/user/147d5076-b31f-4be0-b1b6-04aec7844671')
            .send({
                "name": "Clem",
                "age": 99,
            })
            .expect(200)
            .expect(() => {
                const newUsers = JSON.parse(fs.readFileSync('data/users.json'));
                expect(newUsers).toContainEqual(
                    expect.objectContaining({ name: "Clem", age: 99 })
                );
                expect(newUsers).not.toContainEqual(
                    expect.objectContaining({ name: "Clem", age: 100 })
                );
            })
            .end(done)
    });
    it('should return error 404 if the user does not exist', done => {
        request(app)
            .put('/user/147d5076-b31f-4be0-b1b6-04aec784467z')
            .send({
                "name": "Clem",
                "age": 99,
            })
            .expect(404)
            .end(done)
    });
});

describe('GET /user/:userId/avatar', () => {
    it('should return the correct avatar if it exists', done => {
        request(app)
            .get('/user/27407af6-d961-4041-a5b0-899976bead03/avatar')
            .expect(200, Buffer.from([2, 7, 3, 0, 4, 101]).toString('base64'))
            .end(done)
    });

    it('should return an error 404 if the user does not exist', done => {
        request(app)
            .get('/user/27407af6-d961-4041-a5b0-899976bead0z/avatar')
            .expect(404)
            .end(done)
    });

    it('should return an error 404 if the user does not have an avatar', done => {
        request(app)
            .get('/user/147d5076-b31f-4be0-b1b6-04aec7844671/avatar')
            .expect(404)
            .end(done)
    });
});

describe('PUT /user/:userId/avatar', () => {
    it('should add avatars to a user', done => {
        request(app)
            .put('/user/147d5076-b31f-4be0-b1b6-04aec7844671/avatar')
            .send({
                filename: "clem.jpeg",
                data: Buffer.from([1, 2, 3, 4, 5]).toString('base64'),
            })
            .expect(200)
            .expect(() => {
                const user = JSON.parse(fs.readFileSync('data/users.json'))
                    .find(u => u.userId === "147d5076-b31f-4be0-b1b6-04aec7844671");
                expect(user).toHaveProperty('avatar', 'clem.jpeg');
                const av = fs.readFileSync('data/clem.jpeg')
                expect(av.toString('base64')).toEqual(Buffer.from([1, 2, 3, 4, 5]).toString('base64'))
            })
            .end(done)
    });
    it('should overwrite existing avatars', done => {
        request(app)
            .put('/user/5b16d178-b6b3-4345-91c5-8c927dd0b063/avatar')
            .send({
                filename: "emily.jpeg",
                data: Buffer.from([1, 2, 3, 4, 5]).toString('base64'),
            })
            .expect(200)
            .expect(() => {
                const user = JSON.parse(fs.readFileSync('data/users.json'))
                    .find(u => u.userId === "5b16d178-b6b3-4345-91c5-8c927dd0b063");
                expect(user).toHaveProperty('avatar', 'emily.jpeg');
                const av = fs.readFileSync('data/emily.jpeg')
                expect(av.toString('base64')).toEqual(Buffer.from([1, 2, 3, 4, 5]).toString('base64'))
            })
            .end(done)
    });
    it('should return an error 404 if the user does not exist', done => {
        request(app)
            .put('/user/27407af6-d961-4041-a5b0-899976bead0z/avatar')
            .send({
                filename: "clem.jpeg",
                data: Buffer.from([1, 2, 3, 4, 5]).toString('base64'),
            })
            .expect(404)
            .end(done)
    });
});

describe('GET /users/avatars', () => {
    it('should get all avatars', done => {
        request(app)
            .get('/users/avatars')
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    Emily: Buffer.from([1, 3, 5, 0, 4, 100]).toString('base64'),
                    Mike: Buffer.from([2, 7, 3, 0, 4, 101]).toString('base64'),
                });
            })
            .end(done)
    });
});