// https://developers.homebridge.io/#/service/Switch
// https://developers.homebridge.io/#/service/MotionSensor
// https://developers.homebridge.io/#/characteristic/ProgrammableSwitchEvent
// https://developers.homebridge.io/#/service/StatelessProgrammableSwitch

// --------------------------------------------------------------------------------------
import { PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { MulticoreHomebridgePlatform } from '../platform';
import { MIO441R_Input, INPUT_TYPE, MIO441R_IO_Callback } from '../mio_device'
import { MIO441R_AccessoryAbstract } from './mio441r-accessory-abstract';

// --------------------------------------------------------------------------------------
export class MIO441R_InputAccessory extends MIO441R_AccessoryAbstract {
    private deviceUnit: MIO441R_Input;

    static SERVICES = {
        SWITCH: 'Switch',
        MOTION: 'Motion'
    };

    // --------------------------------------------------------------------------------------
    constructor(platform: MulticoreHomebridgePlatform, homebridgeAccessory: PlatformAccessory, deviceInput: MIO441R_Input){
        super(platform, homebridgeAccessory, deviceInput.id());

        this.deviceUnit = deviceInput;
        this.deviceUnit.on(MIO441R_IO_Callback.INIT, this.handleInit.bind(this));
        this.deviceUnit.on(MIO441R_IO_Callback.UPDATE, this.handleUpdateData.bind(this));
        this.deviceUnit.on(MIO441R_IO_Callback.HOMEKIT, this.handleHomeKit.bind(this));
    }

    // --------------------------------------------------------------------------------------
    private handleInit(){
        if(this.config.api?.debug! >= 1)
            this.log.debug('MIO441R_InputAccessory : %d', this.deviceUnit.id());
        this.handleHomeKit();
    }
    
    // --------------------------------------------------------------------------------------
    private handleHomeKit(){
        if((this.config.api?.swInputsDis === true) || (this.deviceUnit.isHomeKit() === false)){
            this.deinitService(MIO441R_InputAccessory.SERVICES.MOTION);
            this.deinitService(MIO441R_InputAccessory.SERVICES.SWITCH);
        }else{
            if(this.deviceUnit.type() == INPUT_TYPE.PIR){
                if(this.config.api?.pirInputsDis === true)
                    this.deinitService(MIO441R_InputAccessory.SERVICES.MOTION);
                else
                    this.initMotion();
        
                if((this.config.api?.pirEmitInputsDis === true))
                    this.deinitService(MIO441R_InputAccessory.SERVICES.SWITCH);
                else
                    this.initSwitch();
            }else{
                this.deinitService(MIO441R_InputAccessory.SERVICES.MOTION);
                this.initSwitch();
            }
        }
    }
    
    // --------------------------------------------------------------------------------------
    private initSwitch(){
        if(this.getService(MIO441R_InputAccessory.SERVICES.SWITCH))
            return;

        let service = this.addService(this.platform.Service.Switch, MIO441R_InputAccessory.SERVICES.SWITCH);
        service.getCharacteristic(this.platform.Characteristic.On)                                  // register handlers for the On/Off Characteristic
        .on('set', this.setOn.bind(this))                                                           // SET - bind to the `setOn` method below
        .on('get', this.getOn.bind(this));                                                          // GET - bind to the `getOn` method below
    }

    // --------------------------------------------------------------------------------------
    private initMotion(){
        if(this.getService(MIO441R_InputAccessory.SERVICES.MOTION))
            return;

        let service = this.addService(this.platform.Service.MotionSensor, MIO441R_InputAccessory.SERVICES.MOTION);
        service.getCharacteristic(this.platform.Characteristic.MotionDetected)                      // register handlers for the On/Off Characteristic
        .on('get', this.getMotion.bind(this));                                                      // GET - bind to the `getOn` method below
    }

    // --------------------------------------------------------------------------------------
    private handleUpdateData(){
        if(this.config.api?.debug! >= 2)
            this.log.info("handleUpdateData", this.deviceUnit.uuid());
        
        let serviceSwitch = this.getService(MIO441R_InputAccessory.SERVICES.SWITCH);
        if(serviceSwitch){
            serviceSwitch.updateCharacteristic(this.platform.Characteristic.Name, this.deviceUnit.name()!);
            serviceSwitch.updateCharacteristic(this.platform.Characteristic.On, this.deviceUnit.state());
        }
        
        let serviceMotion = this.getService(MIO441R_InputAccessory.SERVICES.MOTION);
        if(serviceMotion){
            serviceMotion.updateCharacteristic(this.platform.Characteristic.Name, this.deviceUnit.name()!);
            serviceMotion.updateCharacteristic(this.platform.Characteristic.MotionDetected, this.deviceUnit.state());
        }
    }

    // --------------------------------------------------------------------------------------
    setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) 
    {
        this.platform.log.debug('Set Switch Characteristic On ->', value);
        this.deviceUnit.setOn(value as boolean).then( data => {
            callback(null);
        }).catch( () => {
            callback(null);                                                                 // you must call the callback function
        });
    }

    // --------------------------------------------------------------------------------------
    getOn(callback: CharacteristicGetCallback) {
        callback(null, this.deviceUnit.state());
    }

    // --------------------------------------------------------------------------------------
    getMotion(callback: CharacteristicGetCallback) {
        callback(null, this.deviceUnit.state());
    }
}