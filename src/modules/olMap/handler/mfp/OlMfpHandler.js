import { $injector } from '../../../../injection';
import { observe } from '../../../../utils/storeUtils';

import { setScale } from '../../../../store/mfp/mfp.action';

import { Point, Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';
import { OlLayerHandler } from '../OlLayerHandler';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { createMapMaskFunction, mfpBoundaryStyleFunction, nullStyleFunction } from '../geolocation/styleUtils';


const Points_Per_Inch = 72; // PostScript points 1/72"
const MM_Per_Inches = 25.4 ;
const Units_Ratio = 39.37; // inches per meter

/**
 * @class
 * @author thiloSchlemmer
 */
export class OlMfpHandler extends OlLayerHandler {

	constructor() {
		super('mfp_layer');
		const { StoreService: storeService, TranslationService: translationService, MapService: mapService, MfpService: mfpService }
			= $injector.inject('StoreService', 'TranslationService', 'MapService', 'MfpService');

		this._storeService = storeService;
		this._translationService = translationService;
		this._mapService = mapService;
		this._mfpService = mfpService;
		this._mfpBoundaryFeature = new Feature();
		this._map = null;
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
		}

		observe(this._storeService.getStore(), state => state.mfp.current, (current) => {
			if (current) {
				this._mfpBoundaryFeature.setGeometry(this._createMpfBoundary(current));
			}
		});
		const optimalScale = this._getOptimalScale(olMap);
		if (optimalScale) {
			setScale(optimalScale);
		}
		setScale();

		this._mfpBoundaryFeature.setStyle(mfpBoundaryStyleFunction);
		this._mfpLayer.on('postrender', createMapMaskFunction(this._map, this._mfpBoundaryFeature));
		return this._mfpLayer;
	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		//use the map to unregister event listener, interactions, etc
		this._mfpBoundaryFeature.setStyle(nullStyleFunction);
		this._listeners.forEach(l => unByKey(l));
		this._listeners = [];
		this._map = null;
	}

	_getOptimalScale(map) {
		const getEffectiveSizeFromPadding = (padding) => {
			return { width: padding.right - padding.left, height: padding.bottom - padding.top };
		};
		const availableSize = getEffectiveSizeFromPadding(this._mapService.getVisibleViewport(map.getTarget()));

		// const availableSize = { width: map.getSize()[0], height: map.getSize()[1] };
		const resolution = map.getView().getResolution();
		const width = resolution * availableSize.width;
		const height = resolution * availableSize.height;

		const { id, scale: fallbackScale } = this._storeService.getStore().getState().mfp.current;
		const layoutSize = this._mfpService.byId(id).mapSize;

		const scaleWidth = width * Units_Ratio * Points_Per_Inch / layoutSize.width;
		const scaleHeight = height * Units_Ratio * Points_Per_Inch / layoutSize.height;

		const testScale = Math.min(scaleWidth, scaleHeight);
		const scaleCandidates = [...this._mfpService.byId(id).scales];
		const bestScale = scaleCandidates.sort((a, b) => a - b).some(scale => testScale > scale);
		return bestScale ? bestScale : fallbackScale;
	}

	_createMpfBoundary(mfpSettings) {
		const { id, scale } = mfpSettings;

		const layoutSize = this._mfpService.byId(id).mapSize;
		const w = layoutSize.width / Points_Per_Inch * MM_Per_Inches / 1000.0 * scale ;
		const h = layoutSize.height / Points_Per_Inch * MM_Per_Inches / 1000.0 * scale ;

		const getVisibleCenter = () => {
			const viewPort = this._mapService.getVisibleViewport(this._map.getTarget());
			return [(viewPort.right + viewPort.left) / 2, (viewPort.bottom + viewPort.top) / 2];
		};

		const center = this._map.getCoordinateFromPixel(getVisibleCenter());
		const geodeticCenter = new Point(center).clone().transform('EPSG:' + this._mapService.getDefaultSridForView(), 'EPSG:' + this._mapService.getDefaultGeodeticSrid());

		const geodeticBoundingBox = {
			minX: geodeticCenter[0] - (w / 2),
			minY: geodeticCenter[1] - (h / 2),
			maxX: geodeticCenter[0] + (w / 2),
			maxY: geodeticCenter[1] + (h / 2)
		};
		const geodeticBoundary = new Polygon([[
			[geodeticBoundingBox.minX, geodeticBoundingBox.minY],
			[geodeticBoundingBox.maxX, geodeticBoundingBox.minY],
			[geodeticBoundingBox.maxX, geodeticBoundingBox.maxY],
			[geodeticBoundingBox.minX, geodeticBoundingBox.maxY],
			[geodeticBoundingBox.minX, geodeticBoundingBox.minY]
		]]);
		return geodeticBoundary.clone().transform('EPSG:' + this._mapService.getDefaultGeodeticSrid(), 'EPSG:' + this._mapService.getDefaultSridForView());
	}
}
