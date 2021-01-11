// --------------------------------------------------------------------------------------
import { MIO441R_AbstractIO } from './mio_device_abstractio';
import { MIO441R_Output } from './mio_device_output';
import { HSV_Struct, RGB_Struct } from './mio_structs'

// --------------------------------------------------------------------------------------
export class MIO441R_RGB extends MIO441R_AbstractIO{
    private outputs: MIO441R_Output[] = [];
    private _hsv: HSV_Struct = {H: 0, S: 0, V: 0};
    private _rgb: RGB_Struct = {R: 0, G: 0, B: 0};
    private _V_NonZero: number = 100;

    // --------------------------------------------------------------------------------------
    public state(): boolean {return this._hsv.V?true:false;}
    public rgb(): RGB_Struct {return this._rgb;}
    public hue(): number {return this._hsv.H;}
    public saturation(): number {return this._hsv.S;}
    public brightness(): number {return this._hsv.V;}
    public setHue(value: number) {this._hsv.H = value;}
    public setSaturation(value: number) {this._hsv.S = value;}
    public setBrightness(value: number) {this._hsv.V = value;}

    // --------------------------------------------------------------------------------------
    constructor(dev: any, id: number){
        super(dev, id, "RGB");
        this.outputs.push(dev.output(0));
        this.outputs.push(dev.output(1));
        this.outputs.push(dev.output(2));
    }

    // --------------------------------------------------------------------------------------
    public handleUpdateData(){
        this._rgb.R = this.outputs[0].data().reqValue;
        this._rgb.G = this.outputs[1].data().reqValue;
        this._rgb.B = this.outputs[2].data().reqValue;
        this._hsv = this.convert_RGB_to_HSV(this._rgb);
        this.afterUpdate(undefined);
    }

    // --------------------------------------------------------------------------------------
    public setOn(value: number): Promise<any>
    {
        if(value > 0)
            this._hsv.V = this._V_NonZero;
        else
            this._hsv.V = 0;
        return this.updateOutputs();
    }

    // --------------------------------------------------------------------------------------
    public updateOutputs(): Promise<any> {
        this._rgb = this.convert_HSV_to_RGB(this._hsv);
        if(this._hsv.V > 0)
            this._V_NonZero = this._hsv.V;

        return this.handleUpdateOutputs();
    }

    // --------------------------------------------------------------------------------------
    private handleUpdateOutputs(): Promise<any>{
        return this._device.handleCommand({output:{r: this._rgb.R, g: this._rgb.G, b: this._rgb.B}}, {output: null});
    }

    // --------------------------------------------------------------------------------------
    public convert_HSV_to_RGB(hsv: HSV_Struct): RGB_Struct{
        let rgb: RGB_Struct = {R: 0, G: 0, B: 0};

        let C = (hsv.V / 100.0) * (hsv.S / 100.0);
        let X = C * (1 - Math.abs((hsv.H / 60) % 2 - 1));
        let m = (hsv.V / 100.0) - C;

        let R = 0;
        let G = 0;
        let B = 0;

        if(hsv.H < 60)          { R = C; G = X; B = 0;}
        else if(hsv.H < 120)    { R = X; G = C; B = 0;}
        else if(hsv.H < 180)    { R = 0; G = C; B = X;}
        else if(hsv.H < 240)    { R = 0; G = X; B = C;}
        else if(hsv.H < 300)    { R = X; G = 0; B = C;}
        else if(hsv.H < 360)    { R = C; G = 0; B = X;}

        rgb.R = Math.round((R+m)*100);
        rgb.G = Math.round((G+m)*100);
        rgb.B = Math.round((B+m)*100);
        
        return rgb;
    }

    // --------------------------------------------------------------------------------------
    public convert_RGB_to_HSV(rgb: RGB_Struct): HSV_Struct{
        let hsv: HSV_Struct = {H: 0, S: 0, V: 0};

        let R = rgb.R / 100;
        let G = rgb.G / 100;
        let B = rgb.B / 100;

        let Cmax = Math.max(R, G, B);
        let Cmin = Math.min(R, G, B);

        let d = Cmax - Cmin;

        let H = 0;
        let S = 0;
        let V = 0;

        if(d === 0)             { H = 0; }
        else if(Cmax === R)     { H = 60 * ((6+((G - B) / d))%6); }
        else if(Cmax === G)     { H = 60 * (((B - R) / d) + 2); }
        else if(Cmax === B)     { H = 60 * (((R - G) / d) + 4); }
        
        if(Cmax == 0)           { S = 0; }
        else                    { S = d / Cmax; }

        V = Cmax;

        hsv.H = Math.round(H);
        hsv.S = Math.round(S*100);
        hsv.V = Math.round(V*100);

        return hsv;
    }

    // --------------------------------------------------------------------------------------
}

// --------------------------------------------------------------------------------------
