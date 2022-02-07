import { $injector } from '../injection';

const Kilometer_In_Meters = 1000;
const Squaredkilometer_In_Squaredmeters = 1000000;
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
			if (decimals) {
				formatted = (Math.round((distance / Kilometer_In_Meters) * 100) / 100).toFixed(decimals) + ' ' + 'km';
			}
			else {
				formatted = (Math.round((distance / Kilometer_In_Meters) * 100) / 100) + ' ' + 'km';
			}
		}
		else {
			if (decimals) {
				formatted = distance !== 0 ? (Math.round(distance * 100) / 100).toFixed(decimals) + ' ' + 'm' : '0 m';
			}
			else {
				formatted = distance !== 0 ? (Math.round(distance * 100) / 100) + ' ' + 'm' : '0 m';
			}
		}
		return formatted;
	},
	/**
    * Appends the metric unit of area to the specified number
    * @param {number} area the area value
	* @param {number} decimals the number of digits after the decimal point
    * @returns {String} the formatted value
    */
	area(area, decimals) {
		let formatted;
		if (area >= Squaredkilometer_In_Squaredmeters) {
			if (decimals) {
				formatted = (Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100).toFixed(decimals) + ' ' + 'km&sup2;';
			}
			else {
				formatted = (Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100) + ' ' + 'km&sup2;';
			}
		}
		else {
			if (decimals) {
				formatted = (Math.round(area * 100) / 100).toFixed(decimals) + ' ' + 'm&sup2;';
			}
			else {
				formatted = (Math.round(area * 100) / 100) + ' ' + 'm&sup2;';
			}
		}
		return formatted;
	}
};

const Provider_BvvMetric = {

	/**
    * Appends the metric unit of distance to the specified number
    * @param {number} distance the distance value
	* @param {number} decimals the number of digits after the decimal point
    * @returns {String} the formatted value
    */
	// eslint-disable-next-line no-unused-vars
	distance(distance, decimals) {
		const asKilometer = (distanceValue) => {
			return (Math.round((distanceValue / Kilometer_In_Meters) * 100) / 100).toFixed(1) + ' ' + 'km';
		};
		const asMeter = (distanceValue) => {
			return distance !== 0 ? (Math.round(distanceValue * 100) / 100).toFixed(1) + ' ' + 'm' : '0 m';
		};
		return distance > Kilometer_In_Meters - 1 ? asKilometer(distance) : asMeter(distance);
	},
	/**
    * Appends the metric unit of area to the specified number
    * @param {number} area the area value
	* @param {number} decimals the number of digits after the decimal point
    * @returns {String} the formatted value
    */
	// eslint-disable-next-line no-unused-vars
	area(area, decimals) {
		const asSquaredKilometer = (areaValue) => {
			return (Math.round((areaValue / Squaredkilometer_In_Squaredmeters) * 100) / 100).toFixed(3) + ' ' + 'km&sup2;';
		};
		const asSquaredMeter = (areaValue) => {
			return areaValue > 1 ? (Math.round(areaValue * 100) / 100).toFixed(0) + ' ' + 'm&sup2;' : areaValue > 0.5 ? '1 m&sup2;' : '0.5 m&sup2;';
		};
		return area >= Squaredkilometer_In_Squaredmeters ? asSquaredKilometer(area) : asSquaredMeter(area);
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
			case 'bvv_metric':
				return Provider_BvvMetric.distance(distance, decimals);
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
			case 'bvv_metric':
				return Provider_BvvMetric.area(area, decimals);
			case 'metric':
			default:
				return Provider_Metric.area(area, decimals);
		}
	}

}
