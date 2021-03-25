import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './mapInfo.css';



/**
 * Demo-Element to show some information and do some action on the map
 * @class 
 * @author aul
 */
export class MapInfo extends BaElement {


	constructor() {
		super();
	}

	createView() {

		return html`
			<style>${css}</style>
			<div class='content'>
				<div class='theme-toggle'><ba-theme-toggle></ba-theme-toggle></div> 
				<div class='right-container'>
					<div class='coordinates'>
						<ba-coordinate-select></ba-coordinate-select>
					</div>
					<div class='geo-rsrc-info'>
						<ba-georesource-info></ba-georesource-info>
					</div>
				</div>				
			</div>
		`;
	}

	static get tag() {
		return 'ba-map-info';
	}
}
