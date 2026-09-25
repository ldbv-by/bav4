/**
 * @module modules/olMap/components/OlMap
 */
import { html } from 'lit-html';
import { MvuElement } from '@src/modules/MvuElement';
import cesiumWidgetCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';
import css from './csGlobe.css?inline';
import { Cartesian3, Terrain, Viewer } from 'cesium';
import proj4 from 'proj4';
import { $injector } from '@src/injection';
import { isArray } from 'chart.js/helpers';

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

		toBeAdded.forEach((id) => {
			const toCsLayer = (id, geoResource) => {
				const csLayer = this._layerService.toCsLayer(id, geoResource, this.#viewer);

				return csLayer;
			};

			const geoResourceId = layers.find((l) => l.id === id)?.geoResourceId;
			const geoResource = this._geoResourceService.byId(geoResourceId);

			const imageryLayer = toCsLayer(id, geoResource);

			if (isArray(imageryLayer)) {
				imageryLayer.forEach((l) => {
					this.#viewer.imageryLayers.add(l);
				});
			} else {
				this.#viewer.imageryLayers.add(imageryLayer);
			}
		});

		/*
		toBeAdded.forEach((id) => {
			console.log('adding:' + id);

			const toOlLayer = (id, geoResource) => {
				const csLayer = geoResource
					? this._layerService.toCsLayer(id, geoResource, this.#viewer)
					: this._layerHandler.has(id)
						? toOlLayerFromHandler(id, this._layerHandler.get(id), this._map)
						: null;

				if (olLayer) {
					const layer = layers.find((layer) => layer.id === id);
					updateOlLayer(olLayer, layer);
					olLayer.setZIndex(layer.zIndex);
					this._map.addLayer(olLayer);
				} else {
					console.warn(`Could not add an olLayer for id '${id}'`);
					removeLayer(id);
				}
			};

			const geoResourceId = layers.find((l) => l.id === id)?.geoResourceId;
			const geoResource = this._geoResourceService.byId(geoResourceId);
			//if geoResource is a future, we insert a placeholder olLayer replacing it after the geoResource was resolved
			if (geoResource?.getType() === GeoResourceTypes.FUTURE) {
				geoResource
					.get()
					// eslint-disable-next-line promise/prefer-await-to-then
					.then((lazyLoadedGeoResource) => {
						// replace the placeholder olLayer by the real the olLayer
						const realOlLayer = this._layerService.toOlLayer(id, lazyLoadedGeoResource, this._map);
						/**
						 * A layer may be modified in the meantime. So we have to use a fresh copy of all layers by calling `getModel()`.
						 * But it also may be removed in the meantime, so we have to check for that too.
						 */
		/*		const layer = this.getModel().layers.find((layer) => layer.id === id);
						if (layer) {
							updateOlLayer(realOlLayer, layer);
							this._map.getLayers().remove(getLayerById(this._map, id));
							realOlLayer.setZIndex(layer.zIndex);
							this._map.addLayer(realOlLayer);
						}
					});
			}
			toOlLayer(id, geoResource);
		}); */
	}

	_getIdsFromImageryLayerCollection(imageryLayerCollection) {
		const result = [];
		for (let i = 0; i < imageryLayerCollection.length; i++) {
			result.push(imageryLayerCollection.get(i).id);
		}

		return result;
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-cs-globe';
	}
}
