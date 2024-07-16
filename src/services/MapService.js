/**
 * @module services/MapService
 */
import { $injector } from '../injection';
import { isCoordinateLike } from '../utils/checks';
import { calc3857MapResolution } from '../utils/mapUtils';
import { findAllBySelector, REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME } from '../utils/markup';
import { calculateVisibleViewport } from '../utils/viewport';
import { getBvvMapDefinitions } from './provider/mapDefinitions.provider';

/**
 * Map related meta data.
 * @typedef {Object} MapDefinitions
 * @property {module:domain/extentTypeDef~Extent} defaultExtent default extent of the map
 * @property {number} minZoomLevel the minimal zoom level the map should support
 * @property {number} maxZoomLevel the maximal zoom level the map should support
 * @property {number} srid the internal SRID of the map
 * @property {number} localProjectedSrid the SRID of the supported local projected system
 * @property {module:domain/extentTypeDef~Extent} localProjectedSridExtent the extent of the local supported projected system
 * @property {function(module:domain/coordinateTypeDef~Coordinate):(Array<module:domain/coordinateRepresentation~CoordinateRepresentation>)} localProjectedSridDefinitionsForView function which can take a coordinate and returns an array of CoordinateRepresentations
 * @property {Array<module:domain/coordinateRepresentation~CoordinateRepresentation>} globalSridDefinitionsForView array of global CoordinateRepresentations
 */

/**
 * A function that provides map related meta data.
 * @typedef {Function} mapDefinitionProvider
 * @returns {module:services/MapService~MapDefinitions} available categories
 */

/**
 * Service for managing map related meta data.
 * @class
 * @author taulinger
 */
export class MapService {
	/**
	 * @param {module:services/MapService~mapDefinitionProvider} [mapDefinitionProvider=getBvvMapDefinitions]
	 */
	constructor(mapDefinitionProvider = getBvvMapDefinitions) {
		const { CoordinateService } = $injector.inject('CoordinateService');
		this._coordinateService = CoordinateService;
		this._definitions = mapDefinitionProvider();
	}

	/**
	 * Returns the internal SRID of the map (typically 3857)
	 * @returns {number} SRID
	 */
	getSrid() {
		return this._definitions.srid;
	}

	/**
	 * Returns a list with all available CoordinateRepresentation.
	 *
	 * When a coordinate or a list of coordinates is given the list contains all
	 * suitable CoordinateRepresentation regarding this coordinate(s).
	 *
	 * Note: The most specific list of CoordinateRepresentation will be returned when the argument is a only a single coordinate.
	 *
	 * The returned list is dependent on whether all coordinates are inside the extent
	 * of the supported local projected system (if defined).
	 *
	 * If no coordinate is provided the list contains all available global CoordinateRepresentations.
	 *
	 * Note: The first entry of the list should be considered as the current "default" CoordinateRepresentation.
	 *
	 * @param {Array<module:domain/coordinateTypeDef~CoordinateLike>|module:domain/coordinateTypeDef~CoordinateLike|null} [coordinateLikeInMapProjection] - coordinate like in map projection
	 * @returns {Array<module:domain/coordinateRepresentation~CoordinateRepresentation>} Array of `CoordinateRepresentation`
	 */
	getCoordinateRepresentations(coordinateLikeInMapProjection = []) {
		const coordinatesInMapProjection = this._coordinateService.toCoordinate(
			isCoordinateLike(coordinateLikeInMapProjection) ? [coordinateLikeInMapProjection] : [...coordinateLikeInMapProjection]
		);

		// we have no projected extent defined or no coordinate is provided
		if (!this.getLocalProjectedSridExtent() || coordinatesInMapProjection.length === 0) {
			return this._definitions.globalCoordinateRepresentations;
		}

		// one or more coordinates are outside the projected extent
		if (coordinatesInMapProjection.find((c) => !this._coordinateService.containsCoordinate(this.getLocalProjectedSridExtent(), c))) {
			return this._definitions.globalCoordinateRepresentations;
		}

		return this._definitions.localProjectedCoordinateRepresentations(coordinatesInMapProjection[0]);
	}

	/**
	 * Returns the SRID of the supported local projected system.
	 * For the corresponding extent call {@link MapService#getLocalProjectedSridExtent}.
	 * @returns {number|null} SRID or `null` when no local projected SRID is supported
	 */
	getLocalProjectedSrid() {
		return this._definitions.localProjectedSrid;
	}

	/**
	 * Returns the extent of the supported local projected system.
	 * For the corresponding SRID call {@link MapService#getLocalProjectedSrid}.
	 * Within this extent all calculations can be done in the euclidean space.
	 * Outside of this extent all calculations should be done in a geodesic manner.
	 * Can be `null` when no extent is defined.
	 * @param {number} srid the desired SRID of the returned extent
	 * @returns {Extent|null} extent
	 * @throws Unsupported SRID error
	 */
	getLocalProjectedSridExtent(srid = this.getSrid()) {
		switch (srid) {
			case 3857:
				return this._coordinateService.fromLonLatExtent(this._definitions.localProjectedSridExtent);
			case 4326:
				return this._definitions.localProjectedSridExtent;
		}
		throw new Error('Unsupported SRID ' + srid);
	}

	/**
	 * Returns the default extent of the map.
	 * @param {number} srid the desired SRID of the returned extent
	 * @returns {module:domain/extentTypeDef~Extent} extent
	 * @throws Unsupported SRID error
	 */
	getDefaultMapExtent(srid = this.getSrid()) {
		switch (srid) {
			case 3857:
				return this._definitions.defaultExtent;
			case 4326:
				return this._coordinateService.toLonLatExtent(this._definitions.defaultExtent);
		}
		throw new Error('Unsupported SRID ' + srid);
	}

	/**
	 * Returns the minimal zoom level the map supports
	 * @returns {Number} zoom level
	 */
	getMinZoomLevel() {
		return this._definitions.minZoomLevel;
	}

	/**
	 * Returns the maximal zoom level the map supports
	 * @returns {Number} zoom level
	 */
	getMaxZoomLevel() {
		return this._definitions.maxZoomLevel;
	}

	/**
	 * Returns the minimal angle in radians when rotation of the map should be accepted and applied.
	 * @returns threshold value for rotating the map in radians.
	 */
	getMinimalRotation() {
		return 0.3;
	}

	/**
	 * Calculates the resolution at a specific degree of latitude in meters per pixel.
	 * @param {number} zoom  Zoom level to calculate resolution at
	 * @param {module:domain/coordinateTypeDef~Coordinate} [coordinateInMapProjection] Coordinate to calculate a resolution (required for global map projections like `3857`)
	 * @param {number} [srid] Spatial Reference Id. Default is `3857`
	 * @param {number} [tileSize] tileSize The size of the tiles in the tile pyramid. Default is `256`
	 */
	calcResolution(zoom, coordinateInMapProjection = null, srid = this.getSrid(), tileSize = 256) {
		switch (srid) {
			case 3857:
				if (!coordinateInMapProjection) {
					throw new Error(`Parameter 'coordinateInMapProjection' must not be Null when using SRID ${srid}`);
				}
				return calc3857MapResolution(this._coordinateService.toLonLat(coordinateInMapProjection)[1], zoom, tileSize);
		}
		throw new Error(`Unsupported SRID ${srid}`);
	}

	/**
	 * Returns an HTMLElement acting as a container for a scale line component.
	 * @returns {HTMLElement|null} element or `null`;
	 */
	getScaleLineContainer() {
		const element = document.querySelector('ba-footer')?.shadowRoot.querySelector('.scale');
		return element ?? null;
	}

	/**
	 * Additional padding of a viewport in pixel.
	 * @typedef ViewportPadding
	 * @property {number} top
	 * @property {number} right
	 * @property {number} button
	 * @property {number} left
	 */

	/**
	 * Returns a  {@link ViewportPadding} describing the visible part of the specified map
	 * (which means the part of the map that is not overlapped by any other UI element)
	 * @param {HTMLElement} mapElement the map containing element
	 * @returns {ViewportPadding}
	 */
	getVisibleViewport(mapElement) {
		const overlappingElements = findAllBySelector(document, `[${REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME}]`);
		const visibleRectangle = calculateVisibleViewport(mapElement, overlappingElements);

		const baseRectangle = mapElement.getBoundingClientRect();
		return {
			top: visibleRectangle.top - baseRectangle.top,
			right: baseRectangle.right - visibleRectangle.right,
			bottom: baseRectangle.bottom - visibleRectangle.bottom,
			left: visibleRectangle.left - baseRectangle.left
		};
	}

	/**
	 * Calculates the length of an array of coordinates.
	 *
	 * The kind of calculations depends on whether the coordinates are inside or outside of the extent
	 * of the supported local projected system (if defined).
	 *
	 * This is basically a convenience method for {@link module:services/OlCoordinateService#getLength}.
	 *
	 * @param {Array<module:domain/coordinateTypeDef~Coordinate>} coordinatesInMapProjection coordinates in map projection
	 * @returns {Number} the length
	 */
	calcLength(coordinatesInMapProjection) {
		if (
			// no local projected extend defined or one or more coordinates are outside the projected extent > global calculation wanted
			!this.getLocalProjectedSridExtent() ||
			coordinatesInMapProjection.find((c) => !this._coordinateService.containsCoordinate(this.getLocalProjectedSridExtent(), c))
		) {
			const wgs84Coordinates = coordinatesInMapProjection.map((c) => this._coordinateService.toLonLat(c));
			return this._coordinateService.getLength(wgs84Coordinates, true);
		}
		const projectedCoordinates = coordinatesInMapProjection.map((c) =>
			this._coordinateService.transform(c, this.getSrid(), this.getLocalProjectedSrid())
		);
		return this._coordinateService.getLength(projectedCoordinates, false);
	}

	/**
	 * Calculates the area for an array of polygon coordinates.
	 *
	 * Array of linear rings that define the polygon. The first linear ring of the array defines the outer-boundary or surface of the polygon. Each subsequent linear ring defines a hole in the surface of the polygon.
	 * A linear ring is an array of vertices' coordinates where the first coordinate and the last are equivalent.
	 *
	 * The kind of calculations depends on whether the coordinates are inside or outside of the extent
	 * of the supported local projected system (if defined).
	 *
	 * This is basically a convenience method for {@link module:services/OlCoordinateService#getArea}.
	 *
	 * @param {Array<Array<module:domain/coordinateTypeDef~Coordinate>>} coordinatesInMapProjection polygon coordinates map projection
	 * @returns {Number} the area
	 */
	calcArea(coordinatesInMapProjection) {
		if (
			// no local projected extend defined or one or more coordinates are outside the projected extent > global calculation wanted
			!this.getLocalProjectedSridExtent() ||
			coordinatesInMapProjection[0] /** the first linear ring defines the surface of the polygon */
				.find((c) => !this._coordinateService.containsCoordinate(this.getLocalProjectedSridExtent(), c))
		) {
			const wgs84Coordinates = coordinatesInMapProjection.map((linearRing) => {
				return linearRing.map((c) => this._coordinateService.toLonLat(c));
			});
			return this._coordinateService.getArea(wgs84Coordinates, true);
		}
		const projectedCoordinates = coordinatesInMapProjection.map((linearRing) => {
			return linearRing.map((c) => this._coordinateService.transform(c, this.getSrid(), this.getLocalProjectedSrid()));
		});
		return this._coordinateService.getArea(projectedCoordinates, false);
	}
}
