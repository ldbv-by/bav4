export const hereStartsSteep = 0.02;
export const flatColor = '#66eeff';
export const steepColor = '#ee4444';

/**
 * different types of slope
 * @enum
 */
export const SlopeType = Object.freeze({
	Flat: 0,
	Steep: 1
});

export const startSteep = (gradientBg, xPoint) => {
	gradientBg.addColorStop(xPoint, flatColor);
	gradientBg.addColorStop(xPoint, steepColor);
	return SlopeType.Steep;
};

export const startFlat = (gradientBg, xPoint) => {
	gradientBg.addColorStop(xPoint, steepColor);
	gradientBg.addColorStop(xPoint, flatColor);
	return SlopeType.Flat;
};
