import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './mapInfo.css';

/**
 * Demo-Element to show some information and do some action on the map
 * @class
 * @author taulinger
 */
export class MapInfo extends BaElement {
	constructor() {
		super();
	}

	createView() {
		return html`
			<style>
				${css}
			</style>
			<div class="content">
				<div class="base-layer-info">
					<ba-base-layer-info></ba-base-layer-info>
				</div>
				<div class="coordinates">
					<ba-coordinate-select></ba-coordinate-select>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-map-info';
	}
}
