/**
 * @module modules/olMap/services/VtLayerRenderingService
 */

import { mapLibreRenderingProvider, mapLibreRenderMapProviderFunction } from '../utils/olRendering.provider';

/**
 * The Result of a rendered layer.
 * @typedef LayerRenderResult
 * @property {string} encodedImage
 * @property {ol.Extent} extent the extent of the rendered image
 */

/**
 * A function that returns map instance for rendering
 * @typedef {Function} RenderMapFunction
 * @param {ol.layer} olLayer The ol layer
 * @param {HTMLElement} renderContainer The container for rendering the map
 * @param {ol.Extent} mapExtent The map extent
 * @returns {Object} the render map instance
 */

/**
 * A function that returns a function to create render map instances
 * @typedef {Function} RenderMapProviderFunction
 * @returns {RenderMapFunction} the render map function
 */

/**
 * A function that returns a rendered and encoded (base64) image for a specified ol layer
 * @typedef {Function} layerRenderingProvider
 * @param {ol.layer} olLayer The ol layer
 * @param {RenderMapProviderFunction} renderMapFactory The factory to create the render map
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
	constructor(renderingProvider = mapLibreRenderingProvider, renderMapFactory = mapLibreRenderMapProviderFunction) {
		this._renderingProvider = renderingProvider;
		this._renderMapFactory = renderMapFactory;
	}

	async renderLayer(olLayer, mapExtent, mapSize) {
		return this._renderingProvider(olLayer, this._renderMapFactory, mapExtent, mapSize);
	}
}
