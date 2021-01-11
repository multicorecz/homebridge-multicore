// --------------------------------------------------------------------------------------
export interface ApiConfigInput {
    removeAtStartup?: boolean;
    disableSSDP?: boolean;
    automaticAddBySearch?: boolean;
    swInputsDis?: boolean;
    pirInputsDis?: boolean;
    pirEmitInputsDis?: boolean;
    outputDis?: boolean;
    outRgbDis?: boolean;
    outsWhenRgbDis?: boolean;
    debug?: number;
}

// --------------------------------------------------------------------------------------
export interface DeviceConfigInput{
    name?: string;
    ipAddress?: string;
}

// --------------------------------------------------------------------------------------
export interface MqttConfigInput{
    enable?: boolean;
    url?: string;
    port?: number;
    config_device?: boolean;
}

// --------------------------------------------------------------------------------------
export interface ConfigInput {
    api?: ApiConfigInput;
    mqtt?: MqttConfigInput;
    deviceList?: DeviceConfigInput[];
}

// --------------------------------------------------------------------------------------
export function parseConfig(config: Record<string, unknown>): ConfigInput{
  return config as ConfigInput;
}

// --------------------------------------------------------------------------------------
