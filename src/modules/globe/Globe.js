/**
 * @module modules/olMap/components/OlMap
 */
import { html } from 'lit-html';
import { MvuElement } from '@src/modules/MvuElement';
import cesiumWidgetCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';
import { Terrain, Viewer } from 'cesium';

/**
 * Element which renders the ol map.
 * @class
 * @author herrmutig
 */
export class Globe extends MvuElement {
	constructor() {
		super({});
	}

	/**
	 * @override
	 */
	update(type, data, model) {}

	/**
	 * @override
	 */
	createView() {
		return html`
			<style>
				${cesiumWidgetCss}
			</style>
			<div id="cesium-container"></div>
		`;
	}

	/**
	 * @override
	 */
	onInitialize() {}

	/**
	 * @override
	 */
	onDisconnect() {}

	/**
	 * @override
	 */
	onModelChanged() {
		//nothing to do here
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			// @ts-ignore
			const viewerContainer = this.shadowRoot.getElementById('cesium-container');
			// @ts-ignore
			new Viewer(viewerContainer, {
				terrain: Terrain.fromWorldTerrain()
			});
		}
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-globe';
	}
}
