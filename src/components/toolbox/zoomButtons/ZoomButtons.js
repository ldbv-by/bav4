import { html } from 'lit-html';
import BaElement from '../../BaElement';
import './style.css';
import { increaseZoom, decreaseZoom } from '../../../store/map/actions';

/**
 * Buttons which change the zoom level of the map.
 * @class
 * @author aul
 */
export class ZoomButtons extends BaElement {



	createView() {

		return html`
        <div class="zoom-buttons">
            <a class="button" @click="${increaseZoom}"><span class="icon zoom-in"></a>
            <a class="button" @click="${decreaseZoom}">  <span class="icon zoom-out"></a>
        </div>
        `;
	}

	static get tag() {
		return 'ba-zoom-buttons';
	}
}