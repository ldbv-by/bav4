/**
 * @module services/provider/units_provider
 */
import { $injector } from '../../injection';

const Fraction_Digits_For_Kilometer = 2;
const Fraction_Digits_For_Meter = 1;
const Fraction_Digits_For_Angle = 1;
const Kilometer_In_Meters = 1000;
const Squaredkilometer_In_Squaredmeters = 1000000;
const Locales_Fallback = 'en';

const getLocales = () => {
	const { ConfigService: configService } = $injector.inject('ConfigService');

	return [configService.getValue('DEFAULT_LANG'), Locales_Fallback];
};

const getNumberFormatOptions = (fractionDigits) => {
	return {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	};
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

	const asKilometer = (rawValue) => {
		const numberFormatOptions = getNumberFormatOptions(Fraction_Digits_For_Kilometer);
		const formatted = Math.round((rawValue / Kilometer_In_Meters) * 100) / 100;
		return {
			value: formatted,
			localizedValue: formatted.toLocaleString(locales, numberFormatOptions),
			unit: 'km'
		};
	};
	const asMeter = (distanceValue) => {
		const numberFormatOptions = getNumberFormatOptions(Fraction_Digits_For_Meter);
		const formatted = distance !== 0 ? Math.round(distanceValue * 100) / 100 : 0;
		return {
			value: formatted,
			localizedValue: distance !== 0 ? formatted.toLocaleString(locales, numberFormatOptions) : '0',
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
	const formatted = angle !== 0 ? Math.round(angle * 10) / 10 : 0;
	return {
		value: formatted,
		localizedValue: angle !== 0 ? formatted.toLocaleString(locales, getNumberFormatOptions(Fraction_Digits_For_Angle)) : '0',
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
	const fractionDigitsSquaredKilometer = 3;
	const fractionDigitsSquaredMeter = 0;
	const locales = getLocales();

	const asSquaredKilometer = (areaValue) => {
		const formatted = Math.round((areaValue / Squaredkilometer_In_Squaredmeters) * 100) / 100;
		return {
			value: formatted,
			localizedValue: formatted.toLocaleString(locales, getNumberFormatOptions(fractionDigitsSquaredKilometer)),
			unit: 'km²'
		};
	};
	const asSquaredMeter = (areaValue) => {
		const formatted = areaValue > 1 ? Math.round(areaValue * 100) / 100 : 1;
		return {
			value: formatted,
			localizedValue: formatted.toLocaleString(locales, getNumberFormatOptions(fractionDigitsSquaredMeter)),
			unit: 'm²'
		};
	};
	if (area < 0.5) {
		return { value: 0, localizedValue: '0', unit: 'm²' };
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
	if (!distance) {
		return { value: 0, localizedValue: '0', unit: 'm' };
	}
	if (distance > Kilometer_In_Meters - 1) {
		const formatted = Math.round((distance / Kilometer_In_Meters) * 100) / 100;
		return { value: formatted, localizedValue: decimals ? formatted.toFixed(decimals) : `${formatted}`, unit: 'km' };
	}
	const formatted = Math.round(distance * 100) / 100;
	return { value: formatted, localizedValue: decimals ? formatted.toFixed(decimals) : `${formatted}`, unit: 'm' };
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
	if (area >= Squaredkilometer_In_Squaredmeters) {
		const formatted = Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100;
		return { value: formatted, localizedValue: decimals ? formatted.toFixed(decimals) : `${formatted}`, unit: 'km²' };
	}
	const formatted = Math.round(area * 100) / 100;
	return { value: formatted, localizedValue: decimals ? formatted.toFixed(decimals) : `${formatted}`, unit: 'm²' };
};
