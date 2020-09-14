const fs = require('fs').promises;
const express = require('express');
const uuid = require('uuid');

const app = express();

app.use(express.json());

// const usersArray = fs.readFile('./data/users.json', 'utf-8').then((str) => {
//     return JSON.parse(str)
// });

app.get('/users', async (req, res) => {
    // res.json(JSON.parse(await fs.readFile('./data/users.json', 'utf-8')))
    res.sendFile('./data/users.json', {
        root: process.cwd(),
    })
});

app.get('/users/names', async (req, res) => {
    // should return an array of users names
    let usersArray = JSON.parse(await fs.readFile('./data/users.json', 'utf-8'))
    res.send(usersArray.map(user => user.name));
});

app.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    // should return a single user object
    let usersArray = JSON.parse(await fs.readFile('./data/users.json', 'utf-8'))
    const user = usersArray.find(user => user.userId === userId)
    if (user === undefined) {
        res.sendStatus(404)
        return
    }
    res.send(user);
});

app.post('/users', async (req, res) => {
    const newUserId = uuid.v4();
    const newUser = { ...req.body, id: newUserId };
    let usersArray = JSON.parse(await fs.readFile('./data/users.json', 'utf-8'))
    usersArray.push(newUser)
    await fs.writeFile('./data/users.json', JSON.stringify(usersArray), 'utf-8');
    res.sendStatus(200);
});

app.put('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updatedUser = req.body;
    // should update the user with the given ID.
    // If the user does not exist, return a 404 error code
    let usersArray = JSON.parse(await fs.readFile('./data/users.json', 'utf-8'))
    const userIndex = usersArray.findIndex(user => user.userId === userId)
    if (userIndex === -1) {
        res.sendStatus(404)
        return
    }
    usersArray[userIndex] = updatedUser
    await fs.writeFile('./data/users.json', JSON.stringify(usersArray), 'utf-8');
    res.sendStatus(200);
});

app.get('/user/:userId/avatar', async (req, res) => {
    const userId = req.params.userId;

    let usersArray = JSON.parse(await fs.readFile('./data/users.json', 'utf-8'))
    const user = usersArray.find(user => user.userId === userId)

    if(userIndex === undefined) {
        res.sendStatus(404)
        return
    }
    res.send(user.avatar)
    // look up the user in users.json
    // if it exists, load the file specified by the 'avatar' field and send that back
    // if the user does not exist, or the user does not have an avatar, or the file is missing, send back 404
    
    // Send the file back like this:
    //   fs.readFile('whatever-url.jpg')
    //     .then(file => {
    //       res.send(file.toString('base64'));
    //     });
    // or, using await
    //   const file = await fs.readFile('whatever-url.jpg')
    //   res.send(file.toString('base64))


});

app.put('/user/:userId/avatar', async (req, res) => {
    const userId = req.params.userId;
    const avatarFilename = req.body.filename;
    const avatarData = Buffer.from(req.body.data, 'base64')
    // look up the user in users.json
    // if it exists, write the avatar to the data directory and update the user object with the file path.
    // if the user does not exist, send back 404
    res.status(500).send('method not implemented');
});

app.get('/users/avatars', async (req, res) => {
    // Return all avatars as an object that maps names to image data a bit like this:
    // { emily: emilyImageData.toString('base64) }
    res.status(500).send('method not implemented');
})

if (process.env.NODE_ENV !== "test") {
    app.listen(8080, () => {
        console.log('server started on port 8080');
    });
}

module.exports = app;