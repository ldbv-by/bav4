/**
 * @module services/provider/etaCalculator_provider
 */
/**
 * Uses the BVV endpoint to load a GeoResource from the FileStorage.
 * @function
 * @implements {module:services/ETACalculatorService~etaCalculatorProvider}
 * @returns {module:services/ETACalculatorService~ETACalculator|null}
 */
export const bvvEtaCalculatorProvider = (vehicle) => {
	/**
	 * The predefined vehicle-specific ETA-Calculators for Hike, Bike, MTB and Roadbike
	 */
	const VehicleETACalculations = {
		hike: new VehicleETACalculation(300, 500, 4000), // Base from DIN 33466/DAV
		bike: new VehicleETACalculation(300, 250000, 15000), // average cyclist with comfortable pace
		mtb: new VehicleETACalculation(400, 250000, 20000), // sportive cyclist on paved roads and rough terrain with higher pace
		roadbike: new VehicleETACalculation(400, 350000, 27000) // sportive/racing cyclist on only paved roads (asphalt,tarmac,concrete) with higher pace
	};
	return Object.hasOwn(VehicleETACalculations, vehicle) ? VehicleETACalculations[vehicle] : null;
};

/**
 * Calculator for ETAs (Estimated Time Arrived)
 * for specific vehicle classes (Hike, Bike,MTB.Racingbike)
 * Based on formulas from DAV and DIN (DIN 33466) for hiking only
 * but adapted for Bike, MTB and Racingbike
 * @see https://de.wikipedia.org/wiki/Marschzeitberechnung
 * @implements {module:services/ETACalculatorService~ETACalculator")
 */
class VehicleETACalculation {
	/**
	 *
	 * @param {Number} upSpeed uphill vehicle speed
	 * @param {Number} downSpeed downhill vehicle speed
	 * @param {Number} horizontalSpeed planar (horizontal) vehicle speed
	 */
	constructor(upSpeed, downSpeed, horizontalSpeed) {
		this.upSpeed = upSpeed;
		this.downSpeed = downSpeed;
		this.horizontalSpeed = horizontalSpeed;
	}

	/**
	 *
	 * @param {Number} distance distance in meter
	 * @param {Number} elevationUp elevation upwards in meter
	 * @param {Number} elevationDown  elevation downwards in meter
	 * @returns {Number} The ETA in milliseconds
	 */
	getETAfor(distance, elevationUp, elevationDown) {
		const hourInMilliSeconds = 3600000;

		const verticaltime = (elevationUp / this.upSpeed + elevationDown / this.downSpeed) * hourInMilliSeconds;
		const horizontaltime = (distance / this.horizontalSpeed) * hourInMilliSeconds;
		if (verticaltime > horizontaltime) {
			return horizontaltime / 2 + verticaltime;
		}
		return verticaltime / 2 + horizontaltime;
	}
}
