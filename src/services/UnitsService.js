import { $injector } from '../injection';

const Kilometer_In_Meters = 1000;
const Squaredkilometer_In_Squaredmeters = 1000000;
const Hektar_In_Squaredmeters = 10000;
const Provider_Metric = {
	/**
    * Appends the metric unit of distance to the specified number
    * @param {number} distance the distance value
	* @param {number} decimals the number of digits after the decimal point
    * @returns {String} the formatted value 
    */
	distance(distance, decimals) {
		let formatted;
		if (distance > Kilometer_In_Meters - 1) {
			formatted = (Math.round((distance / Kilometer_In_Meters) * 100) / 100).toFixed(decimals) + ' ' + 'km';
		}
		else {
			formatted = distance !== 0 ? (Math.round(distance * 100) / 100).toFixed(decimals) + ' ' + 'm' : '0 m';
		}
		return formatted;
	},
	/**
    * Appends the metric unit of area to the specified number
    * @param {number} area the area value
	* @param {number} decimals the number of digits after the decimal point
    * @returns {String} the formatted value 
    */
	area(area, decimals ) {
		let formatted;
		if (area >= Squaredkilometer_In_Squaredmeters) {
			formatted = (Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100).toFixed(decimals) + ' ' + 'km&sup2;';
		}
		else if (area >= Hektar_In_Squaredmeters) {
			formatted = (Math.round((area / Hektar_In_Squaredmeters) * 100) / 100).toFixed(decimals) + ' ' + 'ha';
		}
		else {
			formatted = (Math.round(area * 100) / 100).toFixed(2) + ' ' + 'm&sup2;';
		}
		return formatted;
	}
};

/**
 *  Service for formatting numbers with their respective unit of measurement
 * @class
 * @author thiloSchlemmer
 */
export class UnitsService {

	constructor() {
		const { ConfigService: configService } = $injector.inject('ConfigService');
		this._systemOfUnits = configService.getValue('DEFAULT_UNIT_SYTEM', 'metric');
	}

	/**
    * Appends the appropriate unit of distance to the specified number.
    * The current unit of distance is set per config.
    * @param {number} distance the distance value
	* @param {number} decimals  Optional, the number of digits after the decimal point. Default is 2
    * @returns {String} the formatted value 
    */
	formatDistance(distance, decimals = 2) {
		switch (this._systemOfUnits) {
			case 'metric':                
			default:
				return Provider_Metric.distance(distance, decimals);
		}
	}

	/**
    * Appends the appropriate areal unit to the specified number
    * @param {number} area 
	* @param {number} decimals Optional, the number of digits after the decimal point. Default is 2
    * @returns {String} the formatted value 
    */
	formatArea(area, decimals = 2) {
		switch (this._systemOfUnits) {
			case 'metric':                
			default:
				return Provider_Metric.area(area, decimals);
		}
	}
	
}
