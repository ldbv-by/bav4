/**
 * @module modules/wc/components/PublicWebComponent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './publicWebComponent.css';
import { QueryParameters } from '../../../domain/queryParameters';
import { $injector } from '../../../injection/index';
import { setQueryParams } from '../../../utils/urlUtils';
import { createUniqueId } from '../../../utils/numberUtils';
import { PathParameters } from '../../../domain/pathParameters';
import { WcEvents } from '../../../domain/wcEvents';
import { isBoolean, isCoordinate, isDefined, isExtent, isHexColor, isNumber, isString } from '../../../utils/checks';
import { SourceTypeName } from '../../../domain/sourceType';
import { fromString } from '../../../utils/coordinateUtils';
import { removeUndefinedProperties } from '../../../utils/objectUtils';

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
 * - Attributes are only read initially to declaratively setup the map
 * - Attributes as well as Getter-Properties reflect the current state of the map
 * - Use the methods to programmatically change / modify the map
 *
 * ## Coordinates
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
 *l="luftbild_labels,803da236-15f1-4c97-91e0-73248154d381,c5859de2-5f50-428a-aa63-c14e7543463f"
 *z="8"
 *c="671092,5299670"
 *r="0.5"
 *ec_draw_tool="polygon"
 *ec_srid="25832"
 *ec_geometry_format="ewkt"
 *>
 *</bayern-atlas>
 *
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
 *		zoomToExtent: true ,// If applicable the map should be zoomed to the extent of this layer (boolean, optional)
 *		layerId: "myLayerO" // The id of the layer (string, optional)
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
 * @attribute {string} r - The rotation of the map (in rad). Example: `r="0.5"`.
 * @attribute {string} l - The layers of the map. Example: `l="layer_a,layer_b"`.
 * @attribute {string} ec_srid - Designated SRID of returned coordinates (e.g. of geometries). One of `3857`, `4326` , `25832`. Default is `4326`. Example: `ec_srid="25832"`
 * @attribute {string} ec_geometry_format - Designated Type (format) of returned features. One of `ewkt`, `kml`, `geojson`, `gpx`. Default is `ewkt`.  Example: `ec_geometry_format="geoJson"`.
 * @fires baLoad {CustomEvent<this>} Fired when the BayernAtlas is loaded
 * @fires baChange {CustomEvent<this>} Fired when the state of the BayernAtlas has changed
 * @fires baFeatureSelect {CustomEvent<this>} Fired when one or more features are selected
 * @fires baGeometryChange {CustomEvent<this>} Fired when the user creates or modifies a geometry
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
		this.#environmentService.getWindow().parent.postMessage({ source: this.#iFrameId, v: '1', ...payload }, '*');
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

	/**
	 * @override
	 * @protected
	 */
	isShadowRootOpen() {
		return false;
	}

	_onReceive(event) {
		if (event.data.target === this.#iFrameId) {
			switch (event.data.v) {
				case '1': {
					for (const property in event.data) {
						// @ts-ignore
						if (Object.values(QueryParameters).includes(property)) {
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
			if (Object.values(QueryParameters).includes(attr.name)) {
				this._validateAttributeValue(attr);
				queryParameters[attr.name] = attr.value;
			}
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

			case QueryParameters.EC_SRID: {
				const validSRIDs = [4326, this.#mapService.getSrid(), this.#mapService.getLocalProjectedSrid()].map((n) => n.toString());
				return this.#passOrFail(() => validSRIDs.includes(attr.value), `Attribute "${attr.name}" must be one of [${validSRIDs.join(',')}]`);
			}
			case QueryParameters.EC_GEOMETRY_FORMAT: {
				const validFormats = [SourceTypeName.EWKT, SourceTypeName.GEOJSON, SourceTypeName.KML, SourceTypeName.GPX];
				return this.#passOrFail(() => validFormats.includes(attr.value), `Attribute "${attr.name}" must be one of [${validFormats.join(',')}]`);
			}
		}
		return false;
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
	 * Center coordinate in map projection or in the configured SRID
	 * @type {Array<number>}
	 */
	get center() {
		return fromString(this.getAttribute(QueryParameters.CENTER));
	}

	/**
	 * Zoom level of the map.
	 * @type {number}
	 */
	get zoom() {
		return Number.parseFloat(this.getAttribute(QueryParameters.ZOOM));
	}

	/**
	 * The rotation of the map (in rad)
	 * @type {number}
	 */
	get rotation() {
		return Number.parseFloat(this.getAttribute(QueryParameters.ROTATION));
	}

	/**
	 * The layers of the map
	 * @type {Array<string>}
	 */
	get layers() {
		return this.getAttribute(QueryParameters.LAYER).split(',');
	}

	/**
	 * Modifies a the view of the map.
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
		payload['modifyView'] = removeUndefinedProperties({ zoom, center, rotation });
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
		payload['modifyLayer'] = { id: layerId, options: removeUndefinedProperties({ opacity, visible, zIndex, style, displayFeatureLabels }) };
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
		const { opacity, visible, zIndex, style, displayFeatureLabels, zoomToExtent, layerId } = options;
		if (isDefined(layerId)) {
			this.#passOrFail(() => isString(layerId), `"AddLayerOptions.layerId" must be a string`);
		}
		if (isDefined(zoomToExtent)) {
			this.#passOrFail(() => isBoolean(zoomToExtent), `"AddLayerOptions.zoomToExtent" must be a boolean`);
		}
		this.#validateLayerOptions(options, 'AddLayerOptions');
		const resultingLayerId = layerId ?? `l_${createUniqueId()}`;
		const payload = {};
		payload['addLayer'] = {
			id: resultingLayerId,
			geoResourceIdOrData,
			options: removeUndefinedProperties({ opacity, visible, zIndex, style, displayFeatureLabels, zoomToExtent })
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
		payload['removeLayer'] = { id: layerId };
		this.#broadcast(payload);
	}

	/**
	 * Fits the map to the given extent
	 * @param {Extent} extent The new extent in 4326 (lon, lat) or in 25832
	 */
	zoomToExtent(extent) {
		this.#passOrFail(() => isExtent(extent), `"extent" must be a Extent`);
		const payload = {};
		payload['zoomToExtent'] = { extent };
		this.#broadcast(payload);
	}

	/**
	 * Fits the map to the extent of a layer (if possible)
	 * @param {string} layerId The id of a layer
	 */
	zoomToLayerExtent(layerId) {
		this.#passOrFail(() => isString(layerId), `"layerId" must be a string`);
		const payload = {};
		payload['zoomToLayerExtent'] = { id: layerId };
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
		payload['addMarker'] = { coordinate, options: removeUndefinedProperties({ id: markerId, label }) };
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
		payload['removeMarker'] = { id: markerId };
		this.#broadcast(payload);
	}

	/**
	 * Removes all markers from the map
	 */
	clearMarkers() {
		const payload = {};
		payload['clearMarkers'] = {};
		this.#broadcast(payload);
	}
}
