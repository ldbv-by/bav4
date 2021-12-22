import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';

/**
* Container for different types of maps.
* @class
* @author costa_gi
*/
export class MapsContentPanel extends AbstractMvuContentPanel {

	createView() {
		return html`
        <div>
        <ba-base-layer-switcher></ba-base-layer-switcher>
        <ba-layer-manager></ba-layer-manager>
        </div>
        `;
	}

	static get tag() {
		return 'ba-maps-content-panel';
	}
}
