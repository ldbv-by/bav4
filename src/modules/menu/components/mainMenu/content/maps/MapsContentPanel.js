/**
 * @module modules/menu/components/mainMenu/content/maps/MapsContentPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './mapsContentPanel.css';

/**
 * Container for different types of maps.
 * @class
 * @author costa_gi
 */
export class MapsContentPanel extends AbstractMvuContentPanel {
	createView() {
		return html`
			<style>
				${css}
			</style>
			<div>
				<ba-base-layer-container></ba-base-layer-container>
				<ba-layer-manager></ba-layer-manager>
			</div>
		`;
	}

	static get tag() {
		return 'ba-maps-content-panel';
	}
}
