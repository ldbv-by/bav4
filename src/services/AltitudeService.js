import { loadBvvAltitude } from './provider/altitude.provider';

export class AltitudeService {

	constructor(altitudeProvider = loadBvvAltitude) {
		this._altitudeProvider = altitudeProvider;
		this._altitude = 0;
	} 

	/**
     * 
     * @param {Coordinate} coordinate3857 
     */
	async getAltitude(coordinate3857) {
		if (coordinate3857) {
			try {
				this._altitude = await this._altitudeProvider(coordinate3857);
				return this._altitude;
			}
			catch (e) {
				return Promise.reject('AltitudeService could not be initialized: ' + e.message);
			}
		}
		// return this._altitude;
	}
	// getAltitude(coordinate3857) {
	//     this._altitudeProvider(coordinate3857)
	//     	.then(data => {
	//     		if (data) {
	//     			return data.altitude;
	//     		}
	//     	}, reason => {
	//     		console.warn(reason);
	//     	});
	// } 

} 