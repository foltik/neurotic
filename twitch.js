const tmi = require('tmi.js');
const request = require('request');

const opts = {
    identity: {
        username: '',
        password: '' // https://twitchapps.com/tmi/
    },
    channels: ['4fterlife_online']
};

const client = new tmi.client(opts);

client.on('connected', (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
});

client.on('message', (target, ctx, msg, self) => {
    const name = ctx['display-name'];
    console.log(`* ${name}: ${msg}`);
    request.post('http://localhost:8000/chat/send', {form: {name, msg}});
});

client.connect();
