// --------------------------------------------------------------------------------------
import { MIO441R_InputStruct, INPUT_ACTION, INPUT_TYPE, MIO441R_InputMqttStruct } from './mio_structs'
import { MIO441R_AbstractIO } from './mio_device_abstractio';

// --------------------------------------------------------------------------------------
export class MIO441R_Input extends MIO441R_AbstractIO{
    private _data: MIO441R_InputStruct;

    constructor(dev: any, id: number){
        super(dev, id, "INPUT")
        this._data = {
            st: false,
            type: INPUT_TYPE.Switch_NO
        };
    }

    // --------------------------------------------------------------------------------------
    public name():string                    {return this._data.name!};
    public data(): MIO441R_InputStruct      {return this._data;}
    public state(): boolean                 {return this._data.st?true:false;}
    public type(): INPUT_TYPE               {return this._data.type;}

    // --------------------------------------------------------------------------------------
    public handleUpdate(data: MIO441R_InputStruct): MIO441R_InputStruct{
        this._data = data;
        // console.log("UPDATE Input data : ", this.id(), this._data.name);
        this.afterUpdate(data.hk);
        return this._data;
    }

    // --------------------------------------------------------------------------------------
    public handleMqtt(data: MIO441R_InputMqttStruct){
        if(this.isInitDone()){
            if(data.state === 'ON')
                this._data.st = true;
            else if(data.state === 'OFF')
                this._data.st = false;

            this.afterUpdate(null);
        }
    }

    // --------------------------------------------------------------------------------------
    private setAction(value: number): Promise<MIO441R_InputStruct>{
        return new Promise<MIO441R_InputStruct>((resolve, reject) => {
            let cmd = {"input": {id: this.id(), "action": value}};
            console.log("SET Action : ",cmd);
            this._device.handleCommand(cmd, {input: null, output: null}).then(res => {
                // console.log("setAction RESPONSE : ", res);
                resolve(this._data);
            }).catch(err => {
                console.log("setAction ERROR : ", err);
                reject(this._data);
            })
        })
    }

    // --------------------------------------------------------------------------------------
    public getOn(): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            this._device.handleGetInputs().then(() => {
                resolve({err: null, value: this._data.st});
            }).catch(data => {
                reject({err: null, value: this._data.st});
            });
        });
    }

    // --------------------------------------------------------------------------------------
    public setOn(state: boolean): Promise<MIO441R_InputStruct>{
        console.log("SET On to state : ", state);
        let action: number = (state)?INPUT_ACTION.turnON:INPUT_ACTION.turnOFF;
        return this.setAction(action);
    }
}

// --------------------------------------------------------------------------------------
