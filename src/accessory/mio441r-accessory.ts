import { Service, Logger, PlatformAccessory } from 'homebridge';
import { MulticoreHomebridgePlatform } from '../platform';
import { MIO441R, MIO441R_BaseStruct } from '../mio_device'
import { ConfigInput } from '../config'
import { MIO441R_OutputAccessory } from './mio441r-accessory-output'
import { MIO441R_InputAccessory } from './mio441r-accessory-input'
import { MIO441R_RgbAccessory } from './mio441r-accessory-rgb';
import { MIO441R_TestAccessory } from './mio441r-accessory-test';

// --------------------------------------------------------------------------------------
export class MIO441R_Accessory {
    public readonly platform: MulticoreHomebridgePlatform;
    readonly homebridgeAccessory: PlatformAccessory;
    private readonly log: Logger;
    private device: MIO441R;
    private name: string;
    private readonly _config: ConfigInput;
 
    private readonly services: Record<string, Service> = {};   
    public _serviceInfo: Service;

    private _inputsHK: Array<MIO441R_InputAccessory> = [];
    private _outputsHK: Array<MIO441R_OutputAccessory> = [];
    private _rgbHK: MIO441R_RgbAccessory;

    // --------------------------------------------------------------------------------------
    constructor( 
        platform: MulticoreHomebridgePlatform, 
        config: ConfigInput, 
        homebridgeAccessory: PlatformAccessory | undefined,
        deviceInitData: MIO441R_BaseStruct )
    {
        this.platform = platform;
        this.log = platform.log;
        this._config = config;

        this.log.debug("%j", deviceInitData);

        this.device = new MIO441R(deviceInitData, this.platform.mqtt);
        this.name = deviceInitData.name;

        if (homebridgeAccessory !== undefined) {
            homebridgeAccessory.context.device = deviceInitData;
            this.homebridgeAccessory = homebridgeAccessory;
            this.log.debug(`[${this.name}] Existing Accessory found [${homebridgeAccessory.context.deviceId}] [${homebridgeAccessory.UUID}]}`);
            this.homebridgeAccessory.displayName = deviceInitData.name;
        }
        else{
            const uuid = platform.api.hap.uuid.generate(deviceInitData.uuid);
            this.log.debug(`[${this.name}] Creating new Accessory [${deviceInitData.uuid}] [${uuid}]}`);
            this.homebridgeAccessory = new platform.api.platformAccessory(this.name, uuid);
        }

        // set accessory information
        this._serviceInfo = this.homebridgeAccessory.getService(this.platform.Service.AccessoryInformation)!;
        this._serviceInfo.setCharacteristic(this.platform.Characteristic.Manufacturer, 'MULTICORE s.r.o.')
        this._serviceInfo.setCharacteristic(this.platform.Characteristic.Model, 'MIO441R')
        this._serviceInfo.setCharacteristic(this.platform.Characteristic.SerialNumber, deviceInitData.uuid);
        // this._serviceInfo.setCharacteristic(this.platform.Characteristic.SoftwareRevision, '');
        this._serviceInfo.setCharacteristic(this.platform.Characteristic.ProductData, `http://${deviceInitData.address}/`);

        this.device.on('update', this.updateInfo.bind(this));

        for(let i = 0; i < this.device._inputs.length; i++)
            this._inputsHK.push(new MIO441R_InputAccessory(platform, this.homebridgeAccessory, this.device.input(i)));

        for(let i = 0; i < this.device._outputs.length; i++)
            this._outputsHK.push(new MIO441R_OutputAccessory(platform, this.homebridgeAccessory, this.device.output(i)));

        this._rgbHK = new MIO441R_RgbAccessory(platform, this.homebridgeAccessory, this.device._rgb);

        // new MIO441R_TestAccessory(platform, this.homebridgeAccessory);

        this.device.start();
    }

    // --------------------------------------------------------------------------------------
    public deviceUpdateContext(deviceData :MIO441R_BaseStruct){
        if(this._config.api?.debug! >= 2)
            this.log.debug('Update context of device : ', deviceData.uuid, deviceData.address);
            
        this.name = deviceData.name;
        this.homebridgeAccessory.context.device = deviceData;
        this.device.api().setIpAddress(deviceData.address);
        this.platform.api.updatePlatformAccessories([this.homebridgeAccessory]);
    }

    // --------------------------------------------------------------------------------------
    private updateInfo(){
        if(this._config.api?.debug! >= 2)
            this.log.info("handleUpdateData", this.device.uuid());
        this._serviceInfo.updateCharacteristic(this.platform.Characteristic.FirmwareRevision, this.device._infoData.fw!);
        this._serviceInfo.updateCharacteristic(this.platform.Characteristic.HardwareRevision, this.device._infoData.hw!);
        this._serviceInfo.updateCharacteristic(this.platform.Characteristic.Name, this.device._baseData.name);
        this._serviceInfo.updateCharacteristic(this.platform.Characteristic.ProductData, `http://${this.device._baseData.address}/`);
    }
}

// --------------------------------------------------------------------------------------