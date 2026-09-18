/**
 * @module modules/olMap/components/OlMap
 */
import { html } from 'lit-html';
import { MvuElement } from '@src/modules/MvuElement';
import cesiumWidgetCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';
import css from './csGlobe.css?inline';
import { Cartesian3, Terrain, Viewer } from 'cesium';
import proj4 from 'proj4';

// TODO finish sync Position
// TODO finish sync Layer

const Update_Position = 'update_position';
const Update_Layers = 'update_layers';

/**
 * Element which renders the cesium globe.
 * @class
 * @author herrmutig
 */
export class CsGlobe extends MvuElement {
	#viewer;

	constructor() {
		super({
			zoom: null,
			center: null,
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
				${cesiumWidgetCss}
				${css}
			</style>
			<div id="cesium-container"></div>
		`;
	}

	/**
	 * @override
	 */
	onInitialize() {
		//observe global state (position, active layers, orientation)
		this.observe(
			(state) => state.position,
			(data) => this.signal(Update_Position, data)
		);

		this.observe(
			(state) => state.layers.active,
			(data) => this.signal(Update_Layers, data)
		);

		this.observeModel(['zoom', 'center'], () => this._syncView());
		this.observeModel('layers', () => this._syncLayers());
	}

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
			this.#viewer = new Viewer(viewerContainer, {
				terrain: Terrain.fromWorldTerrain()
			});
		}
	}

	_syncView() {
		const { zoom, center } = this.getModel();
		const viewer = this.#viewer;
		const viewerCamera = viewer.camera;

		const centerTo3DCoordinate = (center) => {
			const projectedDegrees = proj4('EPSG:3857', 'WGS84', [...center]);
			return Cartesian3.fromDegrees(projectedDegrees[0], projectedDegrees[1]);
		};

		viewerCamera.flyTo({
			destination: centerTo3DCoordinate(center)
		});
		/**
		 * Update the view only if the parameters are not virtually the same as the current one.
		 * Note: Triggering an animation on the ol.View causes an WMS source always to be loaded, even if nothing has changed effectively.
		 */

		console.log(viewerCamera.position);

		/*
		if (
			!equals(zoom, roundZoomLevel(view.getZoom())) ||
			!equals(center, roundCenter(view.getCenter())) ||
			!equals(rotation, roundRotation(view.getRotation()))
		) {
			this._view.animate({
				zoom: zoom,
				center: center,
				rotation: rotation,
				duration: OlMap.ANIMATION_DURATION_MS
			});
		} */
	}

	_syncLayers() {
		const { layers } = this.getModel();
		const updatedIds = layers.map((layer) => layer.id);
		/*const currentIds = this._map
			.getLayers()
			.getArray()
			.map((olLayer) => olLayer.get('id')); */
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-cs-globe';
	}
}
