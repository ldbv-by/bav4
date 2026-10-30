/**
 * @module modules/csGlobe/components/CsGlobe
 */

import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { setBeingMoved, setMoveEnd, setMoveStart } from '@src/store/map/map.action';
import { setBeingDragged } from '@src/store/pointer/pointer.action';
import {
	changeLiveCenter,
	changeLiveRotationPitchAndRoll,
	changeLiveZoom,
	changeZoomCenterRotationPitchRoll
} from '@src/store/position/position.action';
import { Cartesian3, Cartographic, Math as CesiumMath, Clock, ClockViewModel, JulianDate, Rectangle, Viewer } from 'cesium';
import cesiumWidgetCss from 'cesium/Build/Cesium/Widgets/widgets.css?inline';
import { isArray } from 'chart.js/helpers';
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
		this._viewer.destroy();
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
				changeLiveRotationPitchAndRoll({ rotation: -camera.heading, pitch: camera.pitch, roll: camera.roll });
				changeLiveCenter(this._cartesianToCenter(camera.position));
				changeLiveZoom(this._cartesianToZoomLevel(camera.position));
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

		changeLiveRotationPitchAndRoll({ rotation: -camera.heading, pitch: camera.pitch, roll: camera.roll });
		changeLiveCenter(this._cartesianToCenter(camera.position));
		changeLiveZoom(this._cartesianToZoomLevel(camera.position));
	}

	_syncView() {
		const { zoom, center, rotation, pitch, roll } = this.getModel();
		const viewer = this._viewer;
		const viewerCamera = viewer.camera;

		const calculate3DDestination = (center, zoom) => {
			const projectedCenter = this._coordinateService.toLonLat(center);
			const resolution = this._mapService.calcResolution(zoom, center);
			const viewerWidth = viewer.canvas.clientWidth;
			const spatialHeight = calculateSpatialHeight(resolution, viewerWidth);
			return Cartesian3.fromDegrees(projectedCenter[0], projectedCenter[1], spatialHeight);
		};

		const currentPosition = viewerCamera.position;
		const newPosition = calculate3DDestination(center, zoom);

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
		const updatedIds = layers.map((layer) => layer.id);

		const currentIds = this._getIdsFromImageryLayerCollection(this._viewer.imageryLayers);
		// array intersection
		//	const toBeUpdated = updatedIds.filter((id) => currentIds.includes(id));
		// array difference left side
		const toBeAdded = updatedIds.filter((id) => !currentIds.includes(id));
		// array difference right side
		//	const toBeRemoved = currentIds.filter((id) => !updatedIds.includes(id));

		toBeAdded.forEach((id) => {
			const toCsLayer = (id, geoResource) => {
				const csLayer = this._layerService.toCsLayer(id, geoResource, this._viewer);
				return csLayer;
			};

			const geoResourceId = layers.find((l) => l.id === id)?.geoResourceId;
			const geoResource = this._geoResourceService.byId(geoResourceId);

			const imageryLayer = toCsLayer(id, geoResource);

			if (isArray(imageryLayer)) {
				imageryLayer.forEach((l) => {
					this._viewer.imageryLayers.add(l);
				});
			} else {
				this._viewer.imageryLayers.add(imageryLayer);
			}
		});
	}

	_fitToExtent(payload) {
		const isEmpty = (extent) => {
			return extent[2] < extent[0] || extent[3] < extent[1];
		};

		const extent = payload.extent;

		if (extent && !isEmpty(extent)) {
			const convertedExtent = this._coordinateService.toLonLatExtent(extent);
			const padding = CsGlobe.DEFAULT_PADDING_DEGREE;

			const rectangle = Rectangle.fromDegrees(
				convertedExtent[0] - padding[0],
				convertedExtent[1] - padding[1],
				convertedExtent[2] + padding[2],
				convertedExtent[3] + padding[3]
			);

			this._viewer.camera.flyTo({
				destination: rectangle,
				orientation: {
					heading: this._viewer.camera.heading,
					pitch: -CesiumMath.PI_OVER_TWO,
					roll: 0
				},
				duration: 0
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

	/**
	 * Sets the default configuration for the cesium viewer. Configuration is not updated after the viewer was rendered the first time.
	 * It is useful to remove WebGL context in tests e.g.
	 */
	set _viewerConfiguration(value) {
		this.#viewerConfiguration = value;
	}

	static get DEFAULT_PADDING_DEGREE() {
		return Array.of(0.5, 0.5, 0.5, 0.5);
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-cs-globe';
	}
}
