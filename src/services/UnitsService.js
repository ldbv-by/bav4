import { bvvAreaUnitsProvider, bvvDistanceUnitsProvider } from './provider/units.provider';

/**
 *  Service for formatting numbers with their respective unit of measurement
 * @class
 * @author thiloSchlemmer
 */
export class UnitsService {

	constructor(distanceUnitsProvider = bvvDistanceUnitsProvider, areaUnitsProvider = bvvAreaUnitsProvider) {
		this._distanceUnitsProvider = distanceUnitsProvider;
		this._areaUnitsProvider = areaUnitsProvider;
	}

	/**
    * Appends the appropriate unit of distance to the specified number.
    * The current unit of distance is set per config.
    * @param {number} distance the distance value
	* @param {number} decimals  Optional, the number of digits after the decimal point. Default is 2
    * @returns {String} the formatted value
    */
	formatDistance(distance, decimals = 2) {
		return this._distanceUnitsProvider(distance, decimals);
	}

	/**
    * Appends the appropriate areal unit to the specified number
    * @param {number} area
	* @param {number} decimals Optional, the number of digits after the decimal point. Default is 2
    * @returns {String} the formatted value
    */
	formatArea(area, decimals = 2) {
		return this._areaUnitsProvider(area, decimals);
	}

}
