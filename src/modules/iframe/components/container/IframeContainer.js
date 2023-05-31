/**
 * @module modules/iframe/components/container/IframeContainer
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './iframeContainer.css';

const Update_Modal_Data = 'update_modal_data';

/**
 * Container component displayed within the iframe.
 *  @author taulinger
 */
export class IframeContainer extends MvuElement {
	constructor() {
		super({
			content: null,
			active: false
		});

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(
			(state) => state.iframeContainer,
			(modal) => this.signal(Update_Modal_Data, modal)
		);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Modal_Data:
				return { ...model, content: data.content, active: data.active };
		}
	}
	/**
	 * @override
	 */
	createView(model) {
		const { active, content } = model;

		if (active) {
			return html`
				<style>
					${css}
				</style>
				<div class="container">${content}</div>
			`;
		}
		return nothing;
	}

	/**
	 * @override
	 */
	isRenderingSkipped() {
		return !this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-iframe-container';
	}
}
