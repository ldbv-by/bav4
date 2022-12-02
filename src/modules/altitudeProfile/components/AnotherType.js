import { AltitudeProfileAttributeType } from './AltitudeProfileAttributeType';

export class AnotherType extends AltitudeProfileAttributeType {
  constructor(name, lightColor, darkColor) {
    super('anotherType', name, lightColor, darkColor);
  }
}
