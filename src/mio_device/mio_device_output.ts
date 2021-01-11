// --------------------------------------------------------------------------------------
import { MIO441R_AbstractIO } from './mio_device_abstractio';
import { MIO441R_DayLuStruct, MIO441R_OutputMqttStruct, MIO441R_OutputStruct, OUTPUT_TYPE } from './mio_structs'

// --------------------------------------------------------------------------------------
export class MIO441R_Output extends MIO441R_AbstractIO{
    private _data: MIO441R_OutputStruct;
    private _lastNonZeroBrightness: number = 100;
    public _brightness: number = 0;

    // --------------------------------------------------------------------------------------
    constructor(dev: any, id: number){
        super(dev, id, "OUT");
        this._data = {
            st: false,
            pwrMax: 100,
            pwrMin: 0,
            value: 0,
            reqValue: 0,
            type: OUTPUT_TYPE.PWM
        };
    }

    // --------------------------------------------------------------------------------------
    public name():string                    {return this._data.name!};
    public data(): MIO441R_OutputStruct     {return this._data;}
    public brightness(): number             {return this._brightness;}
    public state(): boolean                 {return this._data.st?true:false;}
    public type(): OUTPUT_TYPE              {return this._data.type;}

    // --------------------------------------------------------------------------------------
    public handleUpdate(data: MIO441R_OutputStruct): MIO441R_OutputStruct{
        this._data = data;
        // console.log("UPDATE Output data : ", this.id(), this._data.name);
        this.handleCalcBrightness();

        if(this._data.reqValue > this._data.pwrMin)
            this._lastNonZeroBrightness = this._data.reqValue;

        this.afterUpdate(this._data.hk);
        return this._data;
    }

    // --------------------------------------------------------------------------------------
    public handleMqtt(data: MIO441R_OutputMqttStruct){
        if(this.isInitDone()){
            if(data.state === 'ON')
                this._data.st = true;
            else if(data.state === 'OFF')
                this._data.st = false;

            if(data.brightness)
                this._data.reqValue = data.brightness;
                
            this.handleCalcBrightness();
            this.afterUpdate(null);
        }
    }

    // --------------------------------------------------------------------------------------
    private setPower(value: number): Promise<MIO441R_OutputStruct>{
        return new Promise<MIO441R_OutputStruct>((resolve, reject) => {
            let cmd = {"output": {id: this.id(), "power": value}};
            console.log("SET Power : ",cmd);
            this._device.handleCommand(cmd, {output: null}).then(res => {
                this._data.reqValue = value;
                resolve(this._data);
            }).catch(err => {
                console.log("setPower ERROR : ", err);
                reject(this._data);
            })
        })
    }

    // --------------------------------------------------------------------------------------
    public handleCalcBrightness(){
        let tmp = this._data.pwrMax - this._data.pwrMin;
        let perc = this._data.reqValue - this._data.pwrMin;
        this._brightness = perc * 100 / tmp;
        if(this._brightness > 0){
            this._lastNonZeroBrightness = this._brightness;
        }
    }

     // --------------------------------------------------------------------------------------
     public getOn(): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            this._device.handleGetOutputs().then(() => {
                resolve({err: null, value: this._data.st});
            }).catch(data => {
                reject({err: null, value: this._data.st});
            });
        });
    }

    // --------------------------------------------------------------------------------------
    public setOn(state: boolean): Promise<MIO441R_OutputStruct>{
        console.log("SET On to state : ", state);
        return this.setPower((state)?this._lastNonZeroBrightness:0);
    }

    // --------------------------------------------------------------------------------------
    public handleGetBrightness(){
        return new Promise<any>((resolve, reject) => {
            this._device.updateOutputs().then(() => {
                resolve({err: null, value: this._brightness});
            }).catch(data => {
                reject({err: null, value: this._brightness});
            });
        });
    }

    // --------------------------------------------------------------------------------------
    public handleSetBrightness(value: number): Promise<MIO441R_OutputStruct>{
        let tmp = this._data.pwrMax - this._data.pwrMin;
        tmp = value * tmp / 100;

        if(value > 0)
            this._lastNonZeroBrightness = value;

        console.log("SET Brightness to (power) : ", tmp, value);
        return this.setPower(tmp);
    }
}

// --------------------------------------------------------------------------------------
