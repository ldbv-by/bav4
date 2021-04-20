import { $injector } from '../injection';

const PROVIDER_METRIC = {
	/**
    * Appends the metric unit of distance to the specified number
    * @param {number} distance 
    * @returns {String} the formatted value 
    */
	distance:(distance) => {
		let formatted;
		if (length > 999) {
			formatted = Math.round((distance / 1000) * 100) / 100 + ' ' + 'km';
		}
		else {
			formatted = distance !== 0 ? Math.round(distance * 100) / 100 + ' ' + 'm' : '0 m';
		}
		return formatted;
	},
	/**
    * Appends the metric unit of area to the specified number
    * @param {number} area 
    * @returns {String} the formatted value 
    */
	area:(area) => {
		let formatted;
		if (area >= 1000000) {
			formatted = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km&sup2;';
		}
		else if (area >= 10000) {
			formatted = Math.round((area / 10000) * 100) / 100 + ' ' + 'ha';
		}
		else {
			formatted = Math.round(area * 100) / 100 + ' ' + 'm&sup2;';
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
    * @param {number} distance 
    * @returns {String} the formatted value 
    */
	formatDistance(distance) {
		switch (this._systemOfUnits) {
			case 'metric':                
			default:
				return PROVIDER_METRIC.distance(distance);
		}
	}

	/**
    * Appends the appropriate areal unit to the specified number
    * @param {number} area 
    * @returns {String} the formatted value 
    */
	formatArea(area) {
		switch (this._systemOfUnits) {
			case 'metric':                
			default:
				return PROVIDER_METRIC.area(area);
		}
	}
	
}
