/**
 * @module modules/menu/components/mainMenu/content/maps/MapsContentPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './mapsContentPanel.css';

const Update_Media_Related_Properties = 'update_isPortrait';
/**
 * Container for different types of map configuration panels.
 * @class
 * @author costa_gi
 */
export class MapsContentPanel extends AbstractMvuContentPanel {
	constructor() {
		super({
			isPortrait: false
		});
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_Media_Related_Properties, { isPortrait: media.portrait })
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Media_Related_Properties:
				return { ...model, ...data };
		}
	}

	createView(model) {
		const { isPortrait } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};
		return html`
			<style>
				${css}
			</style>
			<div class="${getOrientationClass()}">
				<ba-base-layer-container></ba-base-layer-container>
				<ba-layer-manager></ba-layer-manager>
			</div>
		`;
	}

	static get tag() {
		return 'ba-maps-content-panel';
	}
}
