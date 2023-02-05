import * as D from './Mod.js';
import Websocket from 'ws';
import events from 'node:events';
// Events of failure from gateway api
export const OnHello = new events.EventEmitter();
export const OnResumed = new events.EventEmitter();
export const OnReconnect = new events.EventEmitter();
export const OnInvalidSession = new events.EventEmitter();
// Discord events
export const OnReady = new events.EventEmitter();
export const OnMessage_Create = new events.EventEmitter();
export const OnMessage_Delete = new events.EventEmitter();
// ------------------------------------------------
// Information for further development
// This gateway automaticly close every 40 mins
// ------------------------------------------------
let DevMode = false;
export class Discord {
    client;
    constructor(Client) {
        this.client = Client;
        WS(this.client);
    }
}
// Connects to Discord gateway 
async function WS(Payload) {
    try {
        DevMode = Payload.Devmode;
        const GatewayVersion = 10;
        const Connection = `wss://gateway.discord.gg/?v${GatewayVersion}&encoding=json`;
        const Socket = new Websocket(Connection);
        Socket.on('message', async (I) => { await OnMessage(I, Payload, Socket); });
    }
    catch (e) {
        DevMode ? await D.DiscordLogging(`We received a error: ${e}`) : false;
    }
}
// As soon as we connect and we receive opcode 10 then send identify payload
async function Identify(Payload, Socket) {
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
        };
        Socket.send(JSON.stringify(Data));
        DevMode ? await D.DiscordLogging("Sending Identify payload") : false;
    }
    catch (e) {
        DevMode ? await D.DiscordLogging(`We received a error: ${e}`) : false;
    }
}
// If opcode 10 is received then send opcode 1 and discord will return opcode 11 to verify
async function Hearthbeat(Interval, Socket) {
    setInterval(async () => {
        const Data = {
            "op": 1,
            "d": 1
        };
        Socket.send(JSON.stringify(Data));
        DevMode ? await D.DiscordLogging("Sending heartbeat") : false;
    }, Interval);
}
// When socket receives a message then parse json and handle the opcodes below
async function OnMessage(Message, Payload, Socket) {
    try {
        const payload = JSON.parse((Message).toString());
        console.clear(); // Make sure to clear the console before we write agen!
        DevMode ? await D.DiscordLogging((Message).toString()) : false;
        switch (payload.op) {
            case (0):
                await DiscordEventReceived(payload);
                break;
            case (1):
                break;
            case (2):
                break;
            case (3):
                break;
            case (4):
                break;
            case (5):
                break;
            case (6):
                break;
            case (7):
                break;
            case (8):
                break;
            case (9):
                break;
            case (10):
                await Identify(Payload, Socket);
                await Hearthbeat(payload["d"]["heartbeat_interval"], Socket);
                break;
            case (11):
                DevMode ? await D.DiscordLogging("HearthBeat has been received") : false;
                break;
        }
    }
    catch (e) {
        DevMode ? await D.DiscordLogging(`We received a error: ${e}`) : false;
    }
}
// If opcode 0 is received then we recived DATA from the gateway witch we will handle here
async function DiscordEventReceived(Data) {
    try {
        switch (Data.t) {
            case ("READY"):
                OnReady.emit('OnReady', Data);
                break;
            case ("MESSAGE_CREATE"):
                OnMessage_Create.emit('OnMessage_Create', Data);
                break;
            case ("MESSAGE_DELETE"):
                OnMessage_Delete.emit('OnMessage_Delete', Data);
                break;
        }
    }
    catch (e) {
        DevMode ? await D.DiscordLogging(`We received a error: ${e}`) : false;
    }
}
