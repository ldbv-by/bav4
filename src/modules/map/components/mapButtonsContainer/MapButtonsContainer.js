import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './mapButtonsContainer.css';

/**
 * Container for Map-Buttons
 * @class
 * @author alsturm
 */

export class MapButtonsContainer extends MvuElement {


	/**
	 *@override
	 */
	createView() {
		return html`
            <style>${css}</style>
            <div class="map-buttons-container">
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
