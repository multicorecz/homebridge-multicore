// https://developers.homebridge.io/#/service/Switch
// https://developers.homebridge.io/#/service/MotionSensor
// https://developers.homebridge.io/#/characteristic/ProgrammableSwitchEvent
// https://developers.homebridge.io/#/service/StatelessProgrammableSwitch

// --------------------------------------------------------------------------------------
import { Service, Logger, PlatformAccessory } from 'homebridge';
import { MulticoreHomebridgePlatform } from '../platform';
import { ConfigInput } from '../config'

// --------------------------------------------------------------------------------------
export abstract class MIO441R_AccessoryAbstract {
    protected readonly homebridgeAccessory: PlatformAccessory;
    protected readonly platform: MulticoreHomebridgePlatform;
    protected readonly log: Logger;
    protected readonly config: ConfigInput;
    
    private readonly id: number;
    private readonly services: Map<string, Service> = new Map();

    // --------------------------------------------------------------------------------------
    constructor(platform: MulticoreHomebridgePlatform, homebridgeAccessory: PlatformAccessory, id: number){
        this.homebridgeAccessory = homebridgeAccessory;
        this.platform = platform;
        this.config = platform.config;
        this.log = platform.log;
        this.id = id;
    }
    
    // --------------------------------------------------------------------------------------
    protected getService(name: string) : Service | undefined{
        return this.services.get(name + this.id);
    }

    // --------------------------------------------------------------------------------------
    protected addService(serviceType: any, name: string) : Service {
        let _name = name + this.id;
        let service = this.homebridgeAccessory.getService(_name) ||  this.homebridgeAccessory.addService(serviceType, _name, _name);
        this.removeService(_name);
        this.services.set(_name, service);
        return service;
    }

    // --------------------------------------------------------------------------------------
    protected removeService(name: string): boolean {
        let _name = name + this.id;
        let service = this.services.get(_name);

        if(service){
            this.homebridgeAccessory.removeService(service);
            this.services.delete(_name);
            return true;
        }

        return false;
    }
    
    // --------------------------------------------------------------------------------------
    protected deinitService(name: string){
        let _name = name + this.id;
        if(this.removeService(_name) == false){
            const service = this.homebridgeAccessory.getService(_name);
            if(service)
                this.homebridgeAccessory.removeService(service);
        }
    }
}