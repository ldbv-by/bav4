import { $injector } from '../injection';

const Kilometer_In_Meters = 1000;
const Squaredkilometer_In_Squaredmeters = 1000000;
const Hektar_In_Squaredmeters = 10000;
const Provider_Metric = {
	/**
    * Appends the metric unit of distance to the specified number
    * @param {number} distance 
    * @returns {String} the formatted value 
    */
	distance(distance) {
		let formatted;
		if (distance > Kilometer_In_Meters - 1) {
			formatted = Math.round((distance / Kilometer_In_Meters) * 100) / 100 + ' ' + 'km';
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
	area(area) {
		let formatted;
		if (area >= Squaredkilometer_In_Squaredmeters) {
			formatted = Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100 + ' ' + 'km&sup2;';
		}
		else if (area >= Hektar_In_Squaredmeters) {
			formatted = Math.round((area / Hektar_In_Squaredmeters) * 100) / 100 + ' ' + 'ha';
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
				return Provider_Metric.distance(distance);
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
				return Provider_Metric.area(area);
		}
	}
	
}
