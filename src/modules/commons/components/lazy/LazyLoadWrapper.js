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
			// see https://vite.dev/guide/features#dynamic-import

			//	import(`@chunk/${this.#chunkName}.js`).then(() => {
			//			this.signal(Update_Loaded, true);
			//		});

			/* NOTE: The following is the way how you use dynamic imports in webpack
			 * since this has side effects with entryPointsAndChunks.spec.js it is used to ensure that git pipeline
			 * builds.
			 *
			 * When using vite/vitest the lines above should be commented out instead...
			 * Finally, the LazyLoadWrapper.test.js in vitest folder will fail as long as the above line is commented out.
			 */

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
