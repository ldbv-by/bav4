/**
 * @module services/ETACalculatorService
 */
/**
 * A Calculator for ETAs (Estimated Time Arrived)
 * @typedef {Object} ETACalculator
 * @param {Number} distance distance in meter
 * @param {Number} elevationUp elevation upwards in meter
 * @param {Number} elevationDown  elevation downwards in meter
 * @property {function(distance, elevationUp, elevationDown):(number)} getETAfor function that returns the ETA in milliseconds.
 */

import { bvvEtaCalculatorProvider } from './provider/etaCalculator.provider';

/**
 * A function that provides a ETACalculator for a defined vehicle type.
 * @typedef {function(string):(ETACalculator | null)} etaCalculatorProvider
 */

export class ETACalculatorService {
	/**
	 *
	 * @param {etaCalculatorProvider} [etaCalculatorProvider=bvvEtaCalculatorProvider]
	 */
	constructor(etaCalculatorProvider = bvvEtaCalculatorProvider) {
		this._etaCalculatorProvider = etaCalculatorProvider;
	}

	/**
	 * Returns a ETACalculator for a defined vehicle type
	 * @param {string} vehicle
	 */
	getETACalculatorFor(vehicle) {
		return this._etaCalculatorProvider(vehicle);
	}
}
