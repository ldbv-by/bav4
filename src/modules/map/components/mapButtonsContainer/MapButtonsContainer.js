import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './mapButtonsContainer.css';

/**
 * Container for Map-Buttons
 * @class 
 *@author alsturm 
 */

export class MapButtonsContainer extends BaElement {

	constructor() {
		super();
	} 

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
				<ba-info-button></ba-info-button>              
            </div>			            
        `;
	} 

	static get tag() {
		return 'ba-map-button-container';
	} 
} 