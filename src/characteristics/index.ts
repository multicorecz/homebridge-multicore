import type {Characteristic as CharacteristicClass, WithUUID,} from 'homebridge';
import DefaultCharacteristicImport from './default-characteristic';
import WattsImport from './watts';

// export default function characteristic(Characteristic: typeof CharacteristicClass): Record<
//   'Watts',
//   WithUUID<new () => CharacteristicClass>
// > {
//   const DefaultCharacteristic = DefaultCharacteristicImport(Characteristic);
//   return {
//     Watts: WattsImport(DefaultCharacteristic),
//   };
// }

// export function WattCharacteristic(char){return WattsImport(DefaultCharacteristicImport(char));}