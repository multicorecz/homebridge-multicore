// --------------------------------------------------------------------------------------
import { MIO441R_AbstractIO } from './mio_device_abstractio';
import { MIO441R_DayLuStruct, MIO441R_OutputStruct } from './mio_structs'

// --------------------------------------------------------------------------------------
export class MIO441R_DayLU extends MIO441R_AbstractIO{
    private _data: MIO441R_DayLuStruct;
    private _lastNonZeroBrightness: number = 100;
    public _brightness: number = 0;

    // --------------------------------------------------------------------------------------
    constructor(dev: any, id: number){
        super(dev, id, "OUT");
        this._data = {
            enable: false,
            usrpwr: false,
            output: 0
        };
    }

    // --------------------------------------------------------------------------------------
    public name():string                    {return this._data.name!};
    public data(): MIO441R_DayLuStruct      {return this._data;}
    public brightness(): number             {return this._brightness;}
    public isUsrPwr(): boolean              {return this._data.usrpwr?true:false;}
    public state(): boolean                 {return this._brightness?true:false;}
    public isEnable(): boolean              {return this._data.enable};

    // --------------------------------------------------------------------------------------
    public handleUpdate(data: MIO441R_DayLuStruct): MIO441R_DayLuStruct{
        this._data = data;
        // console.log("UPDATE Output data : ", this.id(), this._data.name);

        this.afterUpdate(this._data.hk);
        return this._data;
    }

    // --------------------------------------------------------------------------------------
    private setUsrPower(value: number | null): Promise<MIO441R_DayLuStruct>{
        return new Promise<MIO441R_DayLuStruct>((resolve, reject) => {
            let cmd = {"dayLU": {id: this.id(), "usrpwr": value}};
            console.log("SET User Power : ",cmd);
            this._device.handleCommand(cmd, {dayLU: null}).then(res => {
                resolve(this._data);
            }).catch(err => {
                console.log("setPower ERROR : ", err);
                reject(this._data);
            })
        })
    }

     // --------------------------------------------------------------------------------------
     public getOn(): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            this._device.handleGetOutputs().then(() => {
                resolve({err: null, value: this.state()});
            }).catch(data => {
                reject({err: null, value: this.state()});
            });
        });
    }

    // --------------------------------------------------------------------------------------
    public setOn(state: boolean): Promise<MIO441R_DayLuStruct>{
        console.log("SET On to state : ", state);
        return this.setUsrPower((state)?this._lastNonZeroBrightness:0);
    }

    // --------------------------------------------------------------------------------------
    public handleSetBrightness(value: number): Promise<MIO441R_DayLuStruct>{
        let _output: MIO441R_OutputStruct = this._device.output(this._data.output).data();
        let tmp = _output.pwrMax - _output.pwrMin;
        tmp = value * tmp / 100;

        if(value > 0)
            this._lastNonZeroBrightness = value;

        console.log("SET Usr Brightness to (power) : ", tmp, value);
        return this.setUsrPower(tmp);
    }
}

// --------------------------------------------------------------------------------------
