/**
 * @module modules/olMap/components/CsMap
 */
import { html } from 'lit-html';
import css from './csMap.css?inline';

import { MvuElement } from '../../MvuElement';
import { CesiumTerrainProvider, Clock, ClockViewModel, Ion, JulianDate, RequestScheduler, ShadowMode, Terrain, Viewer } from 'cesium';
import cesiumCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';

export const GEORESOURCES_STATIC = Object.freeze({
	TERRAIN: 'https://bvv-3d-terrain-dbvycm.nbg1.your-objectstorage.com/',
	LOD2_TILESET: '3d-data/latest/lod23d/tileset.json',
	LABELS_TILESET: '3d-data/latest/labels3d/tileset.json'
});
/**
 * Element which renders the cesium globe (3D Map).
 * @class
 * @author herrmutig
 */
export class CsMap extends MvuElement {
	constructor() {
		super({
			zoom: null,
			center: null,
			rotation: null,
			fitRequest: null,
			fitLayerRequest: null,
			layers: []
		});
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Position:
				return { ...model, ...data };
			case Update_Layers:
				return { ...model, layers: data };
		}
	}

	/**
	 * @override
	 */
	createView() {
		return html`
			<style>
				${cesiumCss}
				${css}
			</style>
			<div id="cesiumContainer"></div>
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
		const initializeViewer = () => {
			// Prepare cesium
			// @ts-ignore
			const viewerElement = this.shadowRoot.getElementById('cesiumContainer');
			// @ts-ignore
			const viewer = new Viewer(viewerElement, {
				terrain: Terrain.fromWorldTerrain()
			});
		};

		if (firstTime) {
			initializeViewer();
		}
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-cs-map';
	}

	static get DEFAULT_PADDING_PX() {
		return Array.of(10, 10, 10, 10);
	}
	static get ANIMATION_DURATION_MS() {
		return 200;
	}
}
