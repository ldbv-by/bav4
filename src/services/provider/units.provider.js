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
 * @param {number} distance the distance value
 * @returns {String} the formatted value
 */
export const bvvDistanceUnitsProvider = (distance) => {
	const locales = getLocales();
	const asKilometer = (distanceValue) => {
		return (
			(Math.round((distanceValue / Kilometer_In_Meters) * 100) / 100).toLocaleString(locales, {
				minimumFractionDigits: 1,
				maximumFractionDigits: 1
			}) +
			' ' +
			'km'
		);
	};
	const asMeter = (distanceValue) => {
		return distance !== 0
			? (Math.round(distanceValue * 100) / 100).toLocaleString(locales, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' ' + 'm'
			: '0 m';
	};
	return distance > Kilometer_In_Meters - 1 ? asKilometer(distance) : asMeter(distance);
};

/**
 * Appends the metric unit of area to the specified number with bvv defined decimals
 * @param {number} area the area value
 * @returns {String} the formatted value
 */
export const bvvAreaUnitsProvider = (area) => {
	const locales = getLocales();
	const asSquaredKilometer = (areaValue) => {
		return (
			(Math.round((areaValue / Squaredkilometer_In_Squaredmeters) * 100) / 100).toLocaleString(locales, {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			}) +
			' ' +
			'km²'
		);
	};
	const asSquaredMeter = (areaValue) => {
		return areaValue > 1
			? (Math.round(areaValue * 100) / 100).toLocaleString(locales, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ' + 'm²'
			: '1 m²';
	};
	if (area < 0.5) {
		return '0 m²';
	}
	return area >= Squaredkilometer_In_Squaredmeters ? asSquaredKilometer(area) : asSquaredMeter(area);
};

/**
 * Appends the metric unit of distance to the specified number
 * @param {number} distance the distance value
 * @param {number} decimals the number of digits after the decimal point
 * @returns {String} the formatted value
 */
export const distanceUnitsProvider = (distance, decimals) => {
	let formatted;
	if (distance > Kilometer_In_Meters - 1) {
		if (decimals) {
			formatted = (Math.round((distance / Kilometer_In_Meters) * 100) / 100).toFixed(decimals) + ' ' + 'km';
		} else {
			formatted = Math.round((distance / Kilometer_In_Meters) * 100) / 100 + ' ' + 'km';
		}
	} else {
		if (decimals) {
			formatted = distance !== 0 ? (Math.round(distance * 100) / 100).toFixed(decimals) + ' ' + 'm' : '0 m';
		} else {
			formatted = distance !== 0 ? Math.round(distance * 100) / 100 + ' ' + 'm' : '0 m';
		}
	}
	return formatted;
};

/**
 * Appends the metric unit of area to the specified number
 * @param {number} area the area value
 * @param {number} decimals the number of digits after the decimal point
 * @returns {String} the formatted value
 */
export const areaUnitsProvider = (area, decimals) => {
	let formatted;
	if (area >= Squaredkilometer_In_Squaredmeters) {
		if (decimals) {
			formatted = (Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100).toFixed(decimals) + ' ' + 'km²';
		} else {
			formatted = Math.round((area / Squaredkilometer_In_Squaredmeters) * 100) / 100 + ' ' + 'km²';
		}
	} else {
		if (decimals) {
			formatted = (Math.round(area * 100) / 100).toFixed(decimals) + ' ' + 'm²';
		} else {
			formatted = Math.round(area * 100) / 100 + ' ' + 'm²';
		}
	}
	return formatted;
};
