import { Discord, OnReady } from './Gateway.js';
// Start connection
new Discord({
    token: "OTgzMzYwNjkzOTYzMjE4OTQ1.GY6Aun.xvkt30YTDxueczecwiKzJvmHYmB_GWujMI3Itw",
    intents: 512,
    Devmode: true
});
OnReady.once('OnReady', async (Bot) => {
    console.log(`Discord bot: ${Bot.d.user.username} is now online!`);
});
