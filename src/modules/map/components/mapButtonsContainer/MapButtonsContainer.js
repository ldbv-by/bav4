/**
 * @module modules/map/components/mapButtonsContainer/MapButtonsContainer
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapButtonsContainer.css';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';

/**
 * Container for Map-Buttons
 * @class
 * @author alsturm
 */

export class MapButtonsContainer extends MvuElement {
	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false
		});

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		this._environmentService = environmentService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
	}

	/**
	 *@override
	 */
	createView(model) {
		const { isPortrait, hasMinWidth } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const isEmbedded = () => {
			return this._environmentService.isEmbedded() ? 'is-embedded' : '';
		};

		return html`
			<style>
				${css}
			</style>
			<div class="map-buttons-container ${getOrientationClass()} ${getMinWidthClass()} ${isEmbedded()}">
				<ba-rotation-button></ba-rotation-button>
				<ba-geolocation-button></ba-geolocation-button>
				<ba-zoom-buttons></ba-zoom-buttons>
				<ba-extent-button></ba-extent-button>
			</div>
		`;
	}

	static get tag() {
		return 'ba-map-button-container';
	}
}
