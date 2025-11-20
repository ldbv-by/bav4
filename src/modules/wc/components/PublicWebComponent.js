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
import { equals } from '../../../utils/storeUtils';
import { throttled } from '../../../utils/timer';
import { isNumber } from '../../../utils/checks';
import { SourceTypeName } from '../../../domain/sourceType';
import { fromString } from '../../../utils/coordinateUtils';

/**
 * A WebComponent that embeds the BayernAtlas in your page.
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
 *
 * @attribute {string} c - The Center coordinate (longitude,latitude / easting,northing) in map projection or in the configured SRID (see `ec_srid`). Example: `11,48`
 * @attribute {string} z - The Zoom level (0-20) of the map. Example: `8`.
 * @attribute {string} r - The rotation of the map (in rad). Example: `0.5`.
 * @attribute {string} l - The layers of the map. Example: `layer_a,layer_b`.
 * @fires ba-load Fired when the BayernAtlas is loaded
 * @fires ba-change Fired when state of the BayernAtlas has changed
 * @fires ba-feature-select Fired when state of the BayernAtlas has changed
 * @fires ba-geometry-change Fired when state of the BayernAtlas has changed
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
	 * - observes mutations of its attributes and mutates the s-o-s of the embed iframe via `postMessage()`
	 * - receives s-o-s changes of the iframe sent via `postMessage`, updated its attributes  and publish them as events
	 * - provides methods to mutate the s-o-s of the embed iframe
	 *
	 * See also {@link PublicWebComponentPlugin}.
	 */
	#configService;
	#environmentService;
	#mapService;
	#iframeUrl;
	#iFrameId = `ba_${createUniqueId().toString()}`;

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

	_broadcastAttributeChanges(mutationList) {
		const broadcastThrottled = throttled(PublicWebComponent.BROADCAST_THROTTLE_DELAY_MS, (payload) => {
			this.#environmentService.getWindow().parent.postMessage(payload, '*');
		});

		for (const mutation of mutationList) {
			if (mutation.type === 'attributes' && Object.values(QueryParameters).includes(mutation.attributeName)) {
				const newValue = mutation.target.getAttribute(mutation.attributeName);
				if (!equals(mutation.oldValue, newValue)) {
					// console.log(`_broadcastAttributeChanges: ${mutation.oldValue} <-> ${mutation.target.getAttribute(mutation.attributeName)}`);
					const payload = { source: this.#iFrameId, v: '1' };
					payload[mutation.attributeName] = newValue;
					this._validateAttributeValue({ name: mutation.attributeName, value: newValue });
					broadcastThrottled(payload);
				}
			}
		}
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
									detail: event.data[property]
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
		 * Observe mutations of the attributes and broadcast them
		 */
		setTimeout(() => {
			const config = { attributes: true, attributeOldValue: true, childList: false, subtree: false };
			const observer = new MutationObserver((mutationList) => this._broadcastAttributeChanges(mutationList));
			observer.observe(this, config);
		});

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
				@load=${() => this.dispatchEvent(new CustomEvent(WcEvents.LOAD, { bubbles: true }))}
			></iframe>
		`;
	}

	_validateAttributeValue(attr) {
		const passOrFail = (checkFn, msg) => {
			if (!checkFn()) {
				throw new Error(msg);
			}
			return true;
		};

		switch (attr.name) {
			case QueryParameters.ZOOM:
				return passOrFail(() => isNumber(attr.value, false), `Attribute "${attr.name}" must be a number`);
			case QueryParameters.CENTER:
				return passOrFail(() => !!fromString(attr.value), `Attribute "${attr.name}" must represent a coordinate (easting, northing)`);
			case QueryParameters.ROTATION:
				return passOrFail(() => isNumber(attr.value, false), `Attribute "${attr.name}" must be a number`);
			case QueryParameters.LAYER:
				return /**No explicit check needed */ true;

			case QueryParameters.EC_SRID: {
				const validSRIDs = [4326, this.#mapService.getSrid(), this.#mapService.getLocalProjectedSrid()].map((n) => n.toString());
				return passOrFail(() => validSRIDs.includes(attr.value), `Attribute "${attr.name}" must be one of [${validSRIDs.join(',')}]`);
			}
			case QueryParameters.EC_GEOMETRY_FORMAT: {
				const validFormats = [SourceTypeName.EWKT, SourceTypeName.GEOJSON, SourceTypeName.KML, SourceTypeName.GPX];
				return passOrFail(() => validFormats.includes(attr.value), `Attribute "${attr.name}" must be one of [${validFormats.join(',')}]`);
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
	set center(center) {
		this.setAttribute(QueryParameters.CENTER, center.join(','));
	}

	/**
	 * Zoom level of the map.
	 * @type {number}
	 */
	get zoom() {
		return Number.parseFloat(this.getAttribute(QueryParameters.ZOOM));
	}
	set zoom(zoom) {
		this.setAttribute(QueryParameters.ZOOM, zoom.toString());
	}

	/**
	 * The rotation of the map (in rad)
	 * @type {number}
	 */
	get rotation() {
		return Number.parseFloat(this.getAttribute(QueryParameters.ROTATION));
	}
	set rotation(rotation) {
		this.setAttribute(QueryParameters.ROTATION, rotation.toString());
	}

	/**
	 * The layers of the map
	 * @type {Array<string>}
	 */
	get layers() {
		return this.getAttribute(QueryParameters.LAYER).split(',');
	}
	set layers(layer) {
		this.setAttribute(QueryParameters.LAYER, Array.isArray(layer) ? layer.join(',') : layer);
	}
}
