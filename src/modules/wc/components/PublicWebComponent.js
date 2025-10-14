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
		for (const mutation of mutationList) {
			if (mutation.type === 'attributes' && Object.values(QueryParameters).includes(mutation.attributeName)) {
				if (mutation.oldValue !== mutation.target.getAttribute(mutation.attributeName)) {
					const payload = { id: this.#iFrameId, v: '1' };
					payload[mutation.attributeName] = mutation.target.getAttribute(mutation.attributeName);
					this.#environmentService.getWindow().parent.postMessage(payload, '*');
				}
			}
		}
	}

	_onReceive(event) {
		if (event.data.id === this.#iFrameId) {
			for (const property in event.data) {
				// @ts-ignore
				if (Object.values(QueryParameters).includes(property)) {
					switch (property) {
						case QueryParameters.ZOOM:
							this.setAttribute(property, event.data[QueryParameters.ZOOM]);
					}

					this.dispatchEvent(
						new CustomEvent('ba-change', {
							detail: event.data
						})
					);
				}
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
			></iframe>
		`;
	}

	static get tag() {
		return 'bayern-atlas';
	}
}
