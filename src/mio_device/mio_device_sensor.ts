// --------------------------------------------------------------------------------------
import { MIO441R_SensorStruct, SENSOR_TYPE } from './mio_structs'
import { MIO441R_AbstractIO } from './mio_device_abstractio';

// --------------------------------------------------------------------------------------
export class MIO441R_Sensor extends MIO441R_AbstractIO{
    private _data: MIO441R_SensorStruct;

    constructor(dev: any, id: number){
        super(dev, id, "SENSOR")
        this._data = {
            value: 0,
            type: SENSOR_TYPE.period
        };
    }

    // --------------------------------------------------------------------------------------
    public name():string                    {return this._data.name!};
    public data(): MIO441R_SensorStruct     {return this._data;}
    public state(): boolean                 {return this._data.state?true:false;}
    public type(): SENSOR_TYPE              {return this._data.type;}

    // --------------------------------------------------------------------------------------
    public handleUpdate(data: MIO441R_SensorStruct): MIO441R_SensorStruct{
        this._data = data;
        // console.log("UPDATE Input data : ", this.id(), this._data.name);
        this.afterUpdate(data.hk);
        return this._data;
    }
}

// --------------------------------------------------------------------------------------
