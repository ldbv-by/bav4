import { createStringXY } from 'ol/coordinate';

/**
 * A function that returns a function which itsself takes a coordinate and returns a string representation.
 *
 * @typedef {function():(function(Coordinate) : (string) stringifyCoordProvider
 */


export const defaultStringifyFunction = (srid, options = { digits: 3 }) => {
	return createStringXY(options.digits);
};