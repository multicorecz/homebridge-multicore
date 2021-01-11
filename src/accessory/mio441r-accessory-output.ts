// https://developers.homebridge.io/#/service/Lightbulb
// https://developers.homebridge.io/#/service/Relay
// https://developers.homebridge.io/#/service/Valve

// --------------------------------------------------------------------------------------
import { PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { MulticoreHomebridgePlatform } from '../platform';
import { MIO441R_Output } from '../mio_device'
import { MIO441R_IO_Callback, OUTPUT_TYPE } from '../mio_device/mio_structs';
import { MIO441R_AccessoryAbstract } from './mio441r-accessory-abstract';

// --------------------------------------------------------------------------------------
export class MIO441R_OutputAccessory extends MIO441R_AccessoryAbstract {
    private deviceUnit: MIO441R_Output;

    static SERVICES = {
        RELAY: 'Relay',
        LIGHTBULB: 'Lightbulb'
    };

    // --------------------------------------------------------------------------------------
    constructor(platform: MulticoreHomebridgePlatform, homebridgeAccessory: PlatformAccessory, deviceOutput: MIO441R_Output){
        super(platform, homebridgeAccessory, deviceOutput.id());

        this.deviceUnit = deviceOutput;        
        this.deviceUnit.on(MIO441R_IO_Callback.INIT, this.handleInit.bind(this));
        this.deviceUnit.on(MIO441R_IO_Callback.UPDATE, this.handleUpdateData.bind(this));
        this.deviceUnit.on(MIO441R_IO_Callback.HOMEKIT, this.handleHomeKit.bind(this));
    }

    // --------------------------------------------------------------------------------------
    private handleInit(){
        if(this.config.api?.debug! >= 1)
            this.log.debug('MIO441R_OutputAccessory : %d', this.deviceUnit.id());
        this.handleHomeKit();
    }

    // --------------------------------------------------------------------------------------
    private handleHomeKit(){
        if((this.config.api?.outputDis === true) || (this.deviceUnit.isHomeKit() === false))
            this.deinitService(MIO441R_OutputAccessory.SERVICES.LIGHTBULB);    
        else
            this.initLightBulb();
    }
    
    // --------------------------------------------------------------------------------------
    private initLightBulb(){
        if(this.getService(MIO441R_OutputAccessory.SERVICES.LIGHTBULB))
            return;

        let service = this.addService(this.platform.Service.Lightbulb, MIO441R_OutputAccessory.SERVICES.LIGHTBULB);
        service.getCharacteristic(this.platform.Characteristic.On)               // register handlers for the On/Off Characteristic
        .on('set', this.setOn.bind(this))                                                       // SET - bind to the `setOn` method below
        .on('get', this.getOn.bind(this));                                                      // GET - bind to the `getOn` method below

        if(this.deviceUnit.type() === OUTPUT_TYPE.PWM || this.deviceUnit.type() === OUTPUT_TYPE.OnOff_withRamp){
            service.getCharacteristic(this.platform.Characteristic.Brightness)       // register handlers for the Brightness Characteristic
            .on('set', this.setBrightness.bind(this))                                               // SET - bind to the 'setBrightness` method below
            .on('get', this.getBrightness.bind(this));                                              // GET - bind to the 'getBrightness` method below
        }
        else{
            service.removeCharacteristic(service.getCharacteristic(this.platform.Characteristic.Brightness));
        }
    }

    // --------------------------------------------------------------------------------------
    private initRelay(){
        if(this.getService(MIO441R_OutputAccessory.SERVICES.RELAY))
            return;
        
        let service = this.addService(this.platform.Service.Relay, MIO441R_OutputAccessory.SERVICES.RELAY);

        service.getCharacteristic(this.platform.Characteristic.RelayEnabled) 
        .on('get', this.getOn.bind(this))
        .on('set', this.setRelayEnabled.bind(this));

        service.getCharacteristic(this.platform.Characteristic.RelayState)
        .on('get', this.getOn.bind(this));

        service.getCharacteristic(this.platform.Characteristic.RelayControlPoint)
        .on('get', this.getRelayCP.bind(this))
        .on('set', this.setRelayCP.bind(this));
    }
    
    // --------------------------------------------------------------------------------------
    handleUpdateData(){
        if(this.config.api?.debug! >= 2)
            this.log.info("handleUpdateData", this.deviceUnit.uuid());

        let serviceLightBulb = this.getService(MIO441R_OutputAccessory.SERVICES.LIGHTBULB);
        if(serviceLightBulb){
            serviceLightBulb.updateCharacteristic(this.platform.Characteristic.Name, this.deviceUnit.name()!);
            serviceLightBulb.updateCharacteristic(this.platform.Characteristic.On, this.deviceUnit.state());

            if(this.deviceUnit.type() === OUTPUT_TYPE.PWM || this.deviceUnit.type() === OUTPUT_TYPE.OnOff_withRamp){
                serviceLightBulb.updateCharacteristic(this.platform.Characteristic.Brightness, this.deviceUnit.brightness());
            }else{
                serviceLightBulb.removeCharacteristic(serviceLightBulb.getCharacteristic(this.platform.Characteristic.Brightness));
            }
        }
        
        let serviceRelay = this.getService(MIO441R_OutputAccessory.SERVICES.LIGHTBULB);
        if(serviceRelay){
            serviceRelay.updateCharacteristic(this.platform.Characteristic.Name, this.deviceUnit.name()!);
            serviceRelay.updateCharacteristic(this.platform.Characteristic.RelayState, this.deviceUnit.state());
            serviceRelay.updateCharacteristic(this.platform.Characteristic.RelayEnabled, this.deviceUnit.state());
        }
    }
    
    // --------------------------------------------------------------------------------------
    getRelayCP(callback: CharacteristicGetCallback) {
        this.platform.log.debug('Get Relay CP');
        callback(null, 1);
    }

    // --------------------------------------------------------------------------------------
    setRelayCP(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set Relay CP ->', value);
        callback(null);
    }

    // --------------------------------------------------------------------------------------
    setRelayEnabled(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set Characteristic Relay Enabled ->', value);
        this.deviceUnit.setOn(value as boolean).then( data => {
            callback(null);
        }).catch( () => {
            callback(null);                                                                 // you must call the callback function
        });
    }

    // --------------------------------------------------------------------------------------
    setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) 
    {
        this.platform.log.debug('Set Characteristic On ->', value);
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
    setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set Characteristic Brightness ->', value);
        this.deviceUnit.handleSetBrightness(value as number).then( () => {
            callback(null); 
        }).catch(err => {
            callback(null);
        });
    }

    // --------------------------------------------------------------------------------------
    getBrightness(callback: CharacteristicGetCallback) {
        callback(null, this.deviceUnit.brightness());
    }
}