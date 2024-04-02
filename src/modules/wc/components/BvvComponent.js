import { html } from '../../../../node_modules/lit-html/lit-html';
import { MvuElement } from '../../MvuElement';

/**
 * Public Web Component, contains the same parts as the Iframe (see embed.html)
 * @author taulinger
 * @class
 */

export class BvvComponent extends MvuElement {
	createView() {
		//same as in embed.html
		return html`
			<ba-ol-map></ba-ol-map>
			<ba-view-larger-map-chip></ba-view-larger-map-chip>
			<ba-draw-tool></ba-draw-tool>
			<ba-map-button-container></ba-map-button-container>
			<ba-footer></ba-footer>
			<ba-nonembedded-hint></ba-nonembedded-hint>
			<ba-theme-provider></ba-theme-provider>
			<ba-notification-panel></ba-notification-panel>
			<ba-map-context-menu></ba-map-context-menu>
			<ba-activate-map-button></ba-activate-map-button>
			<ba-iframe-container></ba-iframe-container>
		`;
	}
	static get tag() {
		return 'bayern-atlas';
	}
}
