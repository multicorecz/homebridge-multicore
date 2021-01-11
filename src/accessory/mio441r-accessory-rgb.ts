// --------------------------------------------------------------------------------------
import { PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { MulticoreHomebridgePlatform } from '../platform';
import { MIO441R_RGB } from '../mio_device/mio_device_rgb'
import { MIO441R_IO_Callback } from '../mio_device/mio_structs';
import { MIO441R_AccessoryAbstract } from './mio441r-accessory-abstract';

// --------------------------------------------------------------------------------------
export * from './mio441r-accessory-output'

// --------------------------------------------------------------------------------------
export class MIO441R_RgbAccessory extends MIO441R_AccessoryAbstract {
    private deviceUnit: MIO441R_RGB;
 
    static SERVICES = {
        RGBLIGHT: 'rgbLight',
    };

    // --------------------------------------------------------------------------------------
    constructor( platform: MulticoreHomebridgePlatform, homebridgeAccessory: PlatformAccessory, deviceRGB: MIO441R_RGB)
    {
        super(platform, homebridgeAccessory, 0);
        
        this.deviceUnit = deviceRGB;
        this.deviceUnit.on(MIO441R_IO_Callback.INIT, this.handleInit.bind(this));
        this.deviceUnit.on(MIO441R_IO_Callback.UPDATE, this.handleUpdateData.bind(this));
        this.deviceUnit.on(MIO441R_IO_Callback.HOMEKIT, this.handleHomeKit.bind(this));
    }

    // --------------------------------------------------------------------------------------
    private handleInit(){
        if(this.config.api?.debug! >= 1)
            this.log.debug('MIO441R_RgbAccessory : Init');

        this.handleHomeKit();
    }

    // --------------------------------------------------------------------------------------
    private handleHomeKit(){
        if((this.config.api?.outRgbDis === true) || (this.deviceUnit.isHomeKit() === false))
            this.deinitService(MIO441R_RgbAccessory.SERVICES.RGBLIGHT);
        else
            this.initService();
    }
    
    // --------------------------------------------------------------------------------------
    private initService(){
        if(this.getService(MIO441R_RgbAccessory.SERVICES.RGBLIGHT))
            return;

        let service = this.addService(this.platform.Service.Lightbulb, MIO441R_RgbAccessory.SERVICES.RGBLIGHT);
        
        service.getCharacteristic(this.platform.Characteristic.On)                    
        .on('set', this.setOn.bind(this))                                                    
        .on('get', this.getOn.bind(this));                                                   
        service.getCharacteristic(this.platform.Characteristic.Hue)                   
        .on('set', this.setHue.bind(this))                                                   
        .on('get', this.getHue.bind(this));                                                  
        service.getCharacteristic(this.platform.Characteristic.Saturation)
        .on('set', this.setSaturation.bind(this))                                      
        .on('get', this.getSaturation.bind(this));        
        service.getCharacteristic(this.platform.Characteristic.Brightness)
        .on('set', this.setBrightness.bind(this))                                      
        .on('get', this.getBrightness.bind(this));                                    
    }

    // --------------------------------------------------------------------------------------
    private handleUpdateData(){
        let serviceRGB = this.getService(MIO441R_RgbAccessory.SERVICES.RGBLIGHT);
        if(serviceRGB){
            if(this.config.api?.debug! >= 2)
                this.log.info("handleUpdateData", this.deviceUnit.uuid());
            serviceRGB.updateCharacteristic(this.platform.Characteristic.On, this.deviceUnit.state());
            serviceRGB.updateCharacteristic(this.platform.Characteristic.Hue, this.deviceUnit.hue());
            serviceRGB.updateCharacteristic(this.platform.Characteristic.Saturation, this.deviceUnit.saturation());
            serviceRGB.updateCharacteristic(this.platform.Characteristic.Brightness, this.deviceUnit.brightness());
        }
    }

    // --------------------------------------------------------------------------------------
    setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set RGB Characteristic On -> ', value);
        this.deviceUnit.setOn(value as number).then( () =>{callback(null);} ).catch( () => {callback(null);} );
    }

    // --------------------------------------------------------------------------------------
    getOn(callback: CharacteristicGetCallback) { 
        this.platform.log.debug('Get RGB Characteristic On');
        callback(null, this.deviceUnit.state());
    }

    // --------------------------------------------------------------------------------------
    setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set RGB Characteristic Hue -> ', value);
        this.deviceUnit.setHue(value as number);
        this.deviceUnit.updateOutputs().then(() => {callback(null);}).catch(() => {callback(null);});
    }

    // --------------------------------------------------------------------------------------
    getHue(callback: CharacteristicGetCallback) { 
        this.platform.log.debug('Get RGB Characteristic Hue');
        callback(null, this.deviceUnit.hue());
    }

    // --------------------------------------------------------------------------------------
    setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set RGB Characteristic Saturation -> ', value);
        this.deviceUnit.setSaturation(value as number);
        this.deviceUnit.updateOutputs().then(() => {callback(null);}).catch(() => {callback(null);});
    }

    // --------------------------------------------------------------------------------------
    getSaturation(callback: CharacteristicGetCallback) { 
        this.platform.log.debug('Get RGB Characteristic Saturation');
        callback(null, this.deviceUnit.saturation());
    }

    // --------------------------------------------------------------------------------------
    setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
        this.platform.log.debug('Set RGB Characteristic Brightness -> ', value);
        this.deviceUnit.setBrightness(value as number);
        this.deviceUnit.updateOutputs().then(() => {callback(null);}).catch(() => {callback(null);});
    }

    // --------------------------------------------------------------------------------------
    getBrightness(callback: CharacteristicGetCallback) { 
        this.platform.log.debug('Get RGB Characteristic Brightness');
        callback(null, this.deviceUnit.brightness());
    }
}

// --------------------------------------------------------------------------------------