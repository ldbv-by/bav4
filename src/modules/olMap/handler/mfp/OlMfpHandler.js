import { $injector } from '../../../../injection';
import { observe } from '../../../../utils/storeUtils';
import { setScale, startJob } from '../../../../store/mfp/mfp.action';
import { Point } from 'ol/geom';
import { OlLayerHandler } from '../OlLayerHandler';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { nullStyleFunction, createThumbnailStyleFunction, createMapMaskFunction } from './styleUtils';
import { MFP_LAYER_ID } from '../../../../plugins/ExportMfpPlugin';
import { getAzimuthFrom, getBoundingBoxFrom, getPolygonFrom } from '../../utils/olGeometryUtils';
import { toLonLat } from 'ol/proj';
import { equals, getIntersection } from 'ol/extent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

const Points_Per_Inch = 72; // PostScript points 1/72"
const MM_Per_Inches = 25.4;
const Units_Ratio = 39.37; // inches per meter
const Map_View_Margin = 50;
const Default_Preview_Delay_Time = 1500;

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
		this._beingDragged = false;
		this._previewDelayTime = Default_Preview_Delay_Time;
		this._previewDelayTimeoutId = null;
		this._alreadyWarned = false;
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
			this._mfpLayer.on('postrender', createMapMaskFunction(this._map, () => this._getPixelCoordinates()));
			this._registeredObservers = this._register(this._storeService.getStore());
			// Initialize boundaryFeature with centerpoint to get a first valid
			// feature-geometry for the postrender-event. The postrender-event is
			// not fired, if there is no geometry at all.
			this._mfpBoundaryFeature.setGeometry(new Point(this._map.getView().getCenter()));
			this._updateMfpPage(mfpSettings);
			this._delayedUpdateMfpPreview(this._getVisibleCenterPoint());
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
		this._alreadyWarned = false;
	}

	_register(store) {
		// HINT: To observe the store for map changes (especially liveCenter) results in a more intensified call traffic with the store.
		// A shortcut and allowed alternative is the direct binding to the ol map events.
		// The current design is chosen prior to the alternative, due to the fact, that the call traffic have no substantial influence to
		// the performance and time consumptions (< 1 ms), but makes it simpler to follow only one source of events.
		return [
			observe(store, state => state.mfp.current, (current) => {
				this._updateMfpPage(current);
				this._updateMfpPreview(this._getVisibleCenterPoint());
			}),
			observe(store, state => state.mfp.jobRequest, () => this._encodeMap()),
			observe(store, state => state.position.center, () => this._updateMfpPreview(this._getVisibleCenterPoint())),
			observe(store, state => state.map.moveStart, () => {
				// If a rotation is init by the application, the 'pointer.beingDragged' event is not
				// triggered and we must set the internal 'beingDragged'-state by 'map.moveStart'. In the other cases obviously this state is
				// set twice by the events 'pointer.beingDragged' and 'map.moveStart'.
				// To prevent flickering, we check for a already existing delay, caused by pointer.beingDragged.
				if (!this._previewDelayTimeoutId) {
					this._beingDragged = true;
				}
			}),
			observe(store, state => state.map.moveEnd, () => this._delayedUpdateMfpPreview(this._getVisibleCenterPoint())),
			observe(store, state => state.pointer.beingDragged, (beingDragged) => {
				const clearPreview = () => {
					// forcing the used render function to skip the drawing of the geometry
					this._beingDragged = beingDragged;
					if (this._previewDelayTimeoutId) {
						clearTimeout(this._previewDelayTimeoutId);
						this._previewDelayTimeoutId = null;
					}
				};

				const action = beingDragged ? clearPreview : () => this._delayedUpdateMfpPreview(this._getVisibleCenterPoint());
				action();
			})
		];
	}

	_unregister(observers) {
		observers.forEach(unsubscribe => unsubscribe());
		observers = [];
	}

	_updateMfpPage(mfpSettings) {
		const { id, scale } = mfpSettings;
		const layoutSize = this._mfpService.getLayoutById(id).mapSize;

		// init/update mfpBoundaryFeature
		this._mfpBoundaryFeature.setStyle(createThumbnailStyleFunction(() => this._getBeingDragged()));

		const toGeographicSize = (size) => {
			const toGeographic = (pixelValue) => pixelValue / Points_Per_Inch * MM_Per_Inches / 1000.0 * scale;
			return { width: toGeographic(size.width), height: toGeographic(size.height) };
		};

		this._pageSize = toGeographicSize(layoutSize);
	}

	_updateMfpPreview(center) {
		if (!center) {
			return;
		}

		const skipPreview = () => {
			// HINT: In standalone-mode is the map- and the mfp-projection identical
			// and a projected geometry not needed.
			this._mfpBoundaryFeature.set('inPrintableArea', true);
			this._mfpBoundaryFeature.setGeometry(center);
		};
		const createProjectedGeometry = () => {
			const { extent: mfpExtent } = this._mfpService.getCapabilities();
			const rotation = this._storeService.getStore().getState().position.rotation;
			const pagePolygon = this._createPagePolygon(this._pageSize, center);
			const mfpGeometry = this._toMfpBoundary(pagePolygon, center, rotation);

			const intersect = getIntersection(mfpGeometry.getExtent(), mfpExtent);
			this._mfpBoundaryFeature.set('inPrintableArea', equals(intersect, mfpGeometry.getExtent()));
			this._mfpBoundaryFeature.setGeometry(mfpGeometry);
		};

		const updateAction = this._getMfpProjection() === this._mapProjection ? skipPreview : createProjectedGeometry;
		updateAction();
	}

	_delayedUpdateMfpPreview(center) {
		const timeOut = this._previewDelayTime;
		const translate = (key) => this._translationService.translate(key);
		if (this._previewDelayTimeoutId) {
			clearTimeout(this._previewDelayTimeoutId);
			this._previewDelayTimeoutId = null;
		}
		this._previewDelayTimeoutId = setTimeout(() => {
			this._beingDragged = false;
			this._updateMfpPreview(center);
			const inPrintableArea = this._mfpBoundaryFeature.get('inPrintableArea');
			if (!inPrintableArea) {
				this._warnOnce(translate('olMap_handler_mfp_distortion_warning'));
			}
			this._previewDelayTimeoutId = null;
		}, timeOut);

	}

	_getPixelCoordinates() {
		const resolution = this._map.getView().getResolution();
		const centerPixel = this._getVisibleCenterPixel();
		const centerCoordinate = this._map.getCoordinateFromPixel(centerPixel);
		const averageDeviation = this._getAverageDeviationFromEquator(centerCoordinate);
		const toPixelSize = (size) => {
			const toPixel = (layoutValue) => layoutValue / resolution / averageDeviation;
			return { width: toPixel(size.width), height: toPixel(size.height) };
		};
		const pixelSize = toPixelSize(this._pageSize);
		const mfpBoundingBox = getBoundingBoxFrom(centerPixel, pixelSize);

		return getPolygonFrom(mfpBoundingBox).getCoordinates()[0].reverse();
	}

	_createPagePolygon(pageSize, center) {
		const geodeticCenter = center.clone().transform(this._mapProjection, this._getMfpProjection());
		const geodeticBoundingBox = getBoundingBoxFrom(geodeticCenter.getCoordinates(), pageSize);

		return getPolygonFrom(geodeticBoundingBox);
	}

	_toMfpBoundary(pagePolygon, center, mapRotation) {
		const mfpBoundary = pagePolygon.clone().transform(this._getMfpProjection(), this._mapProjection);
		const rotate = (polygon) => {
			const azimuthRotation = getAzimuthFrom(polygon);
			polygon.rotate(mapRotation - azimuthRotation, center.getCoordinates());
			return polygon;
		};

		return mapRotation !== null ? rotate(mfpBoundary) : mfpBoundary;
	}

	_getBeingDragged() {
		return this._beingDragged;
	}

	_getAverageDeviationFromEquator(smercCoordinate) {
		const lonLat = toLonLat(smercCoordinate);
		return Math.abs(Math.cos(lonLat[1] * Math.PI / 180));
	}

	_getOptimalScale(map) {
		const getEffectiveSizeFromPadding = (size, padding) => {
			return { width: size[0] - (padding.left + padding.right), height: size[1] - (padding.bottom + padding.top) };
		};
		const availableSize = getEffectiveSizeFromPadding(map.getSize(), this._mapService.getVisibleViewport(map.getTarget()));

		const averageDeviation = this._getAverageDeviationFromEquator(map.getView().getCenter());
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

	_getVisibleCenterPixel() {
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
		return getVisibleCenter();
	}

	_getVisibleCenterPoint() {
		return new Point(this._map.getCoordinateFromPixel(this._getVisibleCenterPixel()));
	}

	_getMfpProjection() {
		return `EPSG:${this._mfpService.getCapabilities().srid}`;
	}

	_warnOnce(warnText) {
		if (!this._alreadyWarned) {
			emitNotification(warnText, LevelTypes.WARN);
			this._alreadyWarned = true;
		}
	}

	async _encodeMap() {
		const { id, scale, dpi } = this._storeService.getStore().getState().mfp.current;
		const rotation = getAzimuthFrom(this._mfpBoundaryFeature.getGeometry()) * 180 / Math.PI;
		const showGrid = this._storeService.getStore().getState().mfp.showGrid;
		const pageCenter = this._getVisibleCenterPoint();
		const encodingProperties = { layoutId: id, scale: scale, rotation: rotation, dpi: dpi, pageCenter: pageCenter, showGrid: showGrid };
		const specs = await this._encoder.encode(this._map, encodingProperties);

		startJob(specs);
	}
}
