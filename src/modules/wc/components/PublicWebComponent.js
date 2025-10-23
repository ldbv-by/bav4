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

/**
 * A custom web component that embeds an iframe and synchronizes its state with the iframe
 * using postMessage and attribute mutation observation. Designed for public web embedding scenarios.
 *
 * - observes mutations of its attributes and mutates the s-o-s of the embed iframe via `postMessage()`
 * - receives s-o-s changes of the iframe sent via `postMessage`, updated its attributes  and publish them as events
 * - provides methods to mutate the s-o-s of the embed iframe
 *
 * See also {@link PublicWebComponentPlugin}.
 *
 * @fires ba-change The `ba-change` when state of the `<bayern-atlas` has changed
 * @author taulinger
 * @class
 */
export class PublicWebComponent extends MvuElement {
	#configService;
	#environmentService;
	#iframeUrl;
	#iFrameId = `ba_${createUniqueId().toString()}`;

	constructor() {
		super();
		const { ConfigService: configService, EnvironmentService: environmentService } = $injector.inject('ConfigService', 'EnvironmentService');
		this.#configService = configService;
		this.#environmentService = environmentService;
	}

	/**
	 * @override
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
				if (!equals(mutation.oldValue, mutation.target.getAttribute(mutation.attributeName))) {
					// console.log(`_broadcastAttributeChanges: ${mutation.oldValue} <-> ${mutation.target.getAttribute(mutation.attributeName)}`);
					const payload = { source: this.#iFrameId, v: '1' };
					payload[mutation.attributeName] = mutation.target.getAttribute(mutation.attributeName);
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

							// fire event corresponding event
							const eventPayload = {};
							eventPayload[property] = event.data[property];
							this.dispatchEvent(
								new CustomEvent('ba-change', {
									detail: eventPayload
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

	onInitialize() {
		/**
		 * Provide the URL for the Iframe considering existing attributes
		 */
		const queryParameters = {};
		for (const attr of this.attributes) {
			// @ts-ignore
			if (Object.values(QueryParameters).includes(attr.name)) {
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

	get _iFrameId() {
		return this.#iFrameId;
	}

	static get tag() {
		return 'bayern-atlas';
	}

	static get BROADCAST_THROTTLE_DELAY_MS() {
		return 100;
	}
}
