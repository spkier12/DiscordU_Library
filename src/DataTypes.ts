
// First identify payload on first contact with gateway
export type DiscordClient = {
    token: string,
    intents: number,
    Devmode: boolean,
    ClearConsole: boolean
}

// When the OnReady event fires this is the payload
export type DiscordOnReady = {
    d: {
        user: {
            verified:boolean,
            username:string,
            mfa_enabled:boolean,
            id:string,
            flags:number,
            email:string | undefined,
            display_name: string | undefined,
            session_id:string,
            relationships:any,
            private_channels: any,
            presences:any,
            guilds:any,
        }
    }
}

// When a message is deleted this is the payload you can get from it
export type DiscordOnMessage_Delete = {
    d:{
        id:string,
        channel_id:string,
        guild_id:string
    }
}

// When a message is created this is the payload you can get from it
export type DiscordOnMessage_Create = {
    d:{
        pinned:boolean,
        mentions:[],
        mention_roles:[],
        mention_everyone:boolean,
        member:{
            roles:[],
            premium_since:boolean | undefined,
            pending:boolean,
            nick:string | undefined,
            mute:boolean,
            joined_at:any | undefined,
            flags:number,
            deaf:boolean,
            communication_disabled_until:any | undefined,
            avatar:any | undefined
        },
        id:string,
        embeds:[],
        content:string,
        components:[],
        channel_id:string,
        author:{
            username:string,
            id:string,
        },
        attachments:[],
        guild_id:string
    }
}