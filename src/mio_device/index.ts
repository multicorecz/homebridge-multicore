
import { MIO_HttpApi } from './mio_api'
import { MIO441R_Output } from './mio_device_output'
import { MIO441R_Input } from './mio_device_input'
import { MIO441R_BaseStruct, MIO441R_InfoStruct, MIO441R_OutputStruct, MIO441R_InputStruct, MIO441R_HomeKitStruct, MIO441R_Response, MIO441R_DayLuStruct } from './mio_structs'
import { MIO441R_RGB } from './mio_device_rgb';
import { MIO441R_DayLU } from './mio_device_daylu';
import { MqttService } from './mqtt_service';

// --------------------------------------------------------------------------------------
export * from './mio_api';
export * from './mio_device_input';
export * from './mio_device_output';
export * from './mio_device_daylu';
export * from './mio_structs';

// --------------------------------------------------------------------------------------
export class MIO441R{
    protected _api: MIO_HttpApi;
    protected _init: boolean = false;
    protected _online: boolean = false;
    protected _mqtt: MqttService;
    
    public _baseData: MIO441R_BaseStruct;
    public _infoData: MIO441R_InfoStruct = {};

    public _inputs: Array<MIO441R_Input> = []; 
    public _outputs: Array<MIO441R_Output> = []; 
    public _dayLU: Array<MIO441R_DayLU> = []; 
    public _rgb: MIO441R_RGB;

    private _clbck_Init: Array<any> = [];
    private _clbck_Update: Array<any> = [];
    private _clbck_UpdateInfo: Array<any> = [];

    private _updateTimer: NodeJS.Timeout | null = null;

    public api() {return this._api;}

    // --------------------------------------------------------------------------------------
    constructor(data: MIO441R_BaseStruct, mqtt: MqttService){
        this._baseData = data;
        this._api = new MIO_HttpApi(data.address);
        this._mqtt = mqtt;

        for(let i=0; i<4; i++)                  this._inputs.push(new MIO441R_Input(this, i));
        for(let i=0; i<4; i++)                  this._outputs.push(new MIO441R_Output(this, i));
        for(let i=0; i<4; i++)                  this._dayLU.push(new MIO441R_DayLU(this, i));
        
        this._rgb = new MIO441R_RGB(this, 0);

        this.subscribeMqtt();
    }

    // --------------------------------------------------------------------------------------
    public start(){
        this.handleGetAll();
        const initTimer = setInterval(() => {
            if(this._init === false)            this.handleGetAll().then( () => clearInterval(initTimer) );
            else                                clearInterval(initTimer);
        }, 2500);

        this.restartUpdateTimer();
    }

    // --------------------------------------------------------------------------------------
    private subscribeMqtt(){
        this._mqtt.subscribeTopic(this.uuid() + '/#', this.onMqttMessage.bind(this));
    }
    
    // --------------------------------------------------------------------------------------
    private onMqttMessage(topic: string, data: object, packet: any): void {
        topic = topic.replace(this.uuid(), "");
        if(topic === "/power")          {/*console.log("MQTT -> POWER", data);*/}
        else if(topic === "/input/0")   {this.input(0).handleMqtt(data as any);}
        else if(topic === "/input/1")   {this.input(1).handleMqtt(data as any);}
        else if(topic === "/input/2")   {this.input(2).handleMqtt(data as any);}
        else if(topic === "/input/3")   {this.input(3).handleMqtt(data as any);}
        else if(topic === "/output/0")   {this.output(0).handleMqtt(data as any);}
        else if(topic === "/output/1")   {this.output(1).handleMqtt(data as any);}
        else if(topic === "/output/2")   {this.output(2).handleMqtt(data as any);}
        else if(topic === "/output/3")   {this.output(3).handleMqtt(data as any);}
        else                            {console.log("MQTT -> ", topic, data);}
    }
    
    // --------------------------------------------------------------------------------------
    private restartUpdateTimer(){
        if(this._updateTimer)
            clearInterval(this._updateTimer);

        this._updateTimer = setInterval(() => {
            this.handleGet(undefined);
        }, 30000);
    }

    // --------------------------------------------------------------------------------------
    public name(): string                       {return this._baseData.name;}
    public address(): string                    {return this._baseData.address;}
    public uuid(): string                       {return this._baseData.uuid;}
    public input(id: number): MIO441R_Input     {return this._inputs[(id < this._inputs.length)?id:0];}
    public output(id: number): MIO441R_Output   {return this._outputs[(id < this._outputs.length)?id:0];}
    public dayLU(id: number): MIO441R_DayLU     {return this._dayLU[(id < this._dayLU.length)?id:0];}
    public isOnline(): boolean                  {return this._online;}

    // --------------------------------------------------------------------------------------
    public on(key: string, callback: CallableFunction){
        if(key == "update")                     this._clbck_Update.push(callback);
        else if(key == "init")                  this._clbck_Init.push(callback);
        else if(key == "updateInfo")            this._clbck_UpdateInfo.push(callback);
    }
    
    // --------------------------------------------------------------------------------------
    private updateData(data: MIO441R_Response){
        this.updateInfoData(data.info);
        this.updateHomeKitData(data.hk);
        this.handleUpdateInputs(data.input);
        this.handleUpdateOutputs(data.output);
        this.handleUpdateDayLUs(data.dayLU);
        this._rgb.handleUpdateData();
        this._clbck_Update.forEach( (value) => {value.call();});
    }
    
    // --------------------------------------------------------------------------------------
    private updateInfoData(data: MIO441R_InfoStruct | undefined){
        if(data){
            this._baseData.name = data.devName!;
            // this._baseData.uuid = data.uuid!;
            this._infoData = data;

            if(this._init == false){
                this._init = true;
                this._clbck_Init.forEach( (value) => {value.call();});
            }
            
            this._clbck_UpdateInfo.forEach( (value) => {value.call();});
            this.restartUpdateTimer();
        }
    }

    // --------------------------------------------------------------------------------------
    private updateHomeKitData(data: MIO441R_HomeKitStruct | undefined){
        if(data){
            this._rgb.setHomeKit(data.rgb);
            this._inputs.forEach( (value, index) => {value.setHomeKit(data?.in[index])});
            this._outputs.forEach( (value, index) => {value.setHomeKit(data?.out[index])});
        }
    }

    // --------------------------------------------------------------------------------------
    private handleUpdateDayLUs(data: MIO441R_DayLuStruct[] | undefined)     {if(data){ for (let i=0; i < data.length; i++)   {this._dayLU[i].handleUpdate(data[i]);} }}
    private handleUpdateOutputs(data: MIO441R_OutputStruct[] | undefined)   {if(data){ for (let i=0; i < data.length; i++)   {this._outputs[i].handleUpdate(data[i]);} }}
    private handleUpdateInputs(data: MIO441R_InputStruct[] | undefined)     {if(data){ for (let i=0; i < data.length; i++)   {this._inputs[i].handleUpdate(data[i]);} }}
    
    // --------------------------------------------------------------------------------------
    public handleCommand(data: any, opt: any): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            this._api.sendCommand(data, opt).then((data)=>{
                this.updateData(data);
                resolve({});
            }).catch((err) => {
                reject(err);
            })
        });
    }
    
    // --------------------------------------------------------------------------------------
    public handleGet(params: object | undefined): Promise<any>{
        if(this._init == false || params === undefined) 
            params = {"info": null, "ota":null, "pwr": null, "input":null, "output": null, "hk": null, "dayLU": null };

        return new Promise<any>((resolve, reject) => {
            this._api.get(params).then((data)=>{
                this.updateData(data);
                resolve({});
            }).catch((err) => {
                reject(err);
            })
        });
    }
    
    // --------------------------------------------------------------------------------------
    public handleGetAll(): Promise<any>         { return this.handleGet({"info": null, "ota":null, "pwr": null, "input":null, "output": null, "hk": null, "dayLU": null }); }
    public handleGetOutputs(): Promise<any>     { return this.handleGet({"output": null, "dayLU": null}); }
    public handleGetInputs(): Promise<any>      { return this.handleGet({"input": null}); }
}

// --------------------------------------------------------------------------------------
