/**
 * @module modules/commons/components/lazy/LazyLoadWrapper
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
const Update_Loaded = 'update_loaded';

/**
 * Wrapper component for a component which resources should be lazily imported.
 * Uses the webpack dynamic import feature.
 * @class
 * @property {String/TemplateResult} content The (configured) component displayed after its resources are available
 * @property {String} chunkName The chunk name of the js resource which should be dynamically be imported (see `.src/chunks`)
 * @author taulinger
 */
export class LazyLoadWrapper extends MvuElement {
	#content;
	#chunkName;
	constructor() {
		super({
			loaded: false
		});
	}

	onInitialize() {
		if (this.#chunkName) {
			// see https://webpack.js.org/guides/code-splitting/#dynamic-imports
			// eslint-disable-next-line promise/prefer-await-to-then
			import(/* webpackChunkName: "[request]" */ `@chunk/${this.#chunkName}`).then(() => {
				this.signal(Update_Loaded, true);
			});
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_Loaded:
				return { ...model, loaded: data };
		}
	}

	createView(model) {
		const { loaded } = model;
		return loaded ? html`${this.#content}` : html`<ba-spinner></ba-spinner>`;
	}

	set content(value) {
		this.#content = value;
	}

	set chunkName(value) {
		this.#chunkName = value;
	}

	static get tag() {
		return 'ba-lazy-load';
	}
}
