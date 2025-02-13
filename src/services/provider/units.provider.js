/**
 * @module services/provider/units_provider
 */
import { $injector } from '../../injection';

const Kilometer_In_Meters = 1000;
const Squaredkilometer_In_Squaredmeters = 1000000;
const Locales_Fallback = 'en';

const getLocales = () => {
	const { ConfigService: configService } = $injector.inject('ConfigService');

	return [configService.getValue('DEFAULT_LANG'), Locales_Fallback];
};

/**
 * Appends the metric unit of distance to the specified number with bvv defined decimals
 * @function
 * @type {module:services/UnitsService~unitsProvider}
 * @param {number} distance the distance value
 * @returns {module:services/UnitsService~UnitsResult} the formatted value
 */
export const bvvDistanceUnitsProvider = (distance) => {
	const locales = getLocales();
	const asKilometer = (distanceValue) => {
		return {
			value: (Math.round((distanceValue / Kilometer_In_Meters) * 100) / 100).toLocaleString(locales, {
				minimumFractionDigits: 1,
				maximumFractionDigits: 1
			}),
			unit: 'km'
		};
	};
	const asMeter = (distanceValue) => {
		return {
			value:
				distance !== 0
					? (Math.round(distanceValue * 100) / 100).toLocaleString(locales, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
					: '0',
			unit: 'm'
		};
	};
	return distance > Kilometer_In_Meters - 1 ? asKilometer(distance) : asMeter(distance);
};

/**
 * Appends the angle unit to the specified number with bvv defined decimals
 * @function
 * @type {module:services/UnitsService~unitsProvider}
 * @param {number} angle the angle value
 * @returns {module:services/UnitsService~UnitsResult} the formatted value
 */
export const bvvAngleUnitsProvider = (angle) => {
	const locales = getLocales();

	return {
		value: angle !== 0 ? (Math.round(angle * 100) / 100).toLocaleString(locales, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0',
		unit: '°'
	};
};

/**
 * Appends the metric unit of area to the specified number with bvv defined decimals
 * @function
 * @type {module:services/UnitsService~unitsProvider}
 * @param {number} area the area value
 * @returns {module:services/UnitsService~UnitsResult} the formatted value
 */
export const bvvAreaUnitsProvider = (area) => {
	const locales = getLocales();
	const asSquaredKilometer = (areaValue) => {
		return {
			value: (Math.round((areaValue / Squaredkilometer_In_Squaredmeters) * 100) / 100).toLocaleString(locales, {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			}),
			unit: 'km²'
		};
	};
	const asSquaredMeter = (areaValue) => {
		return {
			value:
				areaValue > 1 ? (Math.round(areaValue * 100) / 100).toLocaleString(locales, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '1',
			unit: 'm²'
		};
	};
	if (area < 0.5) {
		return { value: '0', unit: 'm²' };
	}
	return area >= Squaredkilometer_In_Squaredmeters ? asSquaredKilometer(area) : asSquaredMeter(area);
};

/**
 * Appends the metric unit of distance to the specified number
 * @function
 * @type {module:services/UnitsService~unitsProvider}
 * @param {number} distance the distance value
 * @param {number} decimals the number of digits after the decimal point
 * @returns {module:services/UnitsService~UnitsResult} the formatted value
 */
export const distanceUnitsProvider = (distance, decimals) => {
	let formatted;
	if (distance > Kilometer_In_Meters - 1) {
		if (decimals) {
			formatted = { value: (Math.round((distance / Kilometer_In_Meters) * 100) / 100).toFixed(decimals), unit: 'km' };
		} else {
			formatted = { value: `${Math.round((distance / Kilometer_In_Meters) * 100) / 100}`, unit: 'km' };
		}
	} else {
		if (decimals) {
			formatted = { value: distance !== 0 ? (Math.round(distance * 100) / 100).toFixed(decimals) : '0', unit: 'm' };
		} else {
			formatted = { value: distance !== 0 ? `${Math.round(distance * 100) / 100}` : '0', unit: 'm' };
		}
	}
	return formatted;
};

/**
 * Appends the metric unit of area to the specified number
 * @function
 * @type {module:services/UnitsService~unitsProvider}
 * @param {number} area the area value
 * @param {number} decimals the number of digits after the decimal point
 * @returns {module:services/UnitsService~UnitsResult} the formatted value
 */
export const areaUnitsProvider = (area, decimals) => {
	let formatted;
	if (area >= Squaredkilometer_In_Squaredmeters) {
		if (decimals) {
			formatted = { value: (Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100).toFixed(decimals), unit: 'km²' };
		} else {
			formatted = { value: `${Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100}`, unit: 'km²' };
		}
	} else {
		if (decimals) {
			formatted = { value: (Math.round(area * 100) / 100).toFixed(decimals), unit: 'm²' };
		} else {
			formatted = { value: `${Math.round(area * 100) / 100}`, unit: 'm²' };
		}
	}
	return formatted;
};
