import { observe } from '../../../utils/storeUtils';
import { $injector } from '../../../injection';
import { setPosition, setAccuracy, setDenied, setTracking } from './geolocation.action';
import { changeCenter, setFit } from './position.action';
import { addLayer, removeLayer } from './layers.action';


/**
 * Note: Parts of this code have been inspired by
 * https://github.com/geoadmin/web-mapviewer/blob/develop/src/modules/store/plugins/geolocation-management.plugin.js
 * licenced under MIT License.
 */

/**
 * Id of the layer used for geolocation visualization
 */
export const GEOLOCATION_LAYER_ID = 'geolocation_layer';

export class GeolocationHandler {
	constructor() {
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
	}

	_handlePositionError(error) {
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		console.warn('Geolocation activation failed', error);
		switch (error.code) {
			case error.PERMISSION_DENIED:
				setDenied(true);
				alert(translationService.translate('map_store_geolocation_denied'));
				break;
		}
	}

	_watchPosition(state) {
		return navigator.geolocation.watchPosition(
			(position) => this._handlePositionAndUpdateStore(position, state),
			(error) => this._handlePositionError(error)
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
		const bufferedExtent = this._coordinateService.transformExtent(
			this._coordinateService.buffer(geodeticExtent, position.coords.accuracy),
			this._mapService.getDefaultGeodeticSrid(),
			this._mapService.getSrid()
		);
		setFit({ extent:bufferedExtent });
	}

	_handlePositionSuccess(position, state) {

		// if geolocation was previously denied, we clear the flag
		if (state.geolocation.denied) {
			setDenied(false);
		}
		this._handlePositionAndUpdateStore(position, state);
		if (this._firstTimeActivatingGeolocation) {
			this._firstTimeActivatingGeolocation = false;
			setTracking(true);
			this._fit(position);
		}
		this._geolocationWatcherId = this._watchPosition(state);
	}

	_handlePositionAndUpdateStore(position, state) {
		const positionEpsg3857 = this._transformPositionTo3857(position);
		setPosition(positionEpsg3857);
		setAccuracy(position.coords.accuracy);
		// if tracking is active, we center the view of the map on the position received
		if (state.geolocation.tracking) {
			changeCenter(positionEpsg3857);
		}
	}

	_transformPositionTo3857(position) {
		const { CoordinateService: coordinateService } = $injector.inject('CoordinateService');
		const { coords } = position;
		return coordinateService.fromLonLat([coords.longitude, coords.latitude]);
	}

	activate(state) {
		const onSucess = (position) => {
			this._handlePositionSuccess(position, state);
		};

		navigator.geolocation.getCurrentPosition(onSucess, this._handlePositionError);
	}

	deactivate() {
		if (this._geolocationWatcherId) {
			navigator.geolocation.clearWatch(this._geolocationWatcherId);
			this._geolocationWatcherId = null;
		}
		this._firstTimeActivatingGeolocation = true;
	}
}

export const register = (store, geolocationHandler = new GeolocationHandler()) => {

	const onGeolocationActivityChange = (active, state) => {

		if (active) {
			geolocationHandler.activate(state);
			addLayer(GEOLOCATION_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
		}
		else {
			geolocationHandler.deactivate();
			removeLayer(GEOLOCATION_LAYER_ID);
		}
	};

	observe(store, state => state.geolocation.active, onGeolocationActivityChange);
	//disable tracking when map is moved by user
	observe(store, state => state.map.moveStart, () => setTracking(false));
};