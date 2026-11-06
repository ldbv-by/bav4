/**
 * @module modules/map/components/view/ViewContainer
 */
import { ViewMode } from '@src/domain/view';
import { MvuElement } from '@src/modules/MvuElement';
import { html, nothing } from 'lit-html';
import css from './viewContainer.css?inline';

const Update_View_Mode = 'update_view_mode';

/**
 * Element that renders the component for the current map view.
 * @class
 * @see OlMap
 * @see CsGlobe
 */
export class ViewContainer extends MvuElement {
	constructor() {
		super({
			viewMode: null
		});
	}

	onInitialize() {
		this.observe(
			(state) => state.view.mode,
			(mode) => this.signal(Update_View_Mode, mode)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_View_Mode:
				return { ...model, viewMode: data };
		}
	}

	createView(model) {
		const content = html`<ba-cs-globe></ba-cs-globe>`;
		const chunkName = 'cesium';

		const getContent = () => {
			switch (model.viewMode) {
				case ViewMode.D2:
					return html`<ba-ol-map></ba-ol-map>`;
				case ViewMode.D3:
					return html`<ba-lazy-load .chunkName=${chunkName} .content=${content}></ba-lazy-load>`;
				default:
					return nothing;
			}
		};
		return html` <style>
				${css}
			</style>
			${getContent()}`;
	}

	static get tag() {
		return 'ba-view-container';
	}
}
