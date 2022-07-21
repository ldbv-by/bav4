import { $injector } from '../../../../injection';
import { observe } from '../../../../utils/storeUtils';
import { OlMapHandler } from '../OlMapHandler';
import { setScale } from '../../../../store/mfp/mfp.action';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';


const Points_Per_Inch = 72; // PostScript points 1/72"
const MM_Per_Inches = 25.4 ;
const Units_Ratio = 39.37; // inches per meter

/**
 * @class
 * @author thiloSchlemmer
 */
export class OlMfpHandler extends OlMapHandler {

	constructor() {
		super('Mfp_Handler');
		const { StoreService: storeService, TranslationService: translationService, MapService: mapService, MfpService: mfpService }
			= $injector.inject('StoreService', 'TranslationService', 'MapService', 'MfpService');

		this._storeService = storeService;
		this._translationService = translationService;
		this._mapService = mapService;
		this._mfpService = mfpService;
		this._mfpSettings = null;
		this._mfpBoundary = null;
		this._map = null;
	}

	/**
	 *
	 * @override
	 */
	register(map) {
		this._map = map;
		setScale(this._getOptimalScale(map));
		observe(this._storeService.getStore(), state => state.mfp.current, (current) => {
			this._mfpSettings = current;
			this._updateRectangle();
		});

		const registerListeners = () => {
			this._listeners = [this._map.on('precompose', (e) => e.context.save()),
				this._map.on('postcompose', this._handlePostCompose),
				this._map.on('change:size', this._updateRectangle),
				this._map.getView().on('propertychange', this._updateRectangle)];
		};

		const deregisterListeners = () => {
			this._listeners.forEach(l => unByKey(l));
			this._listeners = [];
		};

		observe(this._storeService.getStore(), state => state.mfp.active, (active) => {
			if (active) {
				registerListeners();
			}
			deregisterListeners;
		});

	}

	_handlePostCompose(e) {
		const context = e.context;

		const size = this._map.getSize();
		const width = size[0] * DEVICE_PIXEL_RATIO;
		const height = size[1] * DEVICE_PIXEL_RATIO;


		context.beginPath();
		// the outside polygon -> clockwise
		context.moveTo(0, 0);
		context.lineTo(width, 0);
		context.lineTo(width, height);
		context.lineTo(0, height);
		context.lineTo(0, 0);
		context.closePath();

		// the hole (inner polygon) -> counter-clockwise
		const hole = this._mfpBoundary.getCoordinates(true);
		hole.forEach((element, index, array) => {
			if (index === 0) { // first
				context.moveTo(element[0], element[1]);
			}
			if (index === array.length - 1) { //last
				const firstElement = array[0];
				context.lineTo(element[0], element[1]);
				context.lineTo(firstElement[0], firstElement[1]);
			}
			context.lineTo(element[0], element[1]);
		});
		context.closePath();

		context.fillStyle = 'rgba(0,5,25,0.75)';
		context.fill();
		context.restore();
	}

	_getOptimalScale(map) {
		const getSizeFromViewPort = (vp) => {
			return { width: vp.right - vp.left, height: vp.bottom - vp.top };
		};
		const availableSize = getSizeFromViewPort(this._mapService.getVisibleViewPort(map.target));
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

	_updateRectangle() {
		const { id, scale } = this._mfpSetting;

		const layoutSize = this._mapService.byId(id).mapSize;
		const w = layoutSize.width / Points_Per_Inch * MM_Per_Inches / 1000.0 * scale ;
		const h = layoutSize.height / Points_Per_Inch * MM_Per_Inches / 1000.0 * scale ;

		const getVisibleCenter = () => {
			const viewPort = this._mapService.getVisibleViewPort(this._map.target);
			return [(viewPort.right + viewPort.left) / 2, (viewPort.bottom + viewPort.top) / 2];
		};

		const center = this._map.getCoordinateFromPixel(getVisibleCenter());
		const geodeticCenter = center.clone().transform(this._mapService.getDefaultSridForView(), this._mapService.getDefaultGeodeticSrid());

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
		this._mfpBoundary = geodeticBoundary.clone().transform(this._mapService.getDefaultGeodeticSrid(), this._mapService.getDefaultSridForView());
	}
}
