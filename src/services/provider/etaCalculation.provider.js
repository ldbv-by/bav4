/**
 * @module services/provider/etaCalculation_provider
 */

/**
 * The predefined vehicle-specific SpeedOptions for Hike, Bike, MTB and Roadbike
 */
const VehicleSpeedOptions = {
	'bvv-hike': { up: 300, down: 500, horizontal: 4000 }, // Base from DIN 33466/DAV
	'bvv-bike': { up: 300, down: 250000, horizontal: 15000 }, // average cyclist with comfortable pace
	'bvv-mtb': { up: 400, down: 250000, horizontal: 20000 }, // sportive cyclist on paved roads and rough terrain with higher pace
	racingbike: { up: 400, down: 350000, horizontal: 27000 } // sportive/racing cyclist on only paved roads (asphalt,tarmac,concrete) with higher pace
};

/**
 * Calculator for ETAs (Estimated Time Arrived)
 * for specific vehicle classes (Hike, Bike,MTB.Racingbike)
 * Based on formulas from DAV and DIN (DIN 33466) for hiking only
 * but adapted for Bike, MTB and Racingbike
 *
 * walking duration estimate based on DAV-Normative:
 *  - https://discuss.graphhopper.com/t/walking-duration-estimate-elevation-ignored/4621/4
 *  - https://www.alpenverein.de/chameleon/public/908f5f80-1a20-3930-1692-41be014372d2/Formel-Gehzeitberechnung_19001.pdf
 * @see https://de.wikipedia.org/wiki/Marschzeitberechnung
 * @function
 * @implements @type {module:services/RoutingService~etaCalculationProvider}
 * @returns {number|null}
 */
export const bvvEtaCalculationProvider = (categoryId, distance, elevationUp, elevationDown) => {
	const getETAFor = (distance, elevationUp, elevationDown, speedOptions) => {
		const { up: upSpeed, down: downSpeed, horizontal: horizontalSpeed } = speedOptions;
		const hourInMilliSeconds = 3600000;

		const verticalTime = (elevationUp / upSpeed + elevationDown / downSpeed) * hourInMilliSeconds;
		const horizontalTime = (distance / horizontalSpeed) * hourInMilliSeconds;

		return verticalTime > horizontalTime ? horizontalTime / 2 + verticalTime : verticalTime / 2 + horizontalTime;
	};

	const speedOptions = Object.hasOwn(VehicleSpeedOptions, categoryId) ? VehicleSpeedOptions[categoryId] : null;

	return speedOptions ? getETAFor(distance, elevationUp, elevationDown, speedOptions) : null;
};
