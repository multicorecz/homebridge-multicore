import { Characteristic, CharacteristicProps, Formats, Perms } from 'homebridge';
  
export default function defaultCharacteristic( character: typeof Characteristic ): typeof Characteristic {
  return class DefaultCharacteristic extends character {
    constructor(
      displayName: string,
      UUID: string,
      props?: CharacteristicProps
    ) {
      super(displayName, UUID);
      this.setProps({
        format: Formats.FLOAT,
        minValue: 0,
        maxValue: 65535,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY],
        ...props,
      });
      this.value = this.getDefaultValue();
    }
  };
}
  