/**
 * @module modules/olMap/services/MapLibreRenderService
 */

import { mapLibreRenderingProvider } from '../utils/olRendering.provider';

/**
 * The Result of a rendered layer.
 * @typedef LayerRenderResult
 * @property {string} encodedImage
 * @property {ol.Extent} extent the extent of the rendered image
 */

/**
 * A function that returns a rendered and encoded (base64) image for a specified ol layer
 * @typedef {Function} layerRenderingProvider
 * @param {ol.layer} olLayer The ol layer
 * @param {ol.Extent} mapExtent The map extent
 * @param {number[]|null} mapSize map width and height of the requested image in px
 * @returns {LayerRenderResult} the render result
 */

/**
 * Service that creates a rendered image as snapshot from the specified vector tile layer.
 * @class
 * @author thiloSchlemmer
 */
export class VtLayerRenderingService {
	#renderingProvider;
	constructor(renderingProvider = mapLibreRenderingProvider) {
		this.#renderingProvider = renderingProvider;
	}

	async renderLayer(olLayer, mapExtent, mapSize) {
		return this.#renderingProvider(olLayer, mapExtent, mapSize);
	}
}
