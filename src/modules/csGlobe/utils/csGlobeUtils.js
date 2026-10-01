/**
 * @param {Number} resolution
 * @param {Number} canvasWidth Canvas width in pixels
 * @returns {number}
 */
export function calculateSpatialHeight(resolution, canvasWidth) {
	return (resolution * canvasWidth) / (2 * Math.tan(Math.PI / 6));
}

/**
 * @param {Number} height
 * @param {Number} canvasWidth Canvas width in pixels
 * @returns {number}
 */
export function calculateSpatialResolution(height, canvasWidth) {
	return (2 * Math.tan(Math.PI / 6) * height) / canvasWidth;
}
