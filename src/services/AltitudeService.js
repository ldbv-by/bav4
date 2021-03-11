import { loadBvvAltitude } from './provider/altitude.provider';

export class AltitudeService {

	constructor(altitudeProvider = loadBvvAltitude) {
		this._altitudeProvider = altitudeProvider;
	} 

	/**
     * 
     * @param {Coordinate} coordinate3857 
	 * @returns {Number} altitude
     */
	async getAltitude(coordinate3857) {
		try {
			const altitude = await this._altitudeProvider(coordinate3857);
			return altitude;
		}
		catch (e) {
			throw new Error('Could not load altitude from provider: ' + e.message);
		} 
	}
} 