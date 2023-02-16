
// Optional data types
import * as Dtypes from './DataTypes.js'

// Discord Client and Events
import {Discord} from './DiscordU.js'

// Start connection
new Discord.Client({
    token: "OTgzMzYwNjkzOTYzMjE4OTQ1.GY6Aun.xvkt30YTDxueczecwiKzJvmHYmB_GWujMI3It",
    intents: 512,
    Devmode: true,
    ClearConsole: true // When this is true it will clear the console on every payload received to free up screen space
})

Discord.OnReady.once('OnReady', async (Bot: Dtypes.DiscordOnReady) => {
    console.log(`Discord bot: ${Bot.d.user.username} is now online!`)
})
Discord.OnMessage_Create.on('OnMessage_Create', async (CTX:Dtypes.DiscordOnMessage_Create) => {
    console.log(`\n User: ${CTX.d.author.username} Wrote: ${CTX.d.content}`)
})