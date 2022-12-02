import { AltitudeProfileAttributeType } from './AltitudeProfileAttributeType';

export class SurfaceType extends AltitudeProfileAttributeType {
	constructor(name, lightColor, darkColor) {
		super('surface', name, lightColor, darkColor);
	}
}
