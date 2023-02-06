import { DiscordLogging } from './Mod.js';
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
// WARNING: YOU NEED TO HANDLE BROKE SOCKET CONNECTIONS
// ------------------------------------------------
// If  DevMode then print to console the events
let DevMode = false;
// If sequence is null then this is the first contact if it's wrong then connection will terminate
let Sequence = null;
// If the hearthbeat is greater than 50000 Miliseconds then terminate connection and resume 
let LastHeartBeat = Date.now();
// If resume attempts is greater than 10 then reopen the connection as new
let ResumeAttempts = 0;
// If Resume is true then try and re-open connection and receive missed events
let Resume = false;
// Get the session id to resume lost connections
let SessionID = "";
// The version discord should use
const GatewayVersion = 10;
// URL to connect discord
let Connection = `wss://gateway.discord.gg/?v${GatewayVersion}&encoding=json`;
// Get the config and open a connection by calling Websocket server
export class Discord {
    client;
    constructor(Client) {
        this.client = Client;
        DevMode = Client.Devmode;
        WS_Login(this.client);
    }
}
// Connects to Discord gateway 
async function WS_Login(Payload) {
    try {
        const Socket = new Websocket(Connection);
        Socket.on('message', async (I) => { await OnMessage(I, Payload, Socket); });
        // If connection closes for any weird reasion then clear the interval to make function stop running
        // And reset the heartbeat so that it dosnt stop as soon as the connection is restarted
        Socket.on('close', async (Reasion) => {
            await Hearthbeat(-1, Socket);
            await DiscordLogging(`Connection to Discord was terminated by ${(Reasion).toString()} reasions | Retrying...`);
            LastHeartBeat = Date.now();
            ResumeAttempts < 5 ? Resume = true : Resume = false;
            Socket.close();
            new Discord(Payload);
        });
    }
    catch (e) {
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false;
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
        // Resume the connection if needed
        if (Resume && ResumeAttempts < 10) {
            const Data = {
                "op": 6,
                "d": {
                    "token": Payload.token,
                    "session_id": SessionID,
                    "seq": Sequence
                }
            };
            ResumeAttempts++;
            DevMode ? await DiscordLogging("Sending Resume payload") : false;
            Socket.send(JSON.stringify(Data));
            return;
        }
        Socket.send(JSON.stringify(Data));
        DevMode ? await DiscordLogging("Sending Identify payload") : false;
    }
    catch (e) {
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false;
    }
}
// If opcode 10 is received then send opcode 1 and discord will return opcode 11 to verify
async function Hearthbeat(Interval, Socket) {
    try {
        let setIntervalD;
        const Data = {
            "op": 1,
            "d": Sequence
        };
        // Clear interval is -1 is set != null
        if (Interval == -1) {
            clearInterval(setIntervalD);
            DevMode ? await DiscordLogging("Clearing interval") : false;
            return;
        }
        // Send a continues heartbeat every Discord seconds to keep connection alive
        if (Interval != 0) {
            setIntervalD = setInterval(async () => {
                Socket.send(JSON.stringify(Data));
                DevMode ? await DiscordLogging(`Sending hearthbeat with sequence: ${Sequence}`) : false;
                // Connection needs to close as socket is silently dead
                if (Date.now() - LastHeartBeat >= Interval + 5000) {
                    await DiscordLogging("Zombie connection detected, shutting down!");
                    Socket.close();
                }
            }, Interval);
        }
    }
    catch (e) {
        DevMode ? await DiscordLogging(`Error: ${e}`) : false;
    }
}
// When socket receives a message then parse json and handle the opcodes below
async function OnMessage(Message, Payload, Socket) {
    try {
        const payload = JSON.parse((Message).toString());
        payload.s != null ? Sequence = payload.s : false;
        if (payload.t == "READY") {
            payload.d.session_id != null ? SessionID = payload.d.session_id : false;
            payload.d.resume_gateway_url != null ? Connection = payload.d.resume_gateway_url : false;
        }
        payload.ClearConsole ? console.clear() : false;
        console.log(JSON.stringify((Message).toString()));
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
                DevMode ? await DiscordLogging(`Time since last hearthbeat: ${Date.now() - LastHeartBeat}`) : false;
                LastHeartBeat = Date.now();
                break;
        }
    }
    catch (e) {
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false;
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
        DevMode ? await DiscordLogging(`We received a error: ${e}`) : false;
    }
}
