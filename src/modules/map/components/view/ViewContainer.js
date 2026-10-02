/**
 * @module modules/map/components/view/ViewContainer
 */
import { ViewMode } from '@src/domain/view';
import { MvuElement } from '@src/modules/MvuElement';
import { html } from 'lit-html';

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
		return model.viewMode === ViewMode.D2 ? html`<ba-ol-map></ba-ol-map>` : html`<ba-cs-globe></ba-cs-globe>`;
	}

	static get tag() {
		return 'ba-view-container';
	}
}
