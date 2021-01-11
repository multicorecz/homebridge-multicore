import { Logger } from 'homebridge';
import { connect, IClientOptions, Client, IConnackPacket, ISubscribePacket, Packet } from 'mqtt';
import { ConfigInput } from '../config';

//-------------------------------------------------------------------------
export const options: IClientOptions = {
  host: '127.0.0.1',
  port: 1883,
  protocol: 'mqtt',
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 1000,
  clientId: 'HB_PLUGIN_MULTICORE',
};

//-------------------------------------------------------------------------
export interface SubscriptionFunc {
  (topic: string, data: any, packet: ISubscribePacket): void;
}

//-------------------------------------------------------------------------
export interface SubscriptionCallback {
  topic: string;
  callback: SubscriptionFunc;
}

//-------------------------------------------------------------------------
export class MqttService {
  private _client: Client | null = null;
  private _connected: boolean;
  private _subscriptionList: SubscriptionCallback[];
  private _debugLevel: number;
  public readonly log: Logger;
  public readonly config: ConfigInput;

  get client() {
    return this._client;
  }

  set debugLevel(num: number) {
    this._debugLevel = num;
  }

  // --------------------------------------------------------------------------------------
  constructor(id: string, config: ConfigInput, log: Logger) {
    const localOpt: IClientOptions = { ...options };
    this._subscriptionList = [];
    localOpt.clientId = localOpt.clientId + id;
    localOpt.host = config.mqtt?.url || localOpt.host;
    localOpt.port = config.mqtt?.port || localOpt.port;
    this.config = config;
    this.log = log;
    this._connected = false;
    this._debugLevel = 1;

    if (config.mqtt?.enable === true) {
      this.log.debug('MQTT Connection : ', localOpt.clientId);
      this._client = connect(localOpt);
      if (this._client) {
        this._client.on('connect', (packet: IConnackPacket) => {
          if (packet.returnCode === 0 && packet.cmd === 'connack') {
            this._connected = true;

            if (this._debugLevel >= 1){
              this.log.warn( `CONNECTED TO MQTT Broker with id: ${localOpt.clientId}`);
            }

            this._subscriptionList.forEach((element) => {
              this._client?.subscribe(element.topic, { qos: 1 });
            });
          }
        });
      }

      this._client.on('message', (topic, payload, packet) => {
        this.onMessage(topic, payload, packet);
      });
      this._client.on('error', (error) => {
        this._connected = false;
        this.log.error('onError <=', error);
      });
    }
  }

  // --------------------------------------------------------------------------------------
  destroy() {
    this.log.debug('DESTROY MQTT SERVICE');
    this._client?.removeAllListeners();
    this._client?.end();
  }

  // --------------------------------------------------------------------------------------
  subscribeTopic(topic: string, callback: SubscriptionFunc): void {
    if (callback) {
      if (!this.isTopicExist({ topic, callback })) {
        this._subscriptionList.push({ topic, callback });

        if (this._connected) {
          this._client?.subscribe(topic, { qos: 1 });
        }

        if (this._debugLevel >= 1){
          this.log.debug('create subscription of ', topic, callback);
        }
      }
    }
  }

  // --------------------------------------------------------------------------------------
  publish(topic: string, data: string): void {
    this._client?.publish(topic, data, { qos: 1 });
  }

  // --------------------------------------------------------------------------------------
  private isTopicExist(item: SubscriptionCallback): boolean {
    this._subscriptionList.forEach((element) => {
      if (element === item) {
        return true;
      }
    });
    return false;
  }

  // --------------------------------------------------------------------------------------
  private onMessage(topic: string, payload: Buffer, packet: any): void {
    const data = payload.toString();
    let obj: any = {};
    let founded = false;

    if (data.startsWith('{') && data.endsWith('}')) {
      obj = this.pJson(data);
      this._subscriptionList.forEach((element) => {
        const top = element.topic.replace('/#', '');
        if (topic.startsWith(top)) {
          element.callback(topic, obj, packet);
          founded = true;
        }
      });
    }

    if (!founded) {
      if (this._debugLevel >= 2){
        this.log.debug('Unresolve Received message <=', {
          topic: topic,
          data: obj,
        });
      }
    }
  }

  //-------------------------------------------------------------------------
  private pJson(result: string) {
    let jsD = {};
    try {
      jsD = JSON.parse(result);
    } catch (e) {
      //console.log(e);
    }
    return jsD;
  }

  //-------------------------------------------------------------------------
  static topicToObjStruct(topic: string, data: any, destObj: any, startIndex: number){
    const a = topic.split('/');
    let b = destObj;
    let i: number;
    for (
      i = startIndex && startIndex < a.length ? startIndex : 0;
      i < a.length;
      i++
    ) {
      if (!b[a[i]] || i === a.length - 1){
        b[a[i]] = i === a.length - 1 ? data : {};
      }
      b = b[a[i]];
    }
  }
}

//-------------------------------------------------------------------------
