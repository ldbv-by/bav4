/**
 * @module modules/wc/components/PublicWebComponent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './publicWebComponent.css';
import { QueryParameters } from '../../../domain/queryParameters';
import { $injector } from '../../../injection/index';
import { parseBoolean, setQueryParams } from '../../../utils/urlUtils';
import { createUniqueId } from '../../../utils/numberUtils';
import { PathParameters } from '../../../domain/pathParameters';
import { WcAttributes, WcEvents, WcMessageKeys } from '../../../domain/webComponent';
import { isBoolean, isCoordinate, isDefined, isExtent, isHexColor, isNumber, isString } from '../../../utils/checks';
import { SourceTypeName } from '../../../domain/sourceType';
import { fromString } from '../../../utils/coordinateUtils';
import { removeUndefinedProperties } from '../../../utils/objectUtils';
import { findAllBySelector } from '../../../utils/markup';

/**
 * @event baLoad
 * @type {CustomEvent}
 * @property {PublicWebComponent} target - The WebComponent instance
 * @description Fired when the BayernAtlas map is fully loaded and ready for interaction
 */

/**
 * @event baChange
 * @type {CustomEvent}
 * @property {Object} detail - The changed property
 * @property {PublicWebComponent} target - The WebComponent instance
 * @description Fired when the map state changes (center, zoom, rotation, layers)
 */

/**
 * @event baGeometryChange
 * @type {CustomEvent}
 * @property {BaWcGeometry} detail - The geometry data
 * @property {PublicWebComponent} target - The WebComponent instance
 * @description Fired when the user creates or modifies a geometry
 */

/**
 * @event baFeatureSelect
 * @type {CustomEvent}
 * @property {Array<BaWcFeature>} detail - The selected features
 * @property {PublicWebComponent} target - The WebComponent instance
 * @description Fired when features are selected on the map
 */
/**
 * @typedef {Object} View
 * @property {number} [zoom] - The zoom level (0-20)
 * @property {Coordinate} [center] - The center coordinate in 4326 (lon, lat) or 25832
 * @property {number} [rotation] - The rotation in radians
 */

/**
 * @typedef {Array<number>} Coordinate
 * @description An array of two numbers representing an XY coordinate. Ordering is [easting, northing] or [lon, lat].
 * @example [16, 48] // longitude, latitude in 4326
 * @example [671092, 5299670] // easting, northing in 25832
 */

/**
 * @typedef {Array<number>} Extent
 * @description An array of four numbers representing a bounding box: [minx, miny, maxx, maxy]
 * @example [10.5, 47.2, 13.8, 49.1] // in 4326
 */

/**
 * @typedef {Object} Geometry
 * @property {string} type - The format type ('EWKT', 'GeoJSON', 'KML', 'GPX')
 * @property {number} srid - The spatial reference system identifier (e.g., 4326, 25832)
 * @property {string} data - The geometry data as a string
 */

/**
 * @typedef {Object} Feature
 * @property {Geometry} geometry - The spatial geometry
 * @property {string} [label] - Display label for the feature
 * @property {Object} [properties] - Additional feature properties
 */

/**
 * @typedef {Object} AddLayerOptions
 * @property {number} [opacity=1] - Layer opacity (0-1)
 * @property {boolean} [visible=true] - Layer visibility
 * @property {number} [zIndex] - Layer stacking order
 * @property {Style} [style] - Layer styling options
 * @property {boolean} [displayFeatureLabels=true] - Show feature labels
 * @property {boolean} [zoomToExtent=true] - Zoom map to layer extent
 * @property {string} [layerId] - Custom layer identifier
 * @property {boolean} [modifiable=false] - Allow user modification (KML layers only)
 */

/**
 * @typedef {Object} ModifyLayerOptions
 * @property {number} [opacity] - Layer opacity (0-1)
 * @property {boolean} [visible] - Layer visibility
 * @property {number} [zIndex] - Layer stacking order
 * @property {Style} [style] - Layer styling options
 * @property {boolean} [displayFeatureLabels] - Show feature labels
 */

/**
 * @typedef {Object} Style
 * @property {string|null} [baseColor] - Base color in hex format (e.g., "#fcba03")
 */

/**
 * @typedef {Object} MarkerOptions
 * @property {string} [id] - Custom marker identifier
 * @property {string} [label] - Marker label (required for selection)
 */

/**
 * @typedef {Object} BaWcFeature
 * @property {string} label - The label of the feature
 * @property {object} properties - The properties of the feature
 * @property {BaWcGeometry} geometry - The geometry of the feature
 */

/**
 * @typedef {Object} BaWcGeometry
 * @property {string} type - The type of the geometry
 * @property {number} srid - The srid of the geometry
 * @property {string} data - The data of the geometry
 */

/**
 * BayernAtlas WebComponent - Embed interactive maps in your web applications.
 *
 * This WebComponent provides a declarative API for embedding BayernAtlas maps with full programmatic control.
 * It supports multiple coordinate systems, layer management, drawing tools, and real-time state synchronization.
 *
 * ## Key Features
 *
 * - **Declarative Setup**: Configure maps using HTML attributes
 * - **Programmatic Control**: Full JavaScript API for dynamic manipulation
 * - **Multiple Projections**: Support for EPSG:4326 and EPSG:25832
 * - **Layer Management**: Add, modify, and remove map layers
 * - **Drawing Tools**: Built-in geometry creation tools
 * - **Event System**: Comprehensive event handling for map interactions
 * - **Responsive Design**: Adapts to container dimensions
 *
 * ## API Philosophy
 *
 * - **Attributes**: Declarative setup and state reflection
 * - **Properties**: Read current map state
 * - **Methods**: Programmatic map manipulation
 * - **Events**: Real-time state change notifications
 *
 * ## Core Concepts
 *
 * ### Layer
 * A logical map layer that groups GeoResources or Features, controlling visibility, z-order, and styling.
 * Examples: base map layers (WMTS), overlay layers (vector data), marker layers.
 *
 * ### GeoResource
 * A geospatial data source referenced by ID (e.g., `GEORESOURCE_AERIAL`) or URL pattern.
 * Can be raster tiles, vector data, or external services.
 *
 * ### Feature
 * A single geospatial object with geometry, properties, and optional label.
 * Features can be selected, highlighted, and exported.
 *
 * ### Geometry
 * The spatial shape defining a Feature (Point, LineString, Polygon, Multi* variants).
 * Supports multiple formats: EWKT, GeoJSON, KML, GPX.
 *
 * ## Coordinate Systems
 *
 * The component accepts coordinates in both WGS84 (EPSG:4326) and UTM32N (EPSG:25832):
 * - **EPSG:4326**: Longitude, Latitude (default)
 * - **EPSG:25832**: Easting, Northing
 *
 * Output coordinates can be configured via the `ec_srid` attribute.
 *
 * ## Basic Usage
 *
 * @example
 * // Include the WebComponent script
 * <script src="https://bayernatlas.de/wc.js" type="module"></script>
 *
 * @example
 * // Simple map
 * <bayern-atlas></bayern-atlas>
 *
 * @example
 * // Configured map with attributes
 * <bayern-atlas
 *   z="8"
 *   c="11.5,48.1"
 *   l="atkis,luftbild_labels"
 *   ec_srid="25832"
 * ></bayern-atlas>
 *
 * @example
 * // Programmatic control
 * const map = document.querySelector('bayern-atlas');
 * map.addEventListener('baLoad', () => {
 *   map.modifyView({ zoom: 10, center: [11, 48] });
 *   const layerId = map.addLayer('GEORESOURCE_AERIAL');
 * });
 *
 * @example
 * // Drawing tools
 * <bayern-atlas ec_draw_tool="polygon"></bayern-atlas>
 *
 * @example
 * // Event handling
 * const map = document.querySelector('bayern-atlas');
 * map.addEventListener('baFeatureSelect', (event) => {
 *   console.log('Selected features:', event.detail);
 * });
 *
 *
 * @example // TYPE definitions
 *
 * // Defines the center, resolution, and rotation of the map
 * View {
 *		zoom: 4, // The new number zoom level of the map (number, optional)
 *		center: [1286733,039367 6130639,596329], // The new center coordinate in 4326 (lon, lat) or in 25832 (Coordinate, optional)
 *		rotation: 0.5 // The new rotation pf the map in rad (number, optional)
 * }
 *
 * // Defines a coordinate
 * Coordinate // An array of two numbers representing an XY coordinate. Ordering is [easting, northing] or [lon, lat]. Example: `[16, 48]`.
 *
 * // Defines an extent
 * Extent // An array of four numbers representing an extent: `[minx, miny, maxx, maxy]`.
 *
 * // Defines a geometry
 * Geometry {
 * 		type: 'EWKT',  // The type of the geometry (string)
 * 		srid: 4236,  //The srid of the geometry (number)
 * 		data: 'SRID=4326POINT(15 20)',  //The data of the geometry (string)
 * }
 *
 * // Defines a feature
 * Feature {
 * 	geometry:  {type: 'EWKT', srid: 4236, data: 'SRID=4326POINT(15 20)'} // The geometry of the feature (Geometry)
 * 	label: "Foo", // The label of the feature (string, optional)
 * 	properties: {} // The properties of the feature (object, optional)
 * }
 *
 * // Defines the options for adding a layer
 * AddLayerOptions {
 *		opacity: 1, // Opacity (number, 0, 1, optional)
 *		visible: true,  // Visibility (boolean, optional)
 *		zIndex: 0,  // Index of this layer within the list of active layers. When not set, the layer will be appended at the end (number, optional)
 *		style: { baseColor: "#fcba03" },  // If applicable the style of this layer (Style, optional),
 *		displayFeatureLabels: true, // If applicable labels of features should be displayed (boolean, optional).
 *		zoomToExtent: true , // If applicable the map should be zoomed to the extent of this layer (boolean, optional)
 *		layerId: "myLayerO", // The id of the layer (string, optional)
 *		modifiable: false, // If applicable the data of this layer should be modifiable by the user (boolean, optional). Note: Only one layer per map can be modifiable. A modifiable layer must meet the following expectations: Its data must have the format `KML` and must previously be created by the BayernAtlas
 * }
 *
 * // Defines the options for modifying a layer
 * ModifyLayerOptions {
 *		opacity: 1, // Opacity (number, 0, 1, optional)
 *		visible: true,  // Visibility (boolean, optional)
 *		zIndex: 0,  // Index of this layer within the list of active layers. When not set, the layer will be appended at the end (number, optional)
 *		style: { baseColor: "#fcba03" },  // If applicable the style of this layer (Style, optional),
 *		displayFeatureLabels: true // If applicable labels of features should be displayed (boolean, optional)
 * }
 *
 * // Defines the style for a layer
 * Style {
 * 		baseColor: "#fcba03" //A simple base color as style for this layer (seven-character hexadecimal notation) or `null`
 * }
 *
 * // Defines the options for a marker
 * MarkerOptions {
 * 	id: "myMarker0", // The id of the marker (string, optional). When no ID is given a random ID will be generated
 * 	label: "My label" // The label of the marker (string, optional). Must be set if the marker should be selectable by the user
 * }
 *
 * //Events
 *
 * @attribute {string} c - The Center coordinate (longitude,latitude / easting,northing) in `4326` (lon, lat) or in `25832`. Example: `c="11,48"`.
 * @attribute {string} z - The Zoom level (0-20) of the map. Example: `z="8"`.
 * @attribute {number} r - The rotation of the map (in rad). Example: `r="0.5"`.
 * @attribute {string} l - The layers of the map. Example: `l="layer_a,layer_b"`.
 * @attribute {string} l_v - The visibility of the layers of the map. Example: `l_v="true,false"`.
 * @attribute {string} l_o - The opacity of the layers of the map. Example: `l_o="1,0.5"`.
 * @attribute {string} ec_srid - Designated SRID of returned coordinates (e.g. of geometries). One of `3857`, `4326` , `25832`. Default is `4326`. Example: `ec_srid="25832"`.
 * @attribute {string} ec_geometry_format - Designated Type (format) of returned features. One of `ewkt`, `kml`, `geojson`, `gpx`. Default is `ewkt`. Example: `ec_geometry_format="geoJson"`.
 * @attribute {boolean} ec_map_activation - Display the map insensitive for user interactions unless the user activates the map via a button. Example: `ec_map_activation="true"`.
 * @attribute {boolean} ec_link_to_app - Display a chip that opens the current view in the BayernAtlas. Example: `ec_link_to_app="true"`.
 * @attribute {boolean} ec_draw_tool - Display the drawing tool for the types `point`, `line`, `polygon`: Example: `ec_draw_tool="point,line,polygon"`.
 * @fires baLoad {CustomEvent<this>} Fired when the BayernAtlas is loaded
 * @fires baChange {CustomEvent<this>} Fired when the state of the BayernAtlas map has changed.
 * See `event.detail` for the payload of the event.
 * The following changes are supported:
 * `c` - The center of the map has changed
 * `z` - The zoom level of the map has changed
 * `r` - The rotation of the map has changed
 * `l` - List of layers has changed
 * `l_v` - The visibility of a layer has changed
 * `l_o` - The opacity of a layer has changed
 * @fires baFeatureSelect {CustomEvent<this>} Fired when one or more features are selected. Use `event.detail` to access the selected `Feature`.
 * @fires baGeometryChange {CustomEvent<this>} Fired when the user creates or modifies a geometry. Use `event.detail` to access its `Geometry`.
 *
 *
 * @author BayernAtlas Development Team
 * @class
 * @extends MvuElement
 */
export class PublicWebComponent extends MvuElement {
	/**
	 * INTERNAL DOC
	 *
	 * A custom web component that embeds an iframe and synchronizes its state with the iframe
	 * using postMessage and attribute mutation observation. Designed for public web embedding scenarios.
	 *
	 * - observes initial setup of its attributes and mutates the s-o-s of the embed iframe via `postMessage()`
	 * - receives s-o-s changes of the iframe sent via `postMessage`, updated its attributes and publish them as events
	 * - provides properties to read the s-o-s of the embed iframe
	 * - provides methods to mutate the s-o-s of the embed iframe
	 *
	 *
	 *
	 * See also {@link PublicWebComponentPlugin}.
	 */
	#configService;
	#environmentService;
	#mapService;
	#iframeUrl;
	#iFrameId = `ba_${createUniqueId().toString()}`;

	#broadcast = (payload) => {
		findAllBySelector(this, 'iframe')[0]?.contentWindow.postMessage({ source: this.#iFrameId, v: '1', ...payload }, '*');
	};
	#passOrFail = (checkFn, msg) => {
		if (!checkFn()) {
			throw new Error(msg);
		}
		return true;
	};

	constructor() {
		super();
		const {
			ConfigService: configService,
			EnvironmentService: environmentService,
			MapService: mapService
		} = $injector.inject('ConfigService', 'EnvironmentService', 'MapService');
		this.#configService = configService;
		this.#environmentService = environmentService;
		this.#mapService = mapService;
	}

	_onReceive(event) {
		if (event.data.target === this.#iFrameId) {
			switch (event.data.v) {
				case '1': {
					for (const property in event.data) {
						// @ts-ignore
						if (WcAttributes.includes(property)) {
							// console.log(`_onReceive: ${property} -> ${event.data[property]}`);
							this.setAttribute(property, event.data[property]);

							// fire corresponding CHANGE event
							if (!event.data.silent) {
								const eventPayload = {};
								eventPayload[property] = event.data[property];
								this.dispatchEvent(
									new CustomEvent(WcEvents.CHANGE, {
										detail: eventPayload
									})
								);
							}

							// @ts-ignore
						} else if (Object.values(WcEvents).includes(property)) {
							// console.log(`_onReceive: ${property} -> ${event.data[property]}`);
							// fire corresponding event
							this.dispatchEvent(
								new CustomEvent(property, {
									detail: event.data[property],
									bubbles: property === WcEvents.LOAD
								})
							);
						}
					}
					break;
				}
				default:
					console.error(`Version ${event.data.v} is not supported`);
			}
		}
	}

	/**
	 * @override
	 * @protected
	 */
	onInitialize() {
		/**
		 * Provide the URL for the Iframe considering existing attributes
		 */
		const queryParameters = {};
		for (const attr of this.attributes) {
			// @ts-ignore
			if (WcAttributes.includes(attr.name)) {
				this._validateAttributeValue(attr);
				queryParameters[attr.name] =
					attr.name === QueryParameters.LAYER
						? attr.value
								.split(',')
								.map((l) => this[l] ?? l)
								.join()
						: attr.value;
			}
		}
		// Handle parameters that need to be set to prevent them from being assigned a default value elsewhere
		if (!queryParameters[QueryParameters.EC_MAP_ACTIVATION]) {
			queryParameters[QueryParameters.EC_MAP_ACTIVATION] = false;
		}
		if (!queryParameters[QueryParameters.EC_LINK_TO_APP]) {
			queryParameters[QueryParameters.EC_LINK_TO_APP] = false;
		}
		this.#iframeUrl = setQueryParams(`${this.#configService.getValueAsPath('FRONTEND_URL')}${PathParameters.EMBED}`, queryParameters);

		/**
		 * Receive messages from the IFrame
		 */
		this.#environmentService.getWindow().parent.addEventListener('message', (event) => this._onReceive(event));
	}

	/**
	 * @override
	 * @protected
	 */
	createView() {
		return html`
			<style>
				${css}
			</style>
			<iframe
				src=${this.#iframeUrl}
				width="100%"
				height="100%"
				loading="lazy"
				frameborder="0"
				style="border:0"
				role="application"
				name=${this.#iFrameId}
			></iframe>
		`;
	}

	_validateAttributeValue(attr) {
		switch (attr.name) {
			case QueryParameters.ZOOM:
				return this.#passOrFail(() => isNumber(attr.value, false), `Attribute "${attr.name}" must be a number`);
			case QueryParameters.CENTER:
				return this.#passOrFail(() => !!fromString(attr.value), `Attribute "${attr.name}" must represent a coordinate (easting, northing)`);
			case QueryParameters.ROTATION:
				return this.#passOrFail(() => isNumber(attr.value, false), `Attribute "${attr.name}" must be a number`);
			case QueryParameters.LAYER:
				return /**No explicit check needed */ true;
			case QueryParameters.LAYER_VISIBILITY:
				if (attr.value?.trim()) {
					attr.value
						.split(',')
						.forEach((v) => this.#passOrFail(() => isBoolean(v, false), `Attribute "${attr.name}" must contain comma-separated boolean values`));
				}
				return true;
			case QueryParameters.LAYER_OPACITY:
				if (attr.value?.trim()) {
					attr.value
						.split(',')
						.forEach((v) =>
							this.#passOrFail(
								() => isNumber(v, false) && parseFloat(v) >= 0 && parseFloat(v) <= 1,
								`Attribute "${attr.name}" must contain comma-separated numbers between 0 and 1`
							)
						);
				}
				return true;

			case QueryParameters.EC_SRID: {
				const validSRIDs = [4326, this.#mapService.getSrid(), this.#mapService.getLocalProjectedSrid()].map((n) => n.toString());
				return this.#passOrFail(() => validSRIDs.includes(attr.value), `Attribute "${attr.name}" must be one of [${validSRIDs.join(',')}]`);
			}
			case QueryParameters.EC_GEOMETRY_FORMAT: {
				const validFormats = [SourceTypeName.EWKT, SourceTypeName.GEOJSON, SourceTypeName.KML, SourceTypeName.GPX];
				return this.#passOrFail(() => validFormats.includes(attr.value), `Attribute "${attr.name}" must be one of [${validFormats.join(',')}]`);
			}
			case QueryParameters.EC_DRAW_TOOL: {
				const validTools = ['point', 'line', 'polygon'];
				return this.#passOrFail(
					() => attr.value.split(',').every((v) => validTools.includes(v)),
					`Attribute "${attr.name}" must only contain one or more values of [${validTools.join(',')}]`
				);
			}
			case QueryParameters.EC_MAP_ACTIVATION: {
				return this.#passOrFail(() => isBoolean(attr.value, false), `Attribute "${attr.name}" must be a boolean`);
			}
			case QueryParameters.EC_LINK_TO_APP: {
				return this.#passOrFail(() => isBoolean(attr.value, false), `Attribute "${attr.name}" must be a boolean`);
			}

			default:
				// we ignore all other attribute candidates
				return false;
		}
	}

	get _iFrameId() {
		return this.#iFrameId;
	}

	static get tag() {
		return 'bayern-atlas';
	}

	static get BROADCAST_THROTTLE_DELAY_MS() {
		return 100;
	}

	/**
	 * Returns the current center coordinate in map projection or in the configured SRID.
	 * Returns `null` if the map is not yet initialized.
	 *
	 * @type {Coordinate|null}
	 * @readonly
	 * @example
	 * const center = map.center; // [11.5, 48.1] in EPSG:4326
	 */
	get center() {
		return fromString(this.getAttribute(QueryParameters.CENTER));
	}

	/**
	 * Returns the current zoom level of the map (0-20).
	 * Returns `null` if the map is not yet initialized.
	 *
	 * @type {number|null}
	 * @readonly
	 * @example
	 * const zoom = map.zoom; // 8
	 */
	get zoom() {
		const z = Number.parseFloat(this.getAttribute(QueryParameters.ZOOM));
		return Number.isNaN(z) ? null : z;
	}

	/**
	 * Returns the rotation of the map in radians.
	 * Returns `null` if the map is not yet initialized.
	 *
	 * @type {number|null}
	 * @readonly
	 * @example
	 * const rotation = map.rotation; // 0.5 (radians)
	 */
	get rotation() {
		const r = Number.parseFloat(this.getAttribute(QueryParameters.ROTATION));
		return Number.isNaN(r) ? null : r;
	}

	/**
	 * Returns the IDs of the currently active layers.
	 * Returns an empty array if the map is not yet initialized.
	 *
	 * @type {Array<string>}
	 * @readonly
	 * @example
	 * const layers = map.layers; // ['atkis', 'custom-layer-123']
	 */
	get layers() {
		return this.getAttribute(QueryParameters.LAYER)?.trim()
			? this.getAttribute(QueryParameters.LAYER)
					?.split(',')
					.filter((v) => !!v)
			: [];
	}

	/**
	 * Returns the visibility state of each layer (true/false).
	 * Returns an empty array if the map is not yet initialized.
	 *
	 * @type {Array<boolean>}
	 * @readonly
	 * @example
	 * const visibility = map.layersVisibility; // [true, false, true]
	 */
	get layersVisibility() {
		return this.getAttribute(QueryParameters.LAYER_VISIBILITY)?.trim()
			? this.getAttribute(QueryParameters.LAYER_VISIBILITY)
					.split(',')
					.map((v) => parseBoolean(v))
			: [];
	}

	/**
	 * Returns the opacity of each layer (0-1).
	 * Returns an empty array if the map is not yet initialized.
	 *
	 * @type {Array<number>}
	 * @readonly
	 * @example
	 * const opacity = map.layersOpacity; // [1, 0.5, 0.8]
	 */
	get layersOpacity() {
		return this.getAttribute(QueryParameters.LAYER_OPACITY)?.trim()
			? this.getAttribute(QueryParameters.LAYER_OPACITY)
					?.split(',')
					.map((v) => parseFloat(v))
			: [];
	}

	/**
	 * Modifies the map view (center, zoom, rotation).
	 * All parameters are optional - only specified properties will be updated.
	 *
	 * @param {View} view - The view configuration to apply
	 * @throws {Error} If zoom, center, or rotation have invalid types
	 * @example
	 * // Change zoom level
	 * map.modifyView({ zoom: 12 });
	 *
	 * @example
	 * // Change center and zoom
	 * map.modifyView({
	 *   center: [11.5, 48.1],
	 *   zoom: 10
	 * });
	 *
	 * @example
	 * // Rotate the map
	 * map.modifyView({ rotation: Math.PI / 4 });
	 */
	modifyView(view = {}) {
		const { zoom, center, rotation } = view;
		if (isDefined(zoom)) {
			this.#passOrFail(() => isNumber(zoom), `"View.zoom" must be a number`);
		}
		if (isDefined(center)) {
			this.#passOrFail(() => isCoordinate(center), `"View.center" must be a coordinate`);
		}
		if (isDefined(rotation)) {
			this.#passOrFail(() => isNumber(rotation), `"View.rotation" must be a number`);
		}
		const payload = {};
		payload[WcMessageKeys.MODIFY_VIEW] = removeUndefinedProperties({ zoom, center, rotation });
		this.#broadcast(payload);
	}

	#validateLayerOptions = (options, optionTypeName) => {
		const { opacity, visible, zIndex, style, displayFeatureLabels } = options;
		if (isDefined(opacity)) {
			this.#passOrFail(() => isNumber(opacity) && opacity >= 0 && opacity <= 1, `"${optionTypeName}.opacity" must be a number between 0 and 1`);
		}
		if (isDefined(visible)) {
			this.#passOrFail(() => isBoolean(visible), `"${optionTypeName}.visible" must be a boolean`);
		}
		if (isDefined(zIndex)) {
			this.#passOrFail(() => isNumber(zIndex), `"${optionTypeName}.zIndex" must be a number`);
		}
		if (isDefined(displayFeatureLabels)) {
			this.#passOrFail(() => isBoolean(displayFeatureLabels), `"${optionTypeName}.displayFeatureLabels" must be a boolean`);
		}
		if (isDefined(style)) {
			this.#passOrFail(() => isHexColor(style.baseColor), `"${optionTypeName}.style.baseColor" must be a valid hex color representation`);
		}
	};

	/**
	 * Modifies an existing layer's properties.
	 * All options are optional - only specified properties will be updated.
	 *
	 * @param {string} layerId - The ID of the layer to modify
	 * @param {ModifyLayerOptions} [options={}] - The modification options
	 * @throws {Error} If layerId is not a string or options have invalid types
	 * @example
	 * // Change layer opacity
	 * map.modifyLayer('my-layer', { opacity: 0.7 });
	 *
	 * @example
	 * // Hide layer and change style
	 * map.modifyLayer('my-layer', {
	 *   visible: false,
	 *   style: { baseColor: '#ff0000' }
	 * });
	 */
	modifyLayer(layerId, options = {}) {
		this.#passOrFail(() => isString(layerId), `"layerId" must be a string`);
		this.#validateLayerOptions(options, 'ModifyLayerOptions');
		const { opacity, visible, zIndex, style, displayFeatureLabels } = options;
		const payload = {};
		payload[WcMessageKeys.MODIFY_LAYER] = {
			id: layerId,
			options: removeUndefinedProperties({ opacity, visible, zIndex, style, displayFeatureLabels })
		};
		this.#broadcast(payload);
	}

	/**
	 * Adds a new layer to the map.
	 * Supports GeoResource IDs, URLs, or raw geospatial data (EWKT, GeoJSON, KML, GPX).
	 *
	 * @param {string} geoResourceIdOrData - GeoResource ID, URL, or data string
	 * @param {AddLayerOptions} [options={}] - Layer configuration options
	 * @returns {string} The ID of the newly created layer
	 * @throws {Error} If parameters have invalid types
	 * @example
	 * // Add a predefined GeoResource
	 * const layerId = map.addLayer(map.GEORESOURCE_AERIAL);
	 *
	 * @example
	 * // Add with custom options
	 * const layerId = map.addLayer(map.GEORESOURCE_TOPOGRAPHIC, {
	 *   opacity: 0.8,
	 *   visible: true,
	 *   layerId: 'my-topo-layer'
	 * });
	 *
	 * @example
	 * // Add GeoJSON data
	 * const layerId = map.addLayer(`{
	 *   "type": "FeatureCollection",
	 *   "features": [...]
	 * }`, {
	 *   zoomToExtent: true
	 * });
	 */
	addLayer(geoResourceIdOrData, options = {}) {
		this.#passOrFail(() => isString(geoResourceIdOrData), `"geoResourceIdOrData" must be a string`);
		const { opacity, visible, zIndex, style, displayFeatureLabels, zoomToExtent, layerId, modifiable } = options;
		if (isDefined(layerId)) {
			this.#passOrFail(() => isString(layerId), `"AddLayerOptions.layerId" must be a string`);
		}
		if (isDefined(zoomToExtent)) {
			this.#passOrFail(() => isBoolean(zoomToExtent), `"AddLayerOptions.zoomToExtent" must be a boolean`);
		}
		if (isDefined(modifiable)) {
			this.#passOrFail(() => isBoolean(modifiable), `"AddLayerOptions.modifiable" must be a boolean`);
		}
		this.#validateLayerOptions(options, 'AddLayerOptions');
		const resultingLayerId = this[layerId] ?? layerId ?? `l_${createUniqueId()}`;
		const payload = {};
		const resolvedGeoResourceIdOrData = this[geoResourceIdOrData] ?? geoResourceIdOrData;
		payload[WcMessageKeys.ADD_LAYER] = {
			id: resultingLayerId,
			geoResourceIdOrData: resolvedGeoResourceIdOrData,
			options: removeUndefinedProperties({ opacity, visible, zIndex, style, displayFeatureLabels, zoomToExtent, modifiable })
		};
		this.#broadcast(payload);
		return resultingLayerId;
	}

	/**
	 * Removes a layer from the map.
	 *
	 * @param {string} layerId - The ID of the layer to remove
	 * @throws {Error} If layerId is not a string
	 * @example
	 * map.removeLayer('my-layer');
	 */
	removeLayer(layerId) {
		this.#passOrFail(() => isString(layerId), `"layerId" must be a string`);
		const payload = {};
		payload[WcMessageKeys.REMOVE_LAYER] = { id: layerId };
		this.#broadcast(payload);
	}

	/**
	 * Zooms the map to fit the specified extent.
	 * The extent coordinates should match the map's current coordinate system.
	 *
	 * @param {Extent} extent - The bounding box to zoom to [minx, miny, maxx, maxy]
	 * @throws {Error} If extent is not a valid Extent array
	 * @example
	 * // Zoom to Bavaria bounds (EPSG:4326)
	 * map.zoomToExtent([9.0, 47.0, 13.8, 50.5]);
	 */
	zoomToExtent(extent) {
		this.#passOrFail(() => isExtent(extent), `"extent" must be a Extent`);
		const payload = {};
		payload[WcMessageKeys.ZOOM_TO_EXTENT] = { extent };
		this.#broadcast(payload);
	}

	/**
	 * Zooms the map to fit the extent of a specific layer.
	 * Only works for layers that have a defined spatial extent.
	 *
	 * @param {string} layerId - The ID of the layer to zoom to
	 * @throws {Error} If layerId is not a string
	 * @example
	 * map.zoomToLayerExtent('my-vector-layer');
	 */
	zoomToLayerExtent(layerId) {
		this.#passOrFail(() => isString(layerId), `"layerId" must be a string`);
		const payload = {};
		payload[WcMessageKeys.ZOOM_TO_LAYER_EXTENT] = { id: layerId };
		this.#broadcast(payload);
	}

	/**
	 * Adds a marker to the map at the specified coordinate.
	 * Markers can be selected by users if they have a label.
	 *
	 * @param {Coordinate} coordinate - The marker position
	 * @param {MarkerOptions} [markerOptions={}] - Marker configuration
	 * @returns {string} The ID of the created marker
	 * @throws {Error} If coordinate is invalid or options have wrong types
	 * @example
	 * // Add a simple marker
	 * const markerId = map.addMarker([11.5, 48.1]);
	 *
	 * @example
	 * // Add a labeled marker
	 * const markerId = map.addMarker([11.5, 48.1], {
	 *   label: 'Munich',
	 *   id: 'munich-marker'
	 * });
	 */
	addMarker(coordinate, markerOptions = {}) {
		const { id, label } = markerOptions;
		this.#passOrFail(() => isCoordinate(coordinate), `"coordinate" must be a Coordinate`);
		if (isDefined(id)) {
			this.#passOrFail(() => isString(id), `"MarkerOptions.id" must be a string`);
		}
		if (isDefined(label)) {
			this.#passOrFail(() => isString(label), `"MarkerOptions.label" must be a string`);
		}
		const markerId = id ?? `m_${createUniqueId()}`;
		const payload = {};
		payload[WcMessageKeys.ADD_MARKER] = { coordinate, options: removeUndefinedProperties({ id: markerId, label }) };
		this.#broadcast(payload);
		return markerId;
	}

	/**
	 * Removes a specific marker from the map.
	 *
	 * @param {string} markerId - The ID of the marker to remove
	 * @throws {Error} If markerId is not a string
	 * @example
	 * map.removeMarker('my-marker');
	 */
	removeMarker(markerId) {
		this.#passOrFail(() => isString(markerId), `"markerId" must be a string`);
		const payload = {};
		payload[WcMessageKeys.REMOVE_MARKER] = { id: markerId };
		this.#broadcast(payload);
	}

	/**
	 * Removes all markers from the map.
	 *
	 * @example
	 * map.clearMarkers();
	 */
	clearMarkers() {
		const payload = {};
		payload[WcMessageKeys.CLEAR_MARKERS] = {};
		this.#broadcast(payload);
	}

	/**
	 * Clears all feature highlights/selection from the map.
	 *
	 * @example
	 * map.clearHighlights();
	 */
	clearHighlights() {
		const payload = {};
		payload[WcMessageKeys.CLEAR_HIGHLIGHTS] = {};
		this.#broadcast(payload);
	}

	/**
	 * Returns the identifier for the default raster base map ("Webkarte").
	 * A general-purpose topographic map suitable for most use cases.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_WEB);
	 */
	get GEORESOURCE_WEB() {
		return 'atkis';
	}
	/**
	 * Returns the identifier for the grayscale raster base map ("Webkarte S/W").
	 * A black and white version of the topographic map.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_WEB_GRAY);
	 */
	get GEORESOURCE_WEB_GRAY() {
		return 'atkis_sw';
	}
	/**
	 * Returns the identifier for the aerial imagery with labels ("Luftbild + Beschriftung").
	 * High-resolution satellite/aerial imagery with overlaid place names and labels.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_AERIAL);
	 */
	get GEORESOURCE_AERIAL() {
		return 'luftbild_labels';
	}
	/**
	 * Returns the identifier for the topographic map ("Topographische Karte").
	 * Detailed topographic mapping with elevation contours and terrain features.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_TOPOGRAPHIC);
	 */
	get GEORESOURCE_TOPOGRAPHIC() {
		return 'tk';
	}
	/**
	 * Returns the identifier for the historic map ("Historische Karte").
	 * Historical topographic mapping showing Bavaria's landscape in earlier times.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_HISTORIC);
	 */
	get GEORESOURCE_HISTORIC() {
		return 'historisch';
	}
	/**
	 * Returns the identifier for the standard vector base map ("Web Vector Standard").
	 * Vector-based topographic mapping with scalable rendering.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_WEB_VECTOR);
	 */
	get GEORESOURCE_WEB_VECTOR() {
		return 'vt_standard';
	}
	/**
	 * Returns the identifier for the grayscale vector base map ("Web Vector Grau").
	 * Monochrome version of the vector topographic map.
	 *
	 * @type {string}
	 * @constant
	 * @readonly
	 * @example
	 * map.addLayer(map.GEORESOURCE_WEB_VECTOR_GRAY);
	 */
	get GEORESOURCE_WEB_VECTOR_GRAY() {
		return 'vt_grau';
	}
}
