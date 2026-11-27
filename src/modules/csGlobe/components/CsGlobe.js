/**
 * @module modules/csGlobe/components/CsGlobe
 */

import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { removeLayer } from '@src/store/layers/layers.action';
import { setBeingMoved, setMoveEnd, setMoveStart } from '@src/store/map/map.action';
import { setBeingDragged } from '@src/store/pointer/pointer.action';
import { changeLiveZoomCenterRotationPitchAndRoll, changeZoomCenterRotationPitchRoll } from '@src/store/position/position.action';
import {
	BoundingSphere,
	Cartesian2,
	Cartesian3,
	Cartographic,
	Math as CesiumMath,
	Clock,
	ClockViewModel,
	Color,
	HeightReference,
	JulianDate,
	Rectangle,
	Viewer
} from 'cesium';
import cesiumWidgetCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';
import { html } from 'lit-html';
import { calculateSpatialHeight, calculateSpatialResolution } from '../utils/csGlobeUtils';
import css from './csGlobe.css?inline';

const Screen_Space_Error_Maximum = 1.1;
const Zoom_Distance_Minimum = 200;
const Zoom_Distance_Maximum = 800000;
const Min_Camera_Changed_Percentage = 0.04;
const Update_Position = 'update_position';
const Update_Layers = 'update_layers';

/**
 * Element which renders the cesium globe.
 * @class
 * @author herrmutig
 */
export class CsGlobe extends MvuElement {
	_viewer;
	#viewerConfiguration = {
		animation: false,
		baseLayer: false,
		baseLayerPicker: false,
		fullscreenButton: false,
		vrButton: false,
		geocoder: false,
		homeButton: false,
		infoBox: false,
		sceneModePicker: false,
		selectionIndicator: false,
		timeline: false,
		navigationHelpButton: false,
		navigationInstructionsInitiallyVisible: false,
		scene3DOnly: true,
		shouldAnimate: false,
		clockViewModel: new ClockViewModel(
			new Clock({
				canAnimate: false,
				shouldAnimate: false,
				currentTime: JulianDate.fromIso8601('2024-08-22T10:00:00Z')
			})
		)
	};

	constructor() {
		super({
			zoom: null,
			center: null,
			rotation: null,
			pitch: null,
			roll: null,
			fitRequest: null,
			layers: []
		});
		const {
			MapService: mapService,
			CoordinateService: coordinateService,
			GeoResourceService: geoResourceService,
			CsLayerService: layerService
		} = $injector.inject('MapService', 'CoordinateService', 'CsLayerService', 'GeoResourceService');

		this._mapService = mapService;
		this._coordinateService = coordinateService;
		this._layerService = layerService;
		this._geoResourceService = geoResourceService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Position: {
				return { ...model, ...data };
			}
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
			<div id="cs-globe"></div>
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
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._viewer?.destroy();
		this._viewer = null;
	}

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
			const viewerContainer = this.shadowRoot.getElementById('cs-globe');
			// @ts-ignore
			this._viewer = new Viewer(viewerContainer, this.#viewerConfiguration);
			const scene = this._viewer.scene;
			scene.globe.maximumScreenSpaceError = Screen_Space_Error_Maximum;
			scene.backgroundColor = Color.TRANSPARENT;
			scene.globe.baseColor = Color.WHITE;

			const sscController = this._viewer.scene.screenSpaceCameraController;
			sscController.minimumZoomDistance = Zoom_Distance_Minimum;
			sscController.maximumZoomDistance = Zoom_Distance_Maximum;
			sscController.enableZoom = true;

			const camera = this._viewer.camera;
			camera.percentageChanged = Min_Camera_Changed_Percentage;

			camera.moveStart.addEventListener(() => {
				setMoveStart();
				setBeingMoved(true);
			});

			camera.changed.addEventListener(() => {
				changeLiveZoomCenterRotationPitchAndRoll({
					center: this._cartesianToCenter(camera.position),
					zoom: this._cartesianToZoomLevel(camera.position),
					rotation: -camera.heading,
					pitch: camera.pitch,
					roll: camera.roll
				});
			});

			camera.moveEnd.addEventListener(() => {
				this._syncStore();
				setBeingDragged(false);
				setMoveEnd();
				setBeingMoved(false);
			});

			this.observeModel(['fitRequest'], (eventLike) => this._fitToExtent(eventLike.payload));
			this.observeModel(['zoom', 'center', 'rotation', 'pitch', 'roll'], () => this._syncView(), true);
			this.observeModel('layers', () => this._syncLayers(), true);
		}
	}

	_syncStore() {
		const camera = this._viewer.camera;
		const position = camera.position;

		changeZoomCenterRotationPitchRoll({
			zoom: this._cartesianToZoomLevel(position),
			center: this._cartesianToCenter(position),
			rotation: -camera.heading, // sends rotation "counter-clock" wise. Cesium heading is in clock-wise.
			pitch: camera.pitch,
			roll: camera.roll
		});

		changeLiveZoomCenterRotationPitchAndRoll({
			center: this._cartesianToCenter(camera.position),
			zoom: this._cartesianToZoomLevel(camera.position),
			rotation: -camera.heading,
			pitch: camera.pitch,
			roll: camera.roll
		});
	}

	_syncView() {
		const { zoom, center, rotation, pitch, roll } = this.getModel();
		const viewer = this._viewer;
		const viewerCamera = viewer.camera;
		const currentPosition = viewerCamera.position;
		const newPosition = this._calculate3DDestination(center, zoom);
		const approximately = (a, b, epsilon = 0.01) => {
			return Math.abs(a - b) < epsilon;
		};

		// Nothing to do when camera is correctly positioned
		if (
			currentPosition.equals(newPosition) &&
			approximately(viewerCamera.heading, -rotation) &&
			approximately(viewerCamera.pitch, pitch) &&
			approximately(viewerCamera.roll, roll)
		) {
			return;
		}

		viewerCamera.flyTo({
			destination: newPosition,
			orientation: {
				heading: -rotation, // negative rotation is clock-wise
				pitch: pitch,
				roll: roll
			},
			duration: 0
		});
	}

	_syncLayers() {
		const { layers } = this.getModel();

		const currentIds = this._getIdsFromImageryLayerCollection(this._viewer.imageryLayers);
		// array difference left side
		const toBeAdded = layers.filter((layer) => !currentIds.includes(layer.id));
		// array difference right side
		const toBeRemoved = currentIds.filter((id) => !layers.some((layer) => layer.id === id));
		// array all layers to update
		const toBeUpdated = layers.filter((layer) => currentIds.includes(layer.id));

		this._getIdsFromImageryLayerCollection(this._viewer.imageryLayers);

		toBeRemoved.forEach((layerId) => {
			const imageryLayers = this._getImageryLayersByLayerId(layerId);
			for (const imageryLayer of imageryLayers) {
				this._viewer.imageryLayers.remove(imageryLayer);
			}
		});

		toBeAdded.forEach((layer) => {
			const geoResource = this._geoResourceService.byId(layer.geoResourceId);

			if (geoResource) {
				const imageryLayers = this._layerService.toCsLayers(layer.id, geoResource, this._viewer);
				imageryLayers.forEach((l) => {
					this._viewer.imageryLayers.add(l);
				});
				this._updateImageryLayersZIndex(layer.zIndex, imageryLayers);
				this._setImageryLayersProperties(layer, imageryLayers);
			} else {
				console.warn(`Could not add an olLayer for id '${layer.id}'`);
				removeLayer(layer.id);
			}
		});

		toBeUpdated.forEach((layer) => {
			const imageryLayers = this._getImageryLayersByLayerId(layer.id);
			this._updateImageryLayersZIndex(layer.zIndex, imageryLayers);
			this._setImageryLayersProperties(layer, imageryLayers);
		});
	}

	/*
	 * Note: maxZoom and useVisibleViewport like in OlMap is not supported at the moment
	 * since there is no immediate use case for it and has to be planned out how it will
	 * be implemented in future versions of the CsGlobe component.
	 */
	_fitToExtent(payload) {
		const extent = payload.extent;
		const isEmpty = (extent) => {
			return extent[2] < extent[0] || extent[3] < extent[1];
		};

		const calculateFitPosition = (extent) => {
			const convertedExtent = this._coordinateService.toLonLatExtent(extent);
			const maxZoom = payload.options.maxZoom ? payload.options.maxZoom : this._mapService.getMaxZoomLevel();
			const rectangle = Rectangle.fromDegrees(convertedExtent[0], convertedExtent[1], convertedExtent[2], convertedExtent[3]);

			const cartesianPosition = this._viewer.camera.getRectangleCameraCoordinates(rectangle);
			const cartesianZoomLevel = Math.round(this._cartesianToZoomLevel(cartesianPosition));
			const cartographicPosition = Cartographic.fromCartesian(cartesianPosition);
			const fromLonLatCenter = this._coordinateService.fromLonLat([
				CesiumMath.toDegrees(cartographicPosition.longitude),
				CesiumMath.toDegrees(cartographicPosition.latitude)
			]);

			return this._calculate3DDestination(fromLonLatCenter, cartesianZoomLevel > maxZoom ? maxZoom : cartesianZoomLevel);
		};

		if (extent && !isEmpty(extent)) {
			const destination = calculateFitPosition(extent);
			const canvas = this._viewer.scene.canvas;
			const viewportPadding = this._mapService.getVisibleViewport(canvas);
			const padding = payload.options.useVisibleViewport
				? [
						viewportPadding.top + CsGlobe.DEFAULT_PADDING_PX[0],
						viewportPadding.right + CsGlobe.DEFAULT_PADDING_PX[1],
						viewportPadding.bottom + CsGlobe.DEFAULT_PADDING_PX[2],
						viewportPadding.left + CsGlobe.DEFAULT_PADDING_PX[3]
					]
				: CsGlobe.DEFAULT_PADDING_PX;
			const deltaPaddingX = 0.5 * (padding[1] - padding[3]);
			const deltaPaddingY = 0.5 * (padding[0] - padding[2]);

			// Move camera to correct position
			this._viewer.camera.setView({
				destination: destination,
				orientation: {
					heading: this._viewer.camera.heading,
					pitch: -CesiumMath.PI_OVER_TWO,
					roll: 0
				},
				duration: 0
			});

			// Adjust camera position by padding
			this._moveCameraByPixels(deltaPaddingX, deltaPaddingY);
			this._viewer.entities.add({
				name: 'Start',
				position: destination,
				point: {
					pixelSize: 30,
					color: Color.RED,
					outlineColor: Color.WHITE,
					outlineWidth: 2,
					heightReference: HeightReference.CLAMP_TO_GROUND // stick to terrain
				},
				label: {
					text: 'My point',
					font: '14px sans-serif',
					pixelOffset: new Cartesian2(0, -20)
				}
			});
			this._syncStore();
		}
	}

	_getIdsFromImageryLayerCollection(imageryLayerCollection) {
		const result = [];
		for (let i = 0; i < imageryLayerCollection.length; i++) {
			result.push(imageryLayerCollection.get(i).id);
		}

		return result;
	}

	_getFirstImageryLayerByZIndex(zIndex) {
		let cachedId = null;
		let currentZIndex = 0;

		for (let i = 0; i < this._viewer.imageryLayers.length; i++) {
			const imageryLayer = this._viewer.imageryLayers.get(i);
			const currentId = imageryLayer.id;

			if (cachedId !== null && cachedId !== currentId) {
				currentZIndex++;
			}

			if (zIndex === currentZIndex) {
				return imageryLayer;
			}

			cachedId = currentId;
		}

		return -1;
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

	/**
	 * @param {number} zIndex Moves provided imageryLayers to zIndex
	 * @param {Array<ImageryLayer>} imageryLayers - The imageryLayers to operate on. Must exist in the viewer's imageryLayerCollection
	 */
	_updateImageryLayersZIndex(zIndex, imageryLayers) {
		const targetImageryLayer = this._getFirstImageryLayerByZIndex(zIndex);
		const targetImageryLayerIndex = this._viewer.imageryLayers.indexOf(targetImageryLayer);
		const currentImageryLayerIndex = this._viewer.imageryLayers.indexOf(imageryLayers[0]);
		const indexDiff = Math.abs(targetImageryLayerIndex - currentImageryLayerIndex);

		for (let i = indexDiff; i !== 0; i--) {
			if (currentImageryLayerIndex > targetImageryLayerIndex) {
				/**
				 * Note: Due to how the method is called (see _syncLayers()) and because bav4-layers
				 * are always sorted from lowest to highest z-index, imageryLayers.raise() is never called.
				 * Those prerequisites ensure that only "lower()" operations are performed.
				 */
				imageryLayers.forEach((imageryLayer) => this._viewer.scene.imageryLayers.lower(imageryLayer));
			}
		}
	}

	/**
	 * @param {Layer} layer The layer which properties are applied to
	 * @returns {Array<ImageryLayer>} The imageryLayers group to apply the layer properties to
	 */
	_setImageryLayersProperties(layer, imageryLayers) {
		imageryLayers.forEach((imageryLayer) => {
			imageryLayer.show = layer.visible;
			imageryLayer.alpha = layer.opacity;
		});
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

	_calculate3DDestination(center, zoom) {
		const projectedCenter = this._coordinateService.toLonLat(center);
		const resolution = this._mapService.calcResolution(zoom, center);
		const viewerWidth = this._viewer.canvas.clientWidth;
		const spatialHeight = calculateSpatialHeight(resolution, viewerWidth);
		return Cartesian3.fromDegrees(projectedCenter[0], projectedCenter[1], spatialHeight);
	}

	_calculateCartesianToZoomHeight(cartesian, zoom) {
		const cartographic = Cartographic.fromCartesian(cartesian);
		const lon = CesiumMath.toDegrees(cartographic.longitude);
		const lat = CesiumMath.toDegrees(cartographic.latitude);
		const resolution = this._mapService.calcResolution(zoom, this._coordinateService.fromLonLat([lon, lat]));

		return Cartesian3.fromDegrees(lon, lat, calculateSpatialHeight(resolution, this._viewer.canvas.clientWidth));
	}

	_moveCameraByPixels(x = 0, y = 0) {
		const viewer = this._viewer;
		const scene = viewer.scene;
		const camera = viewer.camera;
		const canvas = scene.canvas;

		const center = new Cartesian2(canvas.clientWidth * 0.5, canvas.clientHeight * 0.5);
		const target = scene.globe.pick(camera.getPickRay(center), scene);

		if (target) {
			const metersPerPixel = camera.getPixelSize(new BoundingSphere(target, 0), scene.drawingBufferWidth, scene.drawingBufferHeight);
			camera.moveRight(x * metersPerPixel);
			camera.moveDown(y * metersPerPixel);
		}
	}

	/**
	 * Sets the default configuration for the cesium viewer. Configuration is not updated after the viewer was rendered the first time.
	 * It is useful to remove WebGL context in tests e.g.
	 */
	set _viewerConfiguration(value) {
		this.#viewerConfiguration = value;
	}

	static get DEFAULT_PADDING_PX() {
		return Array.of(10, 10, 10, 10);
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-cs-globe';
	}
}
