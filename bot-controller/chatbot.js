'use strict';

// if (!process.env.token) {
//     console.log('Error: Specify token in environment');
//     process.exit(1);
// }

//const tokenId = "xoxp-284030661959-283102392837-283110626277-e7befefca86459e4f3a05d16d23fd4e8";
const tokenId = "xoxb-283837085158-lUvXrsC9xaCFezwbVHMsXCFO";

var Botkit = require('botkit');
var os = require('os');
var Client = require('node-rest-client').Client;

// Importing our custom code for watson conversaton
const conversation = require('./conversation');

// Storing context variable
let contextStore = [];

// HTTP Rest Client
var client = new Client();

const fn = {
    slackBot(){
        // initialization
        var slackController = Botkit.slackbot({
            debug: true,
        });
        
        var bot = slackController.spawn({
            token: tokenId
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
                    console.log('watson response:', response);
                    if(response.context){
                        contextStore.push(response.context);

                        if(response.context.system && response.context.system.branch_exited){
                            contextStore.push(undefined);
                        }

                        if(response.intents){
                            if(response.intents.length > 0){
                                console.log("intent:", response.intents[0].intent);
                                switch(response.intents[0].intent){
                                    case "showsites":
                                        mostrarSitios(bot, message, response);
                                        break;
                                    case "create":
                                        crearNuevo(bot, message, response);
                                        break;
                                    case "greeting":
                                        saludar(bot, message, response);
                                        break;
                                    default:
                                        break;
                                }
                            }else {
                                if(response.output && response.output.text){
                                    bot.reply(message, response.output.text.join(' '));
                                }
                            }
                        }
                    }
                })
                .catch(err => {
                    console.error("ERROR: ");
                    console.error(JSON.stringify(err, null, 2));
                });
        });
    }
}

const saludar = (bot, message, response) => {
    bot.reply(message, response.output.text.join(' '));
}

const mostrarSitios = (bot, message, response) => {    
    // direct way 
    client.get("http://localhost:50178/api/SharepointAPI/GetSubSites", (data, result) => {
        bot.reply(message, response.output.text.join(' ') + "\n" + data.join('\n'));
    });
}

const crearNuevo = (bot, message, response) =>{
    if(response.context && response.context.stringwithname){
        const name = response.context.stringwithname.replace('llamado ', '');
        const args = {
            data: {
                name
            },
            headers: { "Content-Type": "application/json" }
        };

        bot.reply(message, response.output.text.join(' '));

        // Posting new Site name
        client.post("http://localhost:50178/api/SharepointAPI/CreateSubSites", args, (data, result) => {
            bot.reply(message, data);
        });
    } else{
        // Notificar los mensajes de Slack
        bot.reply(message, response.output.text.join(' '));
    }
}

module.exports = {
    fn
};