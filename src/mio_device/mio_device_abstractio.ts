// --------------------------------------------------------------------------------------
import { MIO441R_IO_Callback } from './mio_structs'

// --------------------------------------------------------------------------------------
export abstract class MIO441R_AbstractIO{
    private readonly _id: number;
    private _uuid: string;
    private _init: boolean = false;
    private _enableHK: boolean = true;
    protected readonly _device: any;

    private clbck_Init: Array<any> = [];
    private clbck_Update: Array<any> = [];
    private clbck_HK: Array<any> = [];

    // --------------------------------------------------------------------------------------
    constructor(dev: any, id: number, prefix: string){
        this._id = id;
        this._device = dev;
        this._uuid = `${dev.uuid()}-${prefix}-${id}`;
    }

    // --------------------------------------------------------------------------------------
    public id():number                      {return this._id};
    public uuid() :string                   {return this._uuid};
    public isHomeKit(): boolean             {return this._enableHK;}
    public isInitDone():boolean             {return this._init;}
    
    // --------------------------------------------------------------------------------------
    public on(key: MIO441R_IO_Callback, callback: CallableFunction){
        if(key == MIO441R_IO_Callback.INIT)             {this.clbck_Init.push(callback);}
        else if(key == MIO441R_IO_Callback.UPDATE)      {this.clbck_Update.push(callback);}
        else if(key == MIO441R_IO_Callback.HOMEKIT)     {this.clbck_HK.push(callback);}
    }

    // --------------------------------------------------------------------------------------
    public setHomeKit(enable:boolean | undefined | null):void
    {
        if(enable == undefined || enable == null)
            return;

        if(this._enableHK !== enable){
            this._enableHK = enable;
            this.clbck_HK.forEach( (value) => {value.call(enable);});
        }
    }

    // --------------------------------------------------------------------------------------
    protected afterUpdate(hk:boolean | undefined | null): void{
        if(hk)
            this.setHomeKit(hk);

        if(this._init == false){
            this._init = true;
            this.clbck_Init.forEach( (value) => {value.call();});
        }

        this.clbck_Update.forEach( (value) => {value.call();});
    }
}

// --------------------------------------------------------------------------------------
