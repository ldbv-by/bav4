import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import BaElement from '../BaElement';
import './style.css';
import { closeSidePanel } from '../../store/ui/actions';

/**
 *  
 * @class
 * @author aul
 */
export class SidePanelElement extends BaElement {


	createView() {

		const { open } = this.state;

		const styles = {
			width: open ? '410px' : '0px'
		};
        
		return html`
            <div class="sidePanel overlay" style=${styleMap(styles)} >
				<a @click="${closeSidePanel}" title="Close menue"><span class="icon close"></a>
				
                <!-- Overlay content -->
                <div class="overlay-content">
					#content
                </div>
            </div>
        `;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { ui: { sidePanel: { open } } } = store;
		return { open };
	}

	static get tag() {
		return 'ba-side-panel';
	}
}