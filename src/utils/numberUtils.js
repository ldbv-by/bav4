import { $injector } from '../injection';
import { isNumber } from './checks';

/**
 * Rounds the given value according to how many decimals are wanted
 * @param {number} value
 * @param {number} decimals how many decimals after the separator must be present after rounding (default to 0)
 * @returns {number} value rounded
 */
export const round = (value, decimals = 0) => {
	if (!isNumber(value, false)) {
		return undefined;
	}
	if (decimals === 0) {
		return Math.round(value);
	}
	const pow = Math.pow(10, decimals);
	return Math.round(value * pow) / pow;
};

/**
 * Creates a (pseudo) unique Number that can be used as an id
 * @returns {number} id unique id
 */
export const createUniqueId = () => {
	return Math.floor(Math.random() * Date.now());
};

/**
 * Formates a number according to the current "DEFAULT_LANG" property.
 * @param {number} value
 * @returns the formated number as `string` or `undefined`
 */
export const toLocaleString = (value) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	if (isNumber(value)) {
		return value.toLocaleString(configService.getValue('DEFAULT_LANG'));
	}
	return undefined;
};
