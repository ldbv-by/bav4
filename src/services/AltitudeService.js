import { loadBvvAltitude } from './provider/altitude.provider';

export class AltitudeService {

	constructor(altitudeProvider = loadBvvAltitude) {
		this._altitudeProvider = altitudeProvider;
	} 

	getAltitudeProvider() {
		return this._altitudeProvider;
	} 

} 