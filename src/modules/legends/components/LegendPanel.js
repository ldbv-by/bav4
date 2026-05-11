/**
 * @module modules/featureInfo/components/featureInfoPanel/FeatureInfoPanel
 */
import { $injector } from '@src/injection';
import { AbstractMvuContentPanel } from '@src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

/**
 * @class
 * @author herrmutig
 */
export class LegendPanel extends AbstractMvuContentPanel {
	constructor() {
		super({
			featureInfoData: [],
			isPortrait: false,
			isQuerying: false
		});
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		console.log('LEGEND');
		return html`<h1>TEST</h1>`;
	}

	static get tag() {
		return 'ba-legend-panel';
	}
}
