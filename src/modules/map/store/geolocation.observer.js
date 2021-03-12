import { observe } from '../../../utils/storeUtils';
import { $injector } from '../../../injection';
import { setPosition, setAccuracy, setDenied, setTracking } from './geolocation.action';
import { changeCenter, setFit } from './position.action';
import { addLayer, removeLayer } from './layers.action';
import { BaObserver } from '../../BaObserver';

/**
 * Id of the layer used for geolocation visualization
 */
export const GEOLOCATION_LAYER_ID = 'geolocation_layer';

export class GeolocationObserver extends BaObserver {

	// constructor(store) {
	// 	super();
	// 	const {
	// 		TranslationService: translationService,
	// 		CoordinateService: coordinateService,
	// 		EnvironmentService: environmentService,
	// 		MapService: mapService
	// 	}
	// 		= $injector.inject('TranslationService', 'CoordinateService', 'EnvironmentService', 'MapService');
	// 	this._translationService = translationService;
	// 	this._coordinateService = coordinateService;
	// 	this._environmentService = environmentService;
	// 	this._mapService = mapService;

	// 	this._firstTimeActivatingGeolocation = true;
	// 	this._geolocationWatcherId = null;
	// 	this._store = store;
	// }

	_handlePositionError(error) {
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		console.warn('Geolocation activation failed', error);
		switch (error.code) {
			case error.PERMISSION_DENIED:
				setDenied(true);
				alert(translationService.translate('map_store_geolocation_denied'));
				break;
			default:
				alert(translationService.translate('map_store_geolocation_not_available'));
				break;
		}
	}

	_watchPosition() {
		return navigator.geolocation.watchPosition(
			(position) => this._handlePositionAndUpdateStore(position),
			(error) => this._handlePositionError(error),
			{
				maximumAge: 10000,
				enableHighAccuracy: true,
				timeout: 600000
			}
		);
	}

	_fit(position) {
		const positionEpsg3857 = this._transformPositionTo3857(position);
		const extent3857 = [...positionEpsg3857, ...positionEpsg3857];
		const geodeticExtent = this._coordinateService.transformExtent(
			extent3857,
			this._mapService.getSrid(),
			this._mapService.getDefaultGeodeticSrid()
		);
		const extent = this._coordinateService.transformExtent(
			this._coordinateService.buffer(geodeticExtent, position.coords.accuracy),
			this._mapService.getDefaultGeodeticSrid(),
			this._mapService.getSrid()
		);
		setFit(extent, { maxZoom: 16 });
	}

	_handlePositionAndUpdateStore(position) {

		//if geolocation was previously denied, we reset the flag
		if (this._store.getState().geolocation.denied) {
			setDenied(false);
		}

		const positionEpsg3857 = this._transformPositionTo3857(position);
		setPosition(positionEpsg3857);
		setAccuracy(position.coords.accuracy);
		// On the first time after activation we fit the map to an extent
		if (this._firstTimeActivatingGeolocation) {
			this._firstTimeActivatingGeolocation = false;
			this._fit(position);
		}
		// if tracking is active, we center the view of the map
		else if (this._store.getState().geolocation.tracking) {
			changeCenter(positionEpsg3857);
		}
	}

	_transformPositionTo3857(position) {
		const { CoordinateService: coordinateService } = $injector.inject('CoordinateService');
		const { coords } = position;
		return coordinateService.fromLonLat([coords.longitude, coords.latitude]);
	}

	_activate() {
		//after activation tracking is always enabled until the mapped is dragged by the user
		setTracking(true);
		this._geolocationWatcherId = this._watchPosition();
	}

	_deactivate() {
		if (this._geolocationWatcherId) {
			navigator.geolocation.clearWatch(this._geolocationWatcherId);
			this._geolocationWatcherId = null;
		}
	}

	_init(store) {
		const {
			TranslationService: translationService,
			CoordinateService: coordinateService,
			EnvironmentService: environmentService,
			MapService: mapService
		}
			= $injector.inject('TranslationService', 'CoordinateService', 'EnvironmentService', 'MapService');
		this._translationService = translationService;
		this._coordinateService = coordinateService;
		this._environmentService = environmentService;
		this._mapService = mapService;

		this._firstTimeActivatingGeolocation = true;
		this._geolocationWatcherId = null;
		this._store = store;
	}

	register(store) {
		
		this._init(store);

		const onGeolocationActivityChange = (active) => {

			if (active) {
				this._activate();
				addLayer(GEOLOCATION_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			}
			else {
				this._deactivate();
				removeLayer(GEOLOCATION_LAYER_ID);
			}
		};

		observe(store, state => state.geolocation.active, onGeolocationActivityChange);

		//disable tracking when map is dragged  by user
		observe(store, state => state.pointer.beingDragged, (beingDragged, state) => {
			if (state.geolocation.active && beingDragged) {
				setTracking(false);
			}
		});
	}
}

// export const register = (store, geolocationHandler = new GeolocationHandler(store)) => {

// 	const onGeolocationActivityChange = (active) => {

// 		if (active) {
// 			geolocationHandler.activate();
// 			addLayer(GEOLOCATION_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
// 		}
// 		else {
// 			geolocationHandler.deactivate();
// 			removeLayer(GEOLOCATION_LAYER_ID);
// 		}
// 	};

// 	observe(store, state => state.geolocation.active, onGeolocationActivityChange);

// 	//disable tracking when map is dragged  by user
// 	observe(store, state => state.pointer.beingDragged, (beingDragged, state) => {
// 		if (state.geolocation.active && beingDragged) {
// 			setTracking(false);
// 		}
// 	});
// };