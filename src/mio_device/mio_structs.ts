// --------------------------------------------------------------------------------------
export enum MIO441R_IO_Callback{
    INIT = 'init',
    UPDATE = 'update',
    HOMEKIT = 'homekit'
}

// --------------------------------------------------------------------------------------
export enum INPUT_TYPE{
    Switch_NO = 0,
    Switch_NC,
    PIR,
    HAL,
    SENSOR,
    MAX
}

// --------------------------------------------------------------------------------------
export enum INPUT_ACTION
{
    none = 0,
    turnOFF,
    turnON,
    click,
    doubleClick,
    tripleClick,
    hold,
    specialFunction_1,
    sensorValue,
    MAX
};

// --------------------------------------------------------------------------------------
export enum INPUT_MODE{
    onChange = 0,
    TwoStateCont,
    TwoStateChange,
    pressSwitch,
    releaseSwitch,
    releaseSwitchWithFeatures,
}

// --------------------------------------------------------------------------------------
export enum OUTPUT_TYPE{
    OnOff = 0,
    OnOff_withRamp,
    PWM,
    PulseOutput,
    MAX
}

// --------------------------------------------------------------------------------------
export enum OUTPUT_POWERON{
    OFF = 0,
    ON,
    LastState,
    MAX
}

export enum OUTPUT_CURVE{
    linear = 0,
    curve_1,
    CURVE_2,
}

// --------------------------------------------------------------------------------------
export enum SENSOR_TYPE{
    frequency = 0,
    period,
    dutyTime,
    dutyPercent,
    AIMEE_light,
    AIMEE_temperature,
    AIMEE_humidity,
    AIMEE_voltage,
    AIMEE_current,
}

// --------------------------------------------------------------------------------------
export enum SENSOR_SUBTYPE{
    generic = 0,
    percent,
    freq,
    time_s,
    time_ms,
    time_us,
    light_lux,
    temperature_C,
    temperature_F,
    humidity,
    pressure,
    level_mm,
    level_cm,
    level_m,
    current_A,
    voltage_V,
    watt_W,
}

// --------------------------------------------------------------------------------------
export interface RGB_Struct{
    R: number;
    G: number;
    B: number;
}

// --------------------------------------------------------------------------------------
export interface HSV_Struct{
    H: number;
    S: number;
    V: number;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_BaseStruct{
    name: string;
    uuid: string;
    address: string;
    static?: boolean;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_Response{
    info?: MIO441R_BaseStruct;
    hk?: MIO441R_HomeKitStruct;
    input?: MIO441R_InputStruct[];
    output?: MIO441R_OutputStruct[];
    dayLU?: MIO441R_DayLuStruct[];
}

// --------------------------------------------------------------------------------------
export interface MIO441R_InfoStruct{
    dType?: string,
    devName?: string,
    fw?: string,
    hw?: string,
    fhs?: number,
    fhm?: number,
    idf?: string,
    uuid?: string,
    rtt?: string,
    rstcnt?: number,
    btsl?: number,
    btst?: number,
    mqtt?: string,
    leds?: number[],
    ut?: number,
    utd?: number,
    uty?: number,
    tz?: number,
    dt?: string,
    sdt?: string
}

// --------------------------------------------------------------------------------------
export interface MIO441R_HomeKitStruct{
    power: boolean;
    rgb: boolean;
    in: boolean[];
    out: boolean[];
    sens: boolean[];
    vr: boolean[];
    sc: boolean[];
}

// --------------------------------------------------------------------------------------
export interface MIO441R_OutputStruct{
    name?: string;
    st: boolean;
    delay?: number;
    type: OUTPUT_TYPE;
    startup?: OUTPUT_POWERON;
    speedOn?: number;
    speedOff?: number;
    curve?: OUTPUT_CURVE;
    pwrMax: number;
    pwrMin: number;
    minAdjPwr?: number;
    pwrDivPerc1?: number;
    pwrDelay?: number;
    pulseTmr?: number;
    autoOff?: number;
    autoOffAct?: number;
    value: number;
    reqValue: number;
    dash?: boolean;
    hk?: boolean;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_OutputMqttStruct{
    state: string;
    brightness?: number;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_DayLuStruct{
    name?: string;
    enable: boolean;
    actDayTime?: number;
    output: number;
    pir?: boolean;
    pirIn?: number;
    pirDly?: number;
    btn?: boolean;
    btnIn?: number;
    btnSwType?: boolean;
    btnOff2Clk?: boolean;
    btnOn3Clk?: boolean;
    fade?: boolean;
    fadeSave?: boolean;
    dlyOff?: number;
    dlyOn?: number;
    usrpwr: boolean;
    pwrBtn?: number[];
    pwrPir?: number[];
    pwrOff?: number[];
    lAct?: number;  
    dash?: boolean;
    hk?: boolean;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_InputSensorStruct{
    duty?: number;
    period?: number;
    revDuty?: boolean;
    dutyOn?: number;
    dutyOff?: number;
    directMode?: boolean;
    power?: number;
    deadDuty?: number;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_InputStruct{
    name?: string;
    st: boolean;
    stt?: string;
    type: INPUT_TYPE;
    mode?: INPUT_MODE;
    filter?: number;
    dOffAct?: number;
    dOff?: number;
    dClick?: number;
    sens?: number;
    sensTV?: boolean;
    lact?: INPUT_ACTION;
    lactt?: string;
    sensor?: MIO441R_InputSensorStruct;
    dash?: boolean;
    hk?: boolean;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_InputMqttStruct{
    state: string;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_SensorStruct{
    name?: string;
    dash?: boolean;
    hk?: boolean;
    value: number;
    id?: number;
    input?: number;
    inputValue?: number;
    type: SENSOR_TYPE;
    stype?: SENSOR_SUBTYPE;
    gain?: number;
    offset?: number;
    min?: number;
    max?: number;
    unit?: string;
    valueOn?: number;
    valueOff?: number;
    state?: number;
    constK?: number;
    constQ?: number;
    power?: number;
    directMode?: boolean;
    deadValue?: number;
    output?: number;
}

// --------------------------------------------------------------------------------------
export interface MIO441R_OTA{
    state: string;
    st: number;
    progress: number;
    updateTime: number;
    autoUpdate: true;
    restart: false;
    cver: string;
    nver: string;
    upToDate: true;
    error: number;
}

// --------------------------------------------------------------------------------------
