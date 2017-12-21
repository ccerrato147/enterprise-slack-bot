'use strict';
const ConversationV1 = require('watson-developer-cloud/conversation/v1');

// new instance of Conversation
const conversation = new ConversationV1({
    username: process.env.CONVERSATION_USERNAME,
    password: process.env.CONVERSATION_PASSWORD,
    version_date: '2017-05-26'
});

 const sendMessage = (text, context) => {
     const payload = {
        workspace_id: '146dbb11-2464-42f7-9206-b8fe5ad3e025',
        input: {
            text
        },
        context
     };
     return new Promise((resolve, reject) => 
        conversation.message(payload, (err, data) =>{
            if(err)
                reject(err);
            else
                resolve(data);
        })
    );
 }

module.exports.sendMessage = sendMessage;