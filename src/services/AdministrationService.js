import { loadBvvAdministration } from './provider/administration.provider';

export class AdministrationService {

	constructor(administrationProvider = loadBvvAdministration) {
		this._administrationProvider = administrationProvider;
	} 

	/**
     * 
     * @param {Coordinate} coordinate3857 
	 * @returns {Array} array with community and district loaded from backend
     */
	async getAdministration(coordinate3857) {
	
		try {
			const administration = await this._administrationProvider(coordinate3857);
			return administration;
		}
		catch (e) {
			throw new Error('Could not load administration from provider: ' + e.message);
		} 
	}
} 