# Homebridge Plugin for MULTICORE devices

This is a Homebridge plugin and can be used with multicore devices (MIO441R and sensors). This plugin is mainly for local network use.

**Allow to control and monitoring inputs, outputs, power consuption and connected sensors to MULTICORE devices as MIO441R.**

From **MIO441R** device firmware version **2021.x.x** is each device peripheral enable by switch in website setting in device at url `/general.html#dashboard`

Device as LightBulb, Motion sensors, Switch, Temperature sensors and next are only mirrored to homebridge of internal device setting. So when you want change any setting or change input or output type of signal you have to change device setting first. After changes devices in homebridge will be automaticly updated. Default name of created hb devices is the mirrored from device setting of inputs and outputs.

## Install

Homebridge is published through NPM and should be installed "globally" by typing:

```
npm install -g homebridge
npm install -g homebridge-multicore
```
If you don't have Homebridge installed, [check the repository](https://github.com/homebridge/homebridge) for detailed setup instructions.

## Configuration

Configuration
The plugin is configured as part of your Homebridge [`config.json`](./config.json) file.

```
{
    "api": {
        "removeAtStartup": false,
        "disableSSDP": false,
        "automaticAddBySearch": true,
        "debug": 0,
        "swInputsDis": false,
        "pirInputsDis": false,
        "pirEmitInputsDis": true,
        "outputDis": false,
        "outRgbDis": false,
        "outsWhenRgbDis": true
    },
    "mqtt": {
        "enable": true,
        "url": "192.168.0.100",
        "username": "",
        "password": "",
        "port": 1883,
        "config_device": false
    },
    "deviceList": [
        {
            "name": "Example device 1",
            "ipAddress": "192.168.0.101"
        }
    ],
    "platform": "MulticoreHomebridgePlugin"
}
```

* `api` - main config parameters of plugin api.
  * `removeAtStartup` - remove all registered devices by plugin in homebridge
  * `disableSSDP` - disable search utility for find devices (normal is enabled) - this feature make also update ip addressed of devices when it is changed. Work only for devices in local network (use UDP ssdp protocol with broadcast)
  * `automaticAddBySearch` - allow automaticly add all founded device
  * `debug` - mainly for developing or resolve of any problems (level value 0-2)
  * `swInputsDis` - globally disable adding of device's inputs
  * `pirInputsDis` - globally disable adding inputs in motion detector mode
  * `pirEmitInputsDis` - globally disable create emit device (switch) for motion sensors
  * `outputDis` - globally disable adding of device's outputs
  * `outRgbDis` - glabally disable adding of rgb devices
  * `outsWhenRgbDis` - globally disable each channel of rgb separatele control

* `mqtt` - this is object for setting of mqtt connection with devices
  * `enable` - enable mqtt connection to mqtt broker
  * `ulr` - url address of broker IP `127.0.0.1` or address `mqtt.broker.cz`
  * `port` - port of broker service
  * `username` - optional broker login username
  * `password` - optional broker login password
  * `config_device` - enable to automatic configuration of mqtt connection of devices to broker (rewrite actual setting in all devices)

* `deviceList` - list of static devices
  * `name` - name of device (only for better overview)
  * `ipAddress` - static IP address of device

**All parameters are configurable over [UI Config plugin](https://www.npmjs.com/package/homebridge-config-ui-x)**

## Supported homebridge services

* LightBulb (On/Off or with Brightness)
* RGB LightBulb
* Switch
* Motion sensor (full reaction only over mqtt)

