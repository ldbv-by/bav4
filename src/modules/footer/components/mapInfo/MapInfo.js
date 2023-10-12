/**
 * @module modules/footer/components/mapInfo/MapInfo
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './mapInfo.css';

/**
 * Container for child components.
 * @class
 * @author taulinger
 */
export class MapInfo extends MvuElement {
	createView() {
		return html`
			<style>
				${css}
			</style>
			<div class="content selectable">
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
