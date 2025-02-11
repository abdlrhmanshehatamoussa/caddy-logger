const express = require('express');
const dgram = require("dgram");
const { getLogReport, parseAndPersistLog } = require('./app');

const server = dgram.createSocket("udp4");
const HTTP_PORT = 3000;
const UDP_PORT = 3001;
const app = express();

//HTTP
app.use(express.json());
app.get('/', async (req, res) => {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;
    if (req.headers.authorization !== `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`) {
        res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
        res.status(401).send('Unauthorized');
        return;
    }
    const report = await getLogReport();
    res.send(report);
});
app.listen(HTTP_PORT, () => console.log(`Log server listening on port ${HTTP_PORT}`));

//UDP
server.on("message", async (logBuffer, rinfo) => {
    await parseAndPersistLog(logBuffer);
});
server.bind(UDP_PORT, () => {
    console.log(`Listening for UDP logs on port ${UDP_PORT}`);
});
