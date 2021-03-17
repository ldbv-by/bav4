import { loadBvvAdministration } from './provider/administration.provider';
import { isCoordinate } from '../utils/checks';

export class AdministrationService {

	constructor(administrationProvider = loadBvvAdministration) {
		this._administrationProvider = administrationProvider;
	} 

	/**
     * 
     * @param {Coordinate} coordinate3857 
	 * @returns {Object} with community and district as string properties
     */
	async getAdministration(coordinate3857) {
		if (!isCoordinate(coordinate3857)) {
			throw new TypeError('Parameter \'coordinate3857\' must be a coordinate');
		}	
		try {
			const administration = await this._administrationProvider(coordinate3857);
			return administration;
		}
		catch (e) {
			throw new Error('Could not load administration from provider: ' + e.message);
		} 
	}
} 