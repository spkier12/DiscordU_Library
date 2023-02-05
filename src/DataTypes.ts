
// First identify payload on first contact with gateway
export type DiscordClient = {
    token: string,
    intents: number,
    Devmode: boolean
}

// When the OnReady event fires this is the payload
export type DiscordOnReady = {
    t:string,
    s:number,
    op:number,
    d: {
        v:number,
        user_settings:any,
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