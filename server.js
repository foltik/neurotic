const nurl = require('url');
const npath = require('path');
const fs = require('fs');

const send = require('send');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    pingInterval: 1000,
    pingTimeout: 500,
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const emit = (k, v, name) =>
      clients.forEach(c => (!name || c.name == name) && io.to(c.id).emit(k, v));

app.all('/:name?/send', (req, res) => {
    emit('msg', {...req.query, ...req.body}, req.params.name);
    res.sendStatus(200);
});

app.all('/:name?/set', (req, res) => {
    emit('set', {...req.query, ...req.body}, req.params.name);
    res.sendStatus(200);
});

app.all('/:name?/emit/:event', (req, res) => {
    emit('event', {event: req.params.event, data: {...req.query, ...req.body}}, req.params.name);
    res.sendStatus(200);
});

app.get('*', (req, res) => {
    const url = nurl.parse(req.url);
    const path = npath.join(__dirname, url.pathname);
    const stub = npath.join(__dirname, 'assets', 'stub.html');
    const name = npath.basename(path);
    const neuro = `${name}.neuro.js`;

    if (fs.existsSync(neuro))
        send(req, stub).pipe(res);
    else if (fs.existsSync(path))
        send(req, path).pipe(res);
    else
        res.sendStatus(404);
});

const clients = new Set();

io.on('connection', sock => {
    sock.on('init', name => {
        clients.add(sock);
        sock.name = name;
        console.log(`${name} connected`);

        const file = npath.join(__dirname, `${name}.neuro.js`);

        let lock = false;
        const update = () => {
            if (lock) return;
            lock = true;
            setTimeout(() => lock = false, 100);

            fs.readFile(file, 'utf8', (err, data) =>
                io.emit('script', {name, data}));
        };

        const watcher = fs.watch(file, update);
        update();

        sock.on('disconnect', () => {
            console.log(`${name} disconnected`);
            watcher.close();
            clients.delete(sock);
        });
    });
});

http.listen(8000, () => console.log('listening...'));
