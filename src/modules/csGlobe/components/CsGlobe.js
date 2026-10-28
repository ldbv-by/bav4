/**
 * @module modules/csGlobe/components/CsGlobe
 */

import { Cartesian3 } from '@cesium/core';
import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { Viewer } from 'cesium';
import cesiumWidgetCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';
import { isArray } from 'chart.js/helpers';
import { html } from 'lit-html';
import proj4 from 'proj4';
import css from './csGlobe.css?inline';

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

		const { CsLayerService: layerService, GeoResourceService: geoResourceService } = $injector.inject('CsLayerService', 'GeoResourceService');
		this._layerService = layerService;
		this._geoResourceService = geoResourceService;
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
				baseLayer: false,
				baseLayerPicker: true
			});
		}
	}

	_syncView() {
		const { /*zoom,*/ center } = this.getModel();
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

		const currentIds = this._getIdsFromImageryLayerCollection(this.#viewer.imageryLayers);

		// array intersection
		const toBeUpdated = updatedIds.filter((id) => currentIds.includes(id));
		// array difference left side
		const toBeAdded = updatedIds.filter((id) => !currentIds.includes(id));
		// array difference right side
		const toBeRemoved = currentIds.filter((id) => !updatedIds.includes(id));

		toBeRemoved.forEach((id) => {
			const imageryLayers = this._getImageryLayersByLayerId(id);

			for (const imageryLayer of imageryLayers) {
				this._viewer.imageryLayers.remove(imageryLayer);
			}
		});

		toBeAdded.forEach((id) => {
			const geoResourceId = layers.find((layer) => layer.id === id)?.geoResourceId;
			const geoResource = this._geoResourceService.byId(geoResourceId);
			const imageryLayer = this._layerService.toCsLayer(id, geoResource, this._viewer);

			if (isArray(imageryLayer)) {
				imageryLayer.forEach((l) => {
					this.#viewer.imageryLayers.add(l);
				});
			} else {
				this.#viewer.imageryLayers.add(imageryLayer);
			}
		});

		toBeUpdated.forEach((id) => {
			const layer = layers.find((layer) => layer.id === id);
			const imageryTuples = layers.map((layer) => this._getImageryLayersByLayerId(layer.id));

			// false does not destroy the layers and just removes them from the collection
			this._viewer.imageryLayers.removeAll(false);

			// re-adds imagery layers in correct order
			for (const tuple of imageryTuples) {
				for (const imageryLayer of tuple) {
					this._viewer.imageryLayers.add(imageryLayer);
				}
			}

			console.log(imageryTuples);
			console.log(layer);
		});

		console.log(this._viewer.imageryLayers);
	}

	_getIdsFromImageryLayerCollection(imageryLayerCollection) {
		const result = [];
		for (let i = 0; i < imageryLayerCollection.length; i++) {
			result.push(imageryLayerCollection.get(i).id);
		}

		return result;
	}

	_getImageryLayersByLayerId(layerId) {
		const result = [];
		for (let i = 0; i < this._viewer.imageryLayers.length; i++) {
			const imageryLayer = this._viewer.imageryLayers.get(i);
			if (imageryLayer.id === layerId) {
				result.push(imageryLayer);
			}
		}

		return result;
	}

	_getAllImageryLayers() {
		const result = [];
		for (let i = 0; i < this._viewer.imageryLayers.length; i++) {
			const imageryLayer = this._viewer.imageryLayers.get(i);
			result.push(imageryLayer);
		}

		return result;
	}

	/**
	 * @param {Cartesian3} cartesianPosition The 3D position used to calculate the center
	 * @returns {Array<number>} The current center as 3857 coordinate
	 */
	_cartesianToCenter(cartesianPosition) {
		const cartographic = Cartographic.fromCartesian(cartesianPosition);
		return this._coordinateService.fromLonLat([CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)]);
	}

	/**
	 * @param {Cartesian3} cartesianPosition The 3D position used to calculate the resolution
	 * @returns {number} The current resolution of the map/globe
	 */
	_cartesianToResolution(cartesianPosition) {
		const cartographic = Cartographic.fromCartesian(cartesianPosition);
		return calculateSpatialResolution(cartographic.height, this._viewer.canvas.clientWidth);
	}

	/**
	 * @param {Cartesian3} cartesianPosition The 3D position used to calculate the zoom level
	 * @returns {number} The current zoom level of the map/globe
	 */
	_cartesianToZoomLevel(cartesianPosition) {
		return this._mapService.calcZoomLevel(this._cartesianToResolution(cartesianPosition), this._cartesianToCenter(cartesianPosition));
	}

	// used to change the default configuration for the cesium viewer on initialization. E.g. it is used to remove WebGL context in tests.
	set _viewerConfiguration(value) {
		this.#viewerConfiguration = value;
	}

	get _viewerConfiguration() {
		return this.#viewerConfiguration;
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-cs-globe';
	}
}
