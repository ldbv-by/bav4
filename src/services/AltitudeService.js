import { loadBvvAltitude } from './provider/altitude.provider';

export class AltitudeService {

	constructor(altitudeProvider = loadBvvAltitude) {
		this._altitudeProvider = altitudeProvider;
		this._altitude = null;
	} 

	/**
     * 
     * @param {Coordinate} coordinate3857 
	 * @returns {Number} altitude
     */
	async getAltitude(coordinate3857) {
		if (coordinate3857) {
			try {
				this._altitude = await this._altitudeProvider(coordinate3857);
				return this._altitude;
			}
			catch (e) {
				return Promise.reject('AltitudeService could not be loaded: ' + e.message);
			}
		}
		else {
			throw new Error('No coordinates committed: ' + coordinate3857);
		} 
	}
} 