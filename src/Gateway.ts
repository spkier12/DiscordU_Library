import {Dtypes, DiscordLogging, ConnectionGatewayError} from './Mod.js'
import Websocket from 'ws'
import events from 'node:events'
import colors from 'colors'

// Events of failure from gateway api
export const OnHello = new events.EventEmitter()
export const OnResumed = new events.EventEmitter()
export const OnReconnect = new events.EventEmitter()
export const OnInvalidSession = new events.EventEmitter()

// Discord events
export const OnReady = new events.EventEmitter()
export const OnMessage_Create = new events.EventEmitter()
export const OnMessage_Delete = new events.EventEmitter()

// ------------------------------------------------
// Information for further development
// ------------------------------------------------

// If  DevMode then print to console the events
let DevMode = false
// If sequence is null then this is the first contact if it's wrong then connection will terminate
let Sequence: number = null
// If the hearthbeat is greater than interval+5000 Miliseconds then terminate connection and resume 
let LastHeartBeat = Date.now()
// If resume attempts is greater than 5 then reopen the connection as new
let ResumeAttempts = 0
// If Resume is true then try and re-open connection and receive missed events
let Resume = false
// Get the session id to resume lost connections
let SessionID: string
// The version discord should use
const GatewayVersion = 10
// URL to connect discord
let Connection = `wss://gateway.discord.gg/?v${GatewayVersion}&encoding=json`
// Clear this variable with clearinterval to prevent hearthbeat function from ever running agen
let setIntervalD: NodeJS.Timer;

// Get the config and open a connection by calling Websocket server
export class Discord {
    client: Dtypes.DiscordClient

    constructor(Client: Dtypes.DiscordClient) {
        this.client = Client
        DevMode = Client.Devmode
        WS_Login(this.client)
    }
}

// Connects to Discord gateway 
async function WS_Login(Payload: Dtypes.DiscordClient) {
    try {
        const Socket: Websocket = new Websocket(Connection)
        Socket.on('message', async I => {await OnMessage(I, Payload, Socket)})

        // If connection closes for any weird reasion then clear the interval to make function stop running
        // And reset the heartbeat so that it dosnt stop as soon as the connection is restarted
        Socket.on('close', async (Reasion: any) => {
            await DiscordLogging(colors.red(`Connection terminated: ${ConnectionGatewayError[(Reasion).toString()]} | Retrying...`))
            LastHeartBeat = Date.now()
            ResumeAttempts < 5 ? Resume = true : Resume = false
            clearInterval(setIntervalD)
            Socket.close()
            new Discord(Payload)
        })
    } catch(e) {
        DevMode ? await DiscordLogging(colors.red(`We received a error: ${e}`)) : false
    }
}

// As soon as we connect and we receive opcode 10 then send identify payload
async function Identify(Payload: Dtypes.DiscordClient, Socket: Websocket) {
    try {
        const Data = {
            "op": 2,
            "d": {
              "token": Payload.token,
              "intents": Payload.intents,
              "properties": {
                "os": "linux",
                "browser": "DiscordU_Library",
                "device": "DiscordU_Library"
              }
            }
        }

        // Make sure Intents and token is not null or undefined or shoter than expected
        if(Payload.token.length < 40 || Payload.intents == null) {
            Socket.close()
            throw(colors.red("Either token is invalid or you are missing intents payload! Dont do that!"))
        }

        // Resume the connection if needed
        if (Resume && ResumeAttempts < 10) {
            const Data = {
                "op": 6,
                "d": {
                  "token": Payload.token,
                  "session_id": SessionID,
                  "seq": Sequence
                }
              }
            ResumeAttempts++
            DevMode ? await DiscordLogging(colors.cyan("Sending Resume payload")) : false
            Socket.send(JSON.stringify(Data))
            return
        }

        Socket.send(JSON.stringify(Data))
        DevMode ? await DiscordLogging(colors.cyan("Sending Identify payload")) : false
    } catch(e) {
        DevMode ? await DiscordLogging(colors.red(`We received a error: ${e}`)) : false
    }
}

// If opcode 10 is received then send opcode 1 and discord will return opcode 11 to verify
async function Hearthbeat(Interval: number, Socket: Websocket) {
    try {
        const Data = {
            "op": 1,
            "d": Sequence
        }

        // Send a continues heartbeat every Discord seconds to keep connection alive
        setIntervalD = setInterval(async() => {
            Socket.send(JSON.stringify(Data))
            DevMode ? await DiscordLogging(`Heartbeat S: ${Sequence}`) : false

            // Connection needs to close as socket is silently dead
            if (Date.now()-LastHeartBeat >= Interval+5000) {
                await DiscordLogging(colors.red("Zombie connection detected, shutting down!"))
                clearInterval(setIntervalD)
                Socket.close()
            }
        }, Interval)
    } catch(e) {
        DevMode ? await DiscordLogging(colors.red(`We received a error: ${e}`)): false
    }
}

// When socket receives a message then parse json and handle the opcodes below
async function OnMessage(Message: string, Payload: Dtypes.DiscordClient, Socket: Websocket) {
    try {
        const payload = JSON.parse((Message).toString())
        payload.s != null ? Sequence = payload.s : false

        // Get the session id and resume url from READY event so that we can resume a lost connection
        if (payload.t == "READY") {
            payload.d.session_id != null ? SessionID = payload.d.session_id : false
            payload.d.resume_gateway_url != null ? Connection = payload.d.resume_gateway_url : false
        }

        payload.ClearConsole ? console.clear() : false
        // console.log(JSON.stringify((Message).toString()))

        switch(payload.op) {
            case(0):
                await DiscordEventReceived(payload)
                break;
            case(1):
                break;
            case(2):
                break;
            case(3):
                break;
            case(4):
                break;
            case(5):
                break;
            case(6):
                break;
            case(7):
                break;
            case(8):
                break;
            case(9):
                break;
            case(10):
                await Identify(Payload, Socket)
                await Hearthbeat(payload["d"]["heartbeat_interval"], Socket)
                break;
            case(11):
                DevMode ? await DiscordLogging((`Heartbeat received: ${Date.now()-LastHeartBeat}`)) : false
                LastHeartBeat = Date.now()
                break;
        }
    }catch(e) {
        DevMode ? await DiscordLogging(colors.red(`We received a error: ${e}`)) : false
    }
}

// If opcode 0 is received then we recived DATA from the gateway witch we will handle here
async function DiscordEventReceived(Data: any) {
    try {
        switch(Data.t) {
            case("READY"):
                OnReady.emit('OnReady', Data)
                break;
            case("MESSAGE_CREATE"):
                OnMessage_Create.emit('OnMessage_Create', Data)
                break;
            case("MESSAGE_DELETE"):
                OnMessage_Delete.emit('OnMessage_Delete', Data)
                break;
        }
    }catch(e) {
        DevMode ? await DiscordLogging(colors.red(`We received a error: ${e}`)) : false
    }
}