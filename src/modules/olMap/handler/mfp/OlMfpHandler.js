import { $injector } from '../../../../injection';
import { observe } from '../../../../utils/storeUtils';
import { setScale, startJob } from '../../../../store/mfp/mfp.action';
import { Point } from 'ol/geom';
import { OlLayerHandler } from '../OlLayerHandler';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { createMapMaskFunction, nullStyleFunction, createThumbnailStyleFunction } from './styleUtils';
import { MFP_LAYER_ID } from '../../../../plugins/ExportMfpPlugin';
import { changeRotation } from '../../../../store/position/position.action';
import { getPolygonFrom } from '../../utils/olGeometryUtils';
import { toLonLat } from 'ol/proj';

const Points_Per_Inch = 72; // PostScript points 1/72"
const MM_Per_Inches = 25.4;
const Units_Ratio = 39.37; // inches per meter
const Map_View_Margin = 50;
const Locales_Fallback = 'en';

/**
 * @class
 * @author thiloSchlemmer
 */
export class OlMfpHandler extends OlLayerHandler {

	constructor() {
		super(MFP_LAYER_ID);
		const { StoreService: storeService, TranslationService: translationService, MapService: mapService, MfpService: mfpService, Mfp3Encoder: mfp3Encoder }
			= $injector.inject('StoreService', 'TranslationService', 'MapService', 'MfpService', 'Mfp3Encoder');

		this._storeService = storeService;
		this._translationService = translationService;
		this._mapService = mapService;
		this._mfpService = mfpService;
		this._encoder = mfp3Encoder;
		this._mfpLayer = null;
		this._mfpBoundaryFeature = new Feature();
		this._map = null;
		this._registeredObservers = [];
		this._pageSize = null;
		this._visibleViewport = null;
		this._mapProjection = 'EPSG:' + this._mapService.getSrid();
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		this._map = olMap;
		if (this._mfpLayer === null) {
			const source = new VectorSource({ wrapX: false, features: [this._mfpBoundaryFeature] });
			this._mfpLayer = new VectorLayer({
				source: source
			});
			setScale(this._getOptimalScale(olMap));

			const mfpSettings = this._storeService.getStore().getState().mfp.current;
			this._mfpLayer.on('prerender', (event) => event.context.save());
			this._mfpLayer.on('postrender', createMapMaskFunction(this._map, this._mfpBoundaryFeature, () => this._isMapDraggedByUser()));
			this._registeredObservers = this._register(this._storeService.getStore());
			this._updateMfpPage(mfpSettings);
			this._updateMfpPreviewLazy();
			this._updateRotation();
		}

		return this._mfpLayer;
	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		//use the map to unregister event listener, interactions, etc
		this._mfpBoundaryFeature.setStyle(nullStyleFunction);
		this._unregister(this._registeredObservers);
		this._listeners = [];
		this._mfpLayer = null;
		this._map = null;
		this._visibleViewport = null;
	}

	_register(store) {
		// HINT: To observe the store for map changes (especially liveCenter) results in a more intensified call traffic with the store.
		// A shortcut and allowed alternative is the direct binding to the ol map events.
		// The current design is chosen prior to the alternative, due to the fact, that the call traffic have no substantial influence to
		// the performance and time consumptions (< 1 ms), but makes it simpler to follow only one source of events.
		return [
			observe(store, state => state.mfp.current, (current) => this._updateMfpPage(current)),
			observe(store, state => state.mfp.jobRequest, () => this._encodeMap()),
			observe(store, state => state.mfp.autoRotation, (autoRotation) => this._onAutoRotationChanged(autoRotation)),
			observe(store, state => state.position.center, () => {
				this._updateMfpPreview();
			}),
			observe(store, state => state.position.rotation, () => {
				this._updateRotation();
			})
		];
	}

	_unregister(observers) {
		observers.forEach(unsubscribe => unsubscribe());
		observers = [];
	}

	_updateMfpPreview() {
		// todo: May be better suited in a mfpBoundary-provider and pageLabel-provider, in cases where the
		// bvv version (print in UTM32) is not fitting
		const center = this._getVisibleCenterPoint();
		const rotation = this._storeService.getStore().getState().mfp.autoRotation ? null : this._storeService.getStore().getState().position.rotation;
		const geodeticBoundary = this._createGeodeticBoundary(this._pageSize, center);
		const mfpGeometry = this._toMfpBoundary(geodeticBoundary, center, rotation);
		const geodeticRotation = this._getAzimuth(mfpGeometry);
		this._mfpBoundaryFeature.set('azimuth', geodeticRotation);
		this._mfpBoundaryFeature.set('center', this._storeService.getStore().getState().position.center);
		this._mfpBoundaryFeature.setGeometry(mfpGeometry);
		setTimeout(() => changeRotation(geodeticRotation));
	}

	_updateMfpPreviewLazy() {
		const intervalId = setInterval(() => {
			if (!this._map.getView().getAnimating()) {// let's wait until map animation has stopped
				this._updateMfpPreview();
				clearInterval(intervalId);
			}
		}, 50);
		this._updateMfpPreview();
	}

	_updateRotation() {
		const rotateMfpExtentByView = () => {
			this._updateMfpPreview();
		}; // do nothing
		const rotateViewByMfpExtent = () => {
			const rotation = this._mfpBoundaryFeature.get('azimuth');
			setTimeout(() => changeRotation(rotation));
		};

		const rotateAction = this._storeService.getStore().getState().mfp.autoRotation ? rotateViewByMfpExtent : rotateMfpExtentByView;
		rotateAction();
	}

	_updateMfpPage(mfpSettings) {
		const { id, scale } = mfpSettings;
		const { extent: mfpExtent } = this._mfpService.getCapabilities();
		const translate = (key) => this._translationService.translate(key);

		const label = this._getPageLabel(mfpSettings);
		const layoutSize = this._mfpService.getLayoutById(id).mapSize;

		// init/update mfpBoundaryFeature
		this._mfpBoundaryFeature.set('name', label);
		this._mfpBoundaryFeature.setStyle(createThumbnailStyleFunction(label, translate('olMap_handler_mfp_distortion_warning'), mfpExtent));

		const toGeographicSize = (size) => {
			const toGeographic = (pixelValue) => pixelValue / Points_Per_Inch * MM_Per_Inches / 1000.0 * scale;
			return { width: toGeographic(size.width), height: toGeographic(size.height) };
		};

		this._pageSize = toGeographicSize(layoutSize);
	}

	_getLocales() {
		const { ConfigService: configService } = $injector.inject('ConfigService');
		return [configService.getValue('DEFAULT_LANG', 'en'), Locales_Fallback];
	}

	_getPageLabel(mfpSettings) {
		const translate = (key) => this._translationService.translate(key);
		const { id, scale } = mfpSettings;
		const layout = translate(`olMap_handler_mfp_id_${id}`);
		const formattedScale = scale.toLocaleString(this._getLocales(), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
		return `${layout} 1:${formattedScale}`;
	}

	_getOptimalScale(map) {
		const getEffectiveSizeFromPadding = (size, padding) => {
			return { width: size[0] - (padding.left + padding.right), height: size[1] - (padding.bottom + padding.top) };
		};
		const availableSize = getEffectiveSizeFromPadding(map.getSize(), this._mapService.getVisibleViewport(map.getTarget()));

		const center = toLonLat(map.getView().getCenter());
		const averageDeviation = Math.abs(Math.cos(center[1] * Math.PI / 180));
		const resolution = map.getView().getResolution();

		// due to standard map projection of (EPSG:3857) we have to add a average deviation
		// from equator (center of view) to get reliable values
		const widthInMeter = resolution * averageDeviation * (availableSize.width - Map_View_Margin * 2);
		const heightInMeter = resolution * averageDeviation * (availableSize.height - Map_View_Margin * 2);

		const { id } = this._storeService.getStore().getState().mfp.current;
		const layoutSize = this._mfpService.getLayoutById(id).mapSize;
		const scaleWidth = widthInMeter * Units_Ratio * Points_Per_Inch / layoutSize.width;
		const scaleHeight = heightInMeter * Units_Ratio * Points_Per_Inch / layoutSize.height;

		const testScale = Math.min(scaleWidth, scaleHeight);
		const scaleCandidates = [...this._mfpService.getLayoutById(id).scales].reverse();

		// todo: replace with array.findLast()
		const findLast = (array, matcher) => {
			// mocking the browser implementation of array.findLast() and
			// return last or undefined (instead of null), to get identical results
			let last = undefined;

			array.forEach(e => {
				if (matcher(e)) {
					last = e;
				}
			});
			return last;
		};

		// todo: replace with array.findLast()
		// array.findLast() is implemented in Firefox (at Version 104), we wait a couple of months before replace
		// the standard usage should be: const bestScale = scaleCandidates.findLast(scale => testScale > scale);
		const bestScale = findLast(scaleCandidates, (scale) => testScale > scale);
		return bestScale ? bestScale : scaleCandidates[0];
	}

	_getVisibleCenterPoint() {
		const getOrRequestVisibleViewport = () => {
			if (!this._visibleViewport) {
				this._visibleViewport = this._mapService.getVisibleViewport(this._map.getTarget());
			}
			return this._visibleViewport;
		};
		const getVisibleCenter = () => {
			const size = this._map.getSize();
			const padding = getOrRequestVisibleViewport();
			return [size[0] / 2 + (padding.left - padding.right) / 2, size[1] / 2 + (padding.top - padding.bottom) / 2];
		};

		return new Point(this._map.getCoordinateFromPixel(getVisibleCenter()));
	}

	_createGeodeticBoundary(pageSize, center) {
		const geodeticCenter = center.clone().transform(this._mapProjection, this._getMfpProjection());

		const geodeticCenterCoordinate = geodeticCenter.getCoordinates();
		const geodeticBoundingBox = [
			geodeticCenterCoordinate[0] - (pageSize.width / 2), // minX
			geodeticCenterCoordinate[1] - (pageSize.height / 2), // minY
			geodeticCenterCoordinate[0] + (pageSize.width / 2), // maxX
			geodeticCenterCoordinate[1] + (pageSize.height / 2) // maxY
		];

		return getPolygonFrom(geodeticBoundingBox);
	}

	_toMfpBoundary(geodeticBoundary, center, mapRotation) {
		const mfpBoundary = geodeticBoundary.clone().transform(this._getMfpProjection(), this._mapProjection);
		const rotate = (polygon) => {
			const azimuthRotation = this._getAzimuth(polygon);
			polygon.rotate(mapRotation - azimuthRotation, center.getCoordinates());
			return polygon;
		};

		return mapRotation !== null ? rotate(mfpBoundary) : mfpBoundary;
	}

	_getMfpProjection() {
		return `EPSG:${this._mfpService.getCapabilities().srid}`;
	}

	_getAzimuth(polygon) {
		if (!polygon || polygon.getType() !== 'Polygon') {
			return null;
		}
		const coordinates = polygon.getCoordinates()[0];
		const getAngle = (fromPoint, toPoint) => Math.atan2(toPoint[1] - fromPoint[1], toPoint[0] - fromPoint[0]);
		const topAngle = getAngle(coordinates[0], coordinates[1]);
		const bottomAngle = getAngle(coordinates[3], coordinates[2]);

		const angle = (topAngle + bottomAngle) / 2;
		return angle;
	}

	_onAutoRotationChanged(autorotation) {
		if (autorotation) {
			this._updateMfpPreviewLazy();
		}
	}

	_isMapDraggedByUser() {
		return this._storeService.getStore().getState().pointer.beingDragged;
	}

	async _encodeMap() {
		const { id, scale, dpi } = this._storeService.getStore().getState().mfp.current;
		const rotation = this._storeService.getStore().getState().mfp.autoRotation ? 0 : this._getAzimuth(this._mfpBoundaryFeature.getGeometry()) * 180 / Math.PI;
		const showGrid = this._storeService.getStore().getState().mfp.showGrid;
		const pageCenter = this._getVisibleCenterPoint();
		const encodingProperties = { layoutId: id, scale: scale, rotation: rotation, dpi: dpi, pageCenter: pageCenter, showGrid: showGrid };
		const specs = await this._encoder.encode(this._map, encodingProperties);

		startJob(specs);
	}
}
