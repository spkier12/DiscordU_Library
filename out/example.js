// Discord Client and Events
import { Discord, OnReady, OnMessage_Create } from './Gateway.js';
// Start connection
new Discord({
    token: "OTgzMzYwNjkzOTYzMjE4OTQ1.GY6Aun.xvkt30YTDxueczecwiKzJvmHYmB_GWujMI3Itw",
    intents: 512,
    Devmode: true,
    ClearConsole: false // When this is true it will clear the console on every payload received to free up screen space
});
OnReady.once('OnReady', async (Bot) => {
    console.log(`Discord bot: ${Bot.d.user.username} is now online!`);
});
OnMessage_Create.on('OnMessage_Create', async (CTX) => {
    console.log(`\n User: ${CTX.d.author.username} Wrote: ${CTX.d.content}`);
});
