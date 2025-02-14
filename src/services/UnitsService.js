/**
 * @module services/UnitsService
 */
import { bvvAngleUnitsProvider, bvvAreaUnitsProvider, bvvDistanceUnitsProvider } from './provider/units.provider';

/**
 * An object containing formatted and localized data to assemble
 * unit-related representations
 * @typedef {Object} UnitsResult
 * @property {number} value The value
 * @property {string} localizedValue The localized form of the value
 * @property {string} unit The representation of the unit of measurement for the corresponding localized value
 */

/**
 * A function that takes a unit related value and returns a @see UnitsResult object.
 * The function formats and localize the given value to meet the specification
 * of the selected unit of measurement and the current locale.
 * @param {number}  value
 * @param {number}  [decimals]
 * @typedef {Function} unitsProvider
 * @returns {module:services/UnitsService~UnitsResult} the formatted result
 */

/**
 *  Service for formatting numbers with their respective unit of measurement
 * @class
 * @author thiloSchlemmer
 */
export class UnitsService {
	/**
	 *
	 * @param {module:services/UnitsService~unitsProvider} [distanceUnitsProvider=bvvDistanceUnitsProvider]
	 * @param {module:services/UnitsService~unitsProvider} [areaUnitsProvider=bvvAreaUnitsProvider]
	 * @param {module:services/UnitsService~unitsProvider} [angleUnitsProvider=bvvAngleUnitsProvider]
	 */
	constructor(
		distanceUnitsProvider = bvvDistanceUnitsProvider,
		areaUnitsProvider = bvvAreaUnitsProvider,
		angleUnitsProvider = bvvAngleUnitsProvider
	) {
		this._distanceUnitsProvider = distanceUnitsProvider;
		this._areaUnitsProvider = areaUnitsProvider;
		this._angleUnitsProvider = angleUnitsProvider;
	}

	/**
	 * Appends the appropriate unit of distance to the specified number.
	 * The current unit of distance is set per config.
	 * @param {number} distance the distance value
	 * @param {number} decimals  Optional, the number of digits after the decimal point. Default is 2
	 * @returns {module:services/UnitsService~UnitsResult} the formatted value
	 */
	// eslint-disable-next-line no-unused-vars
	formatDistance(distance, decimals = 2) {
		return this._distanceUnitsProvider(distance ?? 0);
	}

	/**
	 * Appends the appropriate areal unit to the specified number
	 * @param {number} area
	 * @param {number} decimals Optional, the number of digits after the decimal point. Default is 2
	 * @returns {module:services/UnitsService~UnitsResult} the formatted value
	 */
	// eslint-disable-next-line no-unused-vars
	formatArea(area, decimals = 2) {
		return this._areaUnitsProvider(area ?? 0);
	}

	/**
	 * Appends the appropriate angle unit to the specified number
	 * @param {number} angle
	 * @param {number} decimals Optional, the number of digits after the decimal point. Default is 2
	 * @returns {module:services/UnitsService~UnitsResult} the formatted value
	 */
	// eslint-disable-next-line no-unused-vars
	formatAngle(angle, decimals = 2) {
		return this._angleUnitsProvider(angle ?? 0);
	}
}
