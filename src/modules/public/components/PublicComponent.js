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
		 * Publish public GEOMETRY_CHANGE event
		 */
		this.observe(
			(state) => state.draw.fileSaveResult,
			(fileSaveResult) => {
				const { payload } = fileSaveResult;
				this.dispatchEvent(
					new CustomEvent(WcEvents.GEOMETRY_CHANGE, {
						detail: payload ? { data: payload.content, type: MediaType.KML } : null,
						bubbles: true,
						composed: true
					})
				);
			},
			false
		);
		/**
		 * Publish public FEATURE_SELECT event
		 */
		this.observe(
			(state) => state.featureInfo.coordinate,
			() => {
				const unsubscribe = this.observe(
					(state) => state.featureInfo.querying,
					(querying, state) => {
						//untestable else path cause function is self-removing
						/* istanbul ignore else */
						if (!querying) {
							const items = [...state.featureInfo.current]
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
							unsubscribe();
						}
					},
					false
				);
			},
			false
		);
	}

	createView() {
		//must be the same as in embed.html
		return html`
			<ba-dnd-import-panel></ba-dnd-import-panel>
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
