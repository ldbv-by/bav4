/**
 * @module modules/public/components/PublicComponent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { WcEvents } from '../../../domain/wcEvents';
import { MediaType } from '../../../domain/mediaTypes';

/**
 * Public Web Component, should contain always the same components as the Iframe (see embed.html)
 * @author taulinger
 * @class
 */

export class PublicComponent extends MvuElement {
	isShadowRootOpen() {
		return false;
	}

	onInitialize() {
		/**
		 * Publish public events
		 */
		this.observe(
			(state) => state.draw.fileSaveResult,
			(fileSaveResult) => {
				const { payload } = fileSaveResult;
				if (payload) {
					this.dispatchEvent(
						new CustomEvent(WcEvents.GEOMETRY_CREATE, {
							detail: { data: payload.content, type: MediaType.KML },
							bubbles: true,
							composed: true
						})
					);
				}
			}
		);
		this.observe(
			(state) => state.featureInfo.querying,
			(querying, state) => {
				if (!querying.payload && state.featureInfo.current.length > 0) {
					const items = state.featureInfo.current
						.filter((item) => item.geometry)
						.map((item) => ({
							title: item.title,
							data: item.geometry,
							type: MediaType.GeoJSON
						}));
					this.dispatchEvent(
						new CustomEvent(WcEvents.FEATURE_SELECT, {
							detail: { items, coordinate: state.featureInfo.coordinate.payload },
							bubbles: true,
							composed: true
						})
					);
				}
			}
		);
	}

	createView() {
		//must be same as in embed.html
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
