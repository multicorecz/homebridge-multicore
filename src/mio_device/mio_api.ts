import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { RemoteInfo } from 'dgram';
import { Client as ClientSSDP, SsdpHeaders } from 'node-ssdp';
import xml2js from 'xml2js';
import { MIO441R_BaseStruct, MIO441R_InfoStruct } from './mio_structs';

// --------------------------------------------------------------------------------------
declare module 'axios' {
    interface AxiosResponse<T = any> extends Promise<T> {}
}
  
// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
export class ApiSearch{
    private _ssdpClient: ClientSSDP;
    private readonly _httpClient: AxiosInstance;
    private _clbck_MIO_found: Array<any> = [];

    static DEVICES = {
        MIO441R: 'MIO441R'
    };

    // --------------------------------------------------------------------------------------
    constructor(){
        this._ssdpClient = new ClientSSDP();
        this._ssdpClient.on('response', (headers, statusCode, rinfo) => this.onResponse(headers, statusCode, rinfo));
        this._httpClient = axios.create();
    }

    // --------------------------------------------------------------------------------------
    destroy() {
        this._ssdpClient.stop();
    }

    // --------------------------------------------------------------------------------------
    private onResponse(headers: SsdpHeaders, statusCode: number, rinfo: RemoteInfo){
        if(statusCode == 200 && headers.SERVER){
            let tmp: string = headers.SERVER as string;
            let uuid: string = headers.USN as string;
            let location: string = headers.LOCATION as string;
            uuid = uuid.replace('uuid:','');

            if(tmp.search(ApiSearch.DEVICES.MIO441R) > 0){
                this._httpClient.get(location).then( (data:any) => {
                    let str = data?.data;
                    xml2js.parseString(str, (err, res) => {
                        if(!err && res){
                            if(res?.root?.device){
                                let dev = res.root.device[0];
                                let name = dev.friendlyName[0];
                                let data = {address: rinfo.address, uuid, name, static: false};
                                this._clbck_MIO_found.forEach( (value) => {value.call(null, data);});
                            }
                        }
                    })
                });                
            }
        }
    }

    // --------------------------------------------------------------------------------------
    public on(key: string, callback: CallableFunction){
        if(key === ApiSearch.DEVICES.MIO441R)
            this._clbck_MIO_found.push(callback);
    }

    // --------------------------------------------------------------------------------------
    public searchDeviceByIp(ip: string){
        if(ip){
            this._httpClient.post("http://"+ip+"/query.json", {info:null}).then( (resp: any) => {
                if(resp?.data){
                    let info: MIO441R_InfoStruct = resp.data.info;
                    if(info.dType == ApiSearch.DEVICES.MIO441R){
                        let data: MIO441R_BaseStruct = {address: ip, uuid: info.uuid!, name: info.devName!, static: true};
                        this._clbck_MIO_found.forEach( (value) => {value.call(null, data);});
                    }
                }
            });
        }
    }

    // --------------------------------------------------------------------------------------
    public start(){
        this._ssdpClient.search('ssdp:all');
    }
}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
export abstract class ApiHttpClient {
    protected readonly instance: AxiosInstance;
    protected baseURL: string;
  
    public constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.instance = axios.create();
    
        this._initializeResponseInterceptor();
    }
  
    private _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(
            this._handleResponse,
            this._handleError,
        );
    };
  
    private _handleResponse = ({ data }: AxiosResponse) => data;
  
    protected _handleError = (error: any) => Promise.reject(error);

    public setIpAddress(ipAddress: string){
        this.baseURL = "http://"+ipAddress;
    }
}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
export class MIO_HttpApi extends ApiHttpClient {

    public constructor(ipAddress: string){
        super("http://"+ipAddress);
        this._initializeRequestInterceptor();
    }

    private _initializeRequestInterceptor = () => {
        this.instance.interceptors.request.use(
            this._handleRequest,
            this._handleError,
        );
    };
  
    private _handleRequest = (config: AxiosRequestConfig) => {
        config.baseURL = this.baseURL;
        // config.headers['Authorization'] = 'Bearer ...';
        return config;
    };
  
    public get(data: any): Promise<any>{
        return this.resolvePost(data);
    }
  
    public sendCommand(data: any, opt: any): Promise<any>{
        if(opt){
            return this.resolvePost({...opt, command: data});
        }else{
            return this.resolvePost({command: data});
        }
    }

    private resolvePost(data: any): Promise<any>{
        return new Promise((resolve, reject) => {
            this.instance.post('query.json', data, {timeout: 500}).then((response: any) => {
                if(response.loginRequired){
                    console.error("Login required");
                }
                resolve(response);
            }).catch((error) => {
                if(error.code == 'ECONNABORTED'){
                    reject(null);
                }else{
                    reject(error);
                }
            })
        });
    }
}

// --------------------------------------------------------------------------------------
