
'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 4205;
const router = express.Router();

const chatbot = require('./chatbot');
chatbot.fn.slackBot();
// start server
app.listen(port, (req, res) => {
    console.info(`Started Express server on port ${port}`);
});