import {Dtypes, DiscordLogging} from './Mod.js'
import Websocket from 'ws'
import events from 'node:events'

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
// This gateway automaticly close every 40 mins
// WARNING: YOU NEED TO GET THE SEQUENCE NUMBER FROM EVERY SOCKET DATA!!
// ------------------------------------------------

let DevMode = false
let Sequence = null
export class Discord {
    client: Dtypes.DiscordClient

    constructor(Client: Dtypes.DiscordClient) {
        this.client = Client
        WS(this.client)
    }
}

// Connects to Discord gateway 
async function WS(Payload: Dtypes.DiscordClient) {
    try {
        DevMode = Payload.Devmode
        const GatewayVersion = 10
        const Connection = `wss://gateway.discord.gg/?v${GatewayVersion}&encoding=json`
        const Socket: Websocket = new Websocket(Connection)
        Socket.on('message', async I => {await OnMessage(I, Payload, Socket)})
    } catch(e) {
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false
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
        Socket.send(JSON.stringify(Data))
        DevMode ? await DiscordLogging("Sending Identify payload") : false
    } catch(e) {
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false
    }
}

// If opcode 10 is received then send opcode 1 and discord will return opcode 11 to verify
async function Hearthbeat(Interval: number, Socket: Websocket) {
    setInterval(async() => {
        const Data = {
            "op": 1,
            "d": Sequence
        }
        Socket.send(JSON.stringify(Data))
        DevMode ? await DiscordLogging(`Sending hearthbeat with sequence: ${Sequence}`) : false
    }, Interval)
}

// When socket receives a message then parse json and handle the opcodes below
async function OnMessage(Message: string, Payload: Dtypes.DiscordClient, Socket: Websocket) {
    try {
        const payload = JSON.parse((Message).toString())
        payload.s != null ? Sequence = payload.s : false
        //console.clear() // Make sure to clear the console before we write agen!
        // DevMode ? await DiscordLogging((Message).toString()) : false

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
                DevMode ? await DiscordLogging("HearthBeat has been received") : false
                break;
        }
    }catch(e) {
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false
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
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false
    }
}