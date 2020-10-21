import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import BaElement from '../../BaElement';
import './sidePanel.css';
import { closeSidePanel } from './store/sidePanel.action';

/**
 *  
 * @class
 * @author aul
 */
export class SidePanel extends BaElement {


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
		const { sidePanel: { open } } = store;
		return { open };
	}

	static get tag() {
		return 'ba-side-panel';
	}
}
