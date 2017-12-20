'use strict';

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');

// Importing our custom code for watson conversaton
const conversation = require('./conversation');

// Storing context variable
let contextStore = [];

const fn = {
    slackBot(){
        // initialization
        var slackController = Botkit.slackbot({
            debug: true,
        });
        
        var bot = slackController.spawn({
            token: process.env.token
        }).startRTM((err, bot, payload) => {
            if(err){
                throw new Error('Could not connect to slack');
            }
            slackController.log('Slack connection established');
        });

        // Slack listerner that handles incoming messages

        slackController.hears(['.*'], ['direct_message', 'direct_mention'], (bot, message) => {
            slackController.log('Slack message received');
            // pass the slack message to IBM Watson's Conversation
            console.log('context store: ', contextStore);
            conversation.sendMessage(String(message.text), (contextStore.length > 0 ? contextStore[contextStore.length - 1] : undefined)) // at first message the context is still undefined
                .then(response => {
                    slackController.log('Response from Watson received');
                    // do something here and then reply to the user through slack
					// note: Watson's response text is stored in "response.output.text"
                    // ("join('\n')" is for cases when the response is multiline)

                    // Store the context of the conversation
                    if(response.context){
                        contextStore.push(response.context);

                        if(response.context.system && response.context.system.branch_exited){
                            contextStore.push(undefined);
                        }

                        // If the intente create then extract the name
                        if(response.context && response.context.stringwithname){
                            response.context.stringwithname = response.context.stringwithname.replace('llamado ', '');
                        }
                    }
                    console.log('watson response:', response);
                    bot.reply(message, response.output.text.join('\n'));
                })
                .catch(err => {
                    console.error(JSON.stringify(err, null, 2));
                });
        });
    }
}

// https?[\da-z\.-]+    (?<=llamado).*      llamado.*   llamado(.*)    (\llamado)(.*)

module.exports = {
    fn
};