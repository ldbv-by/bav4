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
 */
/**
 * @event baChange
 * @type {CustomEvent}
 * @property {object} detail The new or updated entry (key/value)
 */
/**
 * @event baGeometryChange
 * @type {CustomEvent}
 * @property {module:modules/wc/components/PublicWebComponent~BaWcGeometry} detail The newly created or updated geometry
 */
/**
 * @event baFeatureSelect
 * @type {CustomEvent}
 * @property {Array<module:modules/wc/components/PublicWebComponent~BaWcFeature>} detail The selected features
 */
/**
 * @typedef BaWcFeature
 * @property {string} label The label of the feature
 * @property {object} properties The properties of the feature
 * @property {module:modules/wc/components/PublicWebComponent~BaWcGeometry} geometry The geometry of the feature
 */
/**
 * @typedef BaWcGeometry
 * @property {string} type The type of the geometry
 * @property {number} srid The srid of the geometry
 * @property {string} data The data of the geometry
 */

/**
 * A WebComponent that embeds the BayernAtlas in your page.
 *
 * ## API philosophy
 *
 * - In order to declaratively setup the map you can use **attributes**  which are initially read
 * - **Attributes** as well as **Getter-Properties** reflect the current state of the map
 * - Use the **methods** to programmatically change / modify the map
 *
 * ## Coordinates and reference systems
 * - The map can take coordinates in both the 4326 and 25832 reference systems (default is 4326)
 * - The map itself can output coordinates in different reference systems (default is 4326). See `ec_srid` attribute for more information
 *
 * @example //A simple example
 *
 * <bayern-atlas></bayern-atlas>
 *
 * @example //A more complex example
 *
 * <bayern-atlas
 *l="GEORESOURCE_AERIAL,803da236-15f1-4c97-91e0-73248154d381,c5859de2-5f50-428a-aa63-c14e7543463f"
 *z="8"
 *c="671092,5299670"
 *r="0.5"
 *ec_draw_tool="polygon"
 *ec_srid="25832"
 *ec_geometry_format="ewkt"
 *>
 *</bayern-atlas>
 *
 *<script>
 *	document.querySelector('bayern-atlas')
 *			.addEventListener('baLoad', (event) => {  // register a load-event listener on the map
 *		 		// save to call the bayern-atlas map now
 *				const baMap = event.target;
 *				// position the map
 *				baMap.modifyView({ zoom: 10, center: [11, 48] });
 * 			});
 *</script>
 * @example
 *
 * // Defines the center, resolution, and rotation of the map
 * View {
 *		zoom: 4, // The new number zoom level of the map (number, optional)
 *		center: [1286733,039367 6130639,596329], // The new center coordinate in 4326 (lon, lat) or in 25832 (Coordinate, optional)
 *		rotation: 0.5 // The new rotation pf the map in rad (number, optional)
 * }
 *
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
 * ModifyLayerOptions {
 *		opacity: 1, // Opacity (number, 0, 1, optional)
 *		visible: true,  // Visibility (boolean, optional)
 *		zIndex: 0,  // Index of this layer within the list of active layers. When not set, the layer will be appended at the end (number, optional)
 *		style: { baseColor: "#fcba03" },  // If applicable the style of this layer (Style, optional),
 *		displayFeatureLabels: true // If applicable labels of features should be displayed (boolean, optional)
 * }
 *
 * Style {
 * 		baseColor: #fcba03 //A simple base color as style for this layer (seven-character hexadecimal notation) or `null`
 * }
 *
 * Coordinate // An array of two numbers representing an XY coordinate. Ordering is [easting, northing] or [lon, lat]. Example: `[16, 48]`.
 *
 * Extent // An array of four numbers representing an extent: `[minx, miny, maxx, maxy]`.
 *
 * MarkerOptions {
 * 	id: "myMarker0", // The id of the marker (string, optional). When no ID is given a random ID will be generated
 * 	label: "My label" // The label of the marker (string, optional). Must be set if the marker should be selectable by the user
 * }
 *
 * @attribute {string} c - The Center coordinate (longitude,latitude / easting,northing) in `4326` (lon, lat) or in `25832`. Example: `c="11,48"`
 * @attribute {string} z - The Zoom level (0-20) of the map. Example: `z="8"`.
 * @attribute {number} r - The rotation of the map (in rad). Example: `r="0.5"`.
 * @attribute {string} l - The layers of the map. Example: `l="layer_a,layer_b"`.
 * @attribute {string} l_v - The visibility of the layers of the map. Example: `l_v="true,false"`.
 * @attribute {string} l_o - The opacity of the layers of the map. Example: `l_o="1,0.5"`.
 * @attribute {string} ec_srid - Designated SRID of returned coordinates (e.g. of geometries). One of `3857`, `4326` , `25832`. Default is `4326`. Example: `ec_srid="25832"`
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
 * @fires baFeatureSelect {CustomEvent<this>} Fired when one or more features are selected.
 * See `event.detail` for the payload of the event.
 * @fires baGeometryChange {CustomEvent<this>} Fired when the user creates or modifies a geometry.
 * See `event.detail` for the payload of the event.
 * @author taulinger
 * @class
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
				attr.value
					.split(',')
					.forEach((v) => this.#passOrFail(() => isBoolean(v, false), `Attribute "${attr.name}" must contain comma-separated boolean values`));
				return true;
			case QueryParameters.LAYER_OPACITY:
				attr.value
					.split(',')
					.forEach((v) =>
						this.#passOrFail(
							() => isNumber(v, false) && parseFloat(v) >= 0 && parseFloat(v) <= 1,
							`Attribute "${attr.name}" must contain comma-separated numbers between 0 and 1`
						)
					);
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
	 * @type {Array<number>|null}
	 */
	get center() {
		return fromString(this.getAttribute(QueryParameters.CENTER));
	}

	/**
	 * Returns the current zoom level of the map or `null` if the map is not yet initialized.
	 *
	 * @type {number|null}
	 */
	get zoom() {
		const z = Number.parseFloat(this.getAttribute(QueryParameters.ZOOM));
		return Number.isNaN(z) ? null : z;
	}

	/**
	 * Returns the rotation of the map (in rad) or `null` if the map is not yet initialized.
	 *
	 * @type {number|null}
	 */
	get rotation() {
		const r = Number.parseFloat(this.getAttribute(QueryParameters.ROTATION));
		return Number.isNaN(r) ? null : r;
	}

	/**
	 * Returns the IDs of the layers of the map or. Returns `[]` if the map is not yet initialized.
	 *
	 * @type {Array<string>}
	 */
	get layers() {
		return (
			this.getAttribute(QueryParameters.LAYER)
				?.split(',')
				.filter((v) => !!v) ?? []
		);
	}

	/**
	 * Returns the visibility of the layers of the map or `[]` if the map is not yet initialized.
	 *
	 * @type {Array<boolean>}
	 */
	get layersVisibility() {
		return (
			this.getAttribute(QueryParameters.LAYER_VISIBILITY)
				?.split(',')
				.map((v) => parseBoolean(v)) ?? []
		);
	}

	/**
	 * Returns the opacity of the layers of the map or `[]` if the map is not yet initialized.
	 *
	 * @type {Array<number>}
	 */
	get layersOpacity() {
		return (
			this.getAttribute(QueryParameters.LAYER_OPACITY)
				?.split(',')
				.map((v) => parseFloat(v)) ?? []
		);
	}

	/**
	 * Modifies the view of the map.
	 * @param {View} view The new view of the map
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
	 * Modifies a layer of the map.
	 * @param {string} layerId The id of a layer
	 * @param {ModifyLayerOptions} options ModifyLayerOptions
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
	 * Adds a new Layer to the map. <b>Returns the id of the added layer.</b>
	 * @param {string} geoResourceIdOrData The id of a GeoResource, the URL-pattern denoting an external GeoResource or the (vector) data as string (`EWKT`, `GeoJSON`, `KML`, `GPX`)
	 * @param {AddLayerOptions} options AddLayerOptions
	 * @returns The id of the newly created layer
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
	 * @param {string} layerId The id of a layer
	 */
	removeLayer(layerId) {
		this.#passOrFail(() => isString(layerId), `"layerId" must be a string`);
		const payload = {};
		payload[WcMessageKeys.REMOVE_LAYER] = { id: layerId };
		this.#broadcast(payload);
	}

	/**
	 * Fits the map to the given extent
	 * @param {Extent} extent The new extent in 4326 (lon, lat) or in 25832
	 */
	zoomToExtent(extent) {
		this.#passOrFail(() => isExtent(extent), `"extent" must be a Extent`);
		const payload = {};
		payload[WcMessageKeys.ZOOM_TO_EXTENT] = { extent };
		this.#broadcast(payload);
	}

	/**
	 * Fits the map to the extent of a layer (if possible)
	 * @param {string} layerId The id of a layer
	 */
	zoomToLayerExtent(layerId) {
		this.#passOrFail(() => isString(layerId), `"layerId" must be a string`);
		const payload = {};
		payload[WcMessageKeys.ZOOM_TO_LAYER_EXTENT] = { id: layerId };
		this.#broadcast(payload);
	}

	/**
	 * Adds a marker to the map
	 * @param {Coordinate} coordinate The coordinate of the marker in 4326 (lon, lat) or in 25832 (Coordinate)
	 * @param {MarkerOptions} markerOptions MarkerOptions
	 * @returns The id of the marker
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
	 * Removes a marker.
	 * @param {string} markerId
	 */
	removeMarker(markerId) {
		this.#passOrFail(() => isString(markerId), `"markerId" must be a string`);
		const payload = {};
		payload[WcMessageKeys.REMOVE_MARKER] = { id: markerId };
		this.#broadcast(payload);
	}

	/**
	 * Removes all markers from the map
	 */
	clearMarkers() {
		const payload = {};
		payload[WcMessageKeys.CLEAR_MARKERS] = {};
		this.#broadcast(payload);
	}

	/**
	 * Removes all highlights from the map
	 */
	clearHighlights() {
		const payload = {};
		payload[WcMessageKeys.CLEAR_HIGHLIGHTS] = {};
		this.#broadcast(payload);
	}

	/**
	 * Returns the identifier (GeoResource ID) for the default raster image map (`"Webkarte"`)
	 */
	get GEORESOURCE_WEB() {
		return 'atkis';
	}
	/**
	 * Returns the identifier (GeoResource ID) for the grayscale raster image map (`"Webkarte S/W"`)
	 */
	get GEORESOURCE_WEB_GRAY() {
		return 'atkis_sw';
	}
	/**
	 * Returns the identifier (GeoResource ID) for the arial image with labels (`"Luftbild + Beschriftung"`)
	 */
	get GEORESOURCE_AERIAL() {
		return 'luftbild_labels';
	}
	/**
	 * Returns the identifier (GeoResource ID) for the topographic aster image map (`"Topographische Karte"`)
	 */
	get GEORESOURCE_TOPOGRAPHIC() {
		return 'tk';
	}
	/**
	 * Returns the identifier (GeoResource ID) for the historic map (`"Historische Karte"`)
	 */
	get GEORESOURCE_HISTORIC() {
		return 'historisch';
	}
	/**
	 * Returns the identifier (GeoResource ID) for the default vector data map (`"Web Vector Standard"`)
	 */
	get GEORESOURCE_WEB_VECTOR() {
		return 'vt_standard';
	}
	/**
	 * Returns the identifier (GeoResource ID) for the grayscale vector data map (`"Web Vector Grau"`)
	 */
	get GEORESOURCE_WEB_VECTOR_GRAY() {
		return 'vt_grau';
	}
}
