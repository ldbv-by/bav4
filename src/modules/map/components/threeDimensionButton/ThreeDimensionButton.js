/**
 * @module modules/map/components/threeDimensionButton/ThreeDimensionButton
 */
import { html } from 'lit-html';

import css from './threeDimensionButton.css?inline';
import { MvuElement } from '../../../MvuElement';
import { setViewMode } from '@src/store/view/view.action';
import { ViewMode } from '@src/domain/view';
import { $injector } from '@src/injection';

const Update_View_Mode = 'update_view_mode';

/**
 * Button that toggles the ViewMode between 2D and 3D
 * @class
 * @author alsturm
 * @author taulinger
 */

export class ThreeDimensionButton extends MvuElement {
	#translationService;
	constructor() {
		super({
			viewMode: null
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this.#translationService = TranslationService;
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
		const { viewMode } = model;
		const translate = (key) => this.#translationService.translate(key);

		const onClick = () => {
			setViewMode(viewMode === ViewMode.D2 ? ViewMode.D3 : ViewMode.D2);
		};

		const getIs3DActive = () => {
			return viewMode === ViewMode.D3 ? 'is-active-three-dimension' : '';
		};

		const getTitle = () => {
			return viewMode === ViewMode.D3 ? translate('map_threeDimensionButton_title_3d') : translate('map_threeDimensionButton_title_2d');
		};
		return html`
			<style>
				${css}
			</style>
			<div>
				<button @click=${onClick} class="three-dimension-button ${getIs3DActive()}" title=${getTitle()}>
					<i class="icon three-dimension-icon"></i>
				</button>
			</div>
		`;
	}
	static get tag() {
		return 'ba-three-dimension-button';
	}
}
