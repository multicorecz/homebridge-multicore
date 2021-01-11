// --------------------------------------------------------------------------------------
import { Service, Logger, PlatformAccessory, Characteristic, WithUUID, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { MulticoreHomebridgePlatform } from '../platform';
import { ConfigInput } from '../config'
// import {WattCharacteristic} from './characteristics';
import DefaultCharacteristicImport from '../characteristics/default-characteristic';
import WattsImport from '../characteristics/watts';

// --------------------------------------------------------------------------------------
interface testUnit{
    state: boolean;
    hue: number;
    saturation: number;
    brightness: number;
    inUse: boolean;
}

// --------------------------------------------------------------------------------------
export class MIO441R_TestAccessory {
    private platform: MulticoreHomebridgePlatform;
    readonly homebridgeAccessory: PlatformAccessory;
    private device: testUnit;
    private readonly log: Logger;
    private config: ConfigInput;
 
    public service: Service | undefined;
    private readonly servisName: string = 'test';

    public customCharacteristics: WithUUID<new () => Characteristic>;

    // --------------------------------------------------------------------------------------
    constructor( platform: MulticoreHomebridgePlatform, homebridgeAccessory: PlatformAccessory)
    {
        this.device = { state: false, hue: 0, saturation: 0, brightness: 0, inUse: false };
        this.homebridgeAccessory = homebridgeAccessory;
        this.platform = platform;
        this.config = platform.config;
        this.log = platform.log;
        this.customCharacteristics = WattsImport(DefaultCharacteristicImport(platform.api.hap.Characteristic));
        this.deinitService();
    }
    
    // --------------------------------------------------------------------------------------
    private initService(){
        if(this.service)
            return;

        this.service = this.homebridgeAccessory.getService(this.servisName) || this.homebridgeAccessory.addService(this.platform.Service.Outlet, this.servisName, this.servisName);
        this.service.getCharacteristic(this.platform.Characteristic.On)                    
        .on('set', this.setOn.bind(this))                                                    
        .on('get', this.getOn.bind(this));   
        this.service.getCharacteristic(this.platform.Characteristic.InUse)                                                                 
        .on('get', this.getInUse.bind(this));   
        console.log(this.customCharacteristics);

        // this.service.addOptionalCharacteristic(this.customCharacteristics);
        this.service.getCharacteristic(this.customCharacteristics)
        .on('get', this.getAmperes.bind(this));
        
        // this.service.getCharacteristic(this.platform.Characteristic.Hue)                   
        // .on('set', this.setHue.bind(this))                                                   
        // .on('get', this.getHue.bind(this));                                                  
        // this.service.getCharacteristic(this.platform.Characteristic.Saturation)
        // .on('set', this.setSaturation.bind(this))                                      
        // .on('get', this.getSaturation.bind(this));        
        // this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        // .on('set', this.setBrightness.bind(this))                                      
        // .on('get', this.getBrightness.bind(this));                                    
    }

    // --------------------------------------------------------------------------------------
    private deinitService(){
        const service = this.homebridgeAccessory.getService(this.servisName);
        if(service)
            this.homebridgeAccessory.removeService(service);
        this.service = undefined;
    }

    // --------------------------------------------------------------------------------------
    setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) 
    {
        this.platform.log.debug('Set Characteristic On -> ', value);
        this.device.state = value as boolean;
        callback(null);
    }

    // --------------------------------------------------------------------------------------
    getOn(callback: CharacteristicGetCallback) 
    { 
        this.platform.log.debug('Get Characteristic On');
        callback(null, this.device.state);
    }

    // --------------------------------------------------------------------------------------
    getInUse(callback: CharacteristicGetCallback) 
    { 
        this.platform.log.debug('Get Characteristic InUse');
        callback(null, this.device.inUse);
    }

    // --------------------------------------------------------------------------------------
    setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) 
    {
        this.platform.log.debug('Set Characteristic Hue -> ', value);
        this.device.hue = value as number;
        callback(null);
    }

    // --------------------------------------------------------------------------------------
    getHue(callback: CharacteristicGetCallback) 
    { 
        this.platform.log.debug('Get Characteristic Hue');
        callback(null, this.device.hue);
    }

    // --------------------------------------------------------------------------------------
    setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) 
    {
        this.platform.log.debug('Set Characteristic Saturation -> ', value);
        this.device.saturation = value as number;
        callback(null);
    }

    // --------------------------------------------------------------------------------------
    getSaturation(callback: CharacteristicGetCallback) 
    { 
        this.platform.log.debug('Get Characteristic Saturation');
        callback(null, this.device.saturation);
    }

    // --------------------------------------------------------------------------------------
    setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) 
    {
        this.platform.log.debug('Set Characteristic Brightness -> ', value);
        this.device.brightness = value as number;
        callback(null);
    }

    // --------------------------------------------------------------------------------------
    getBrightness(callback: CharacteristicGetCallback) 
    { 
        this.platform.log.debug('Get Characteristic Brightness');
        callback(null, this.device.brightness);
    }

    // --------------------------------------------------------------------------------------
    getAmperes(callback: CharacteristicGetCallback) 
    { 
        this.platform.log.debug('Get Characteristic Amperes');
        callback(null, this.device.brightness);
    }
}

// --------------------------------------------------------------------------------------