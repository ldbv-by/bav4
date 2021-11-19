import { observe } from '../utils/storeUtils';
import { $injector } from '../injection';
import { setPosition, setAccuracy, setDenied, setTracking } from '../store/geolocation/geolocation.action';
import { changeCenter, setFit } from '../store/position/position.action';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { BaPlugin } from '../plugins/BaPlugin';
import { provide as provider } from './i18n/geolocationPlugin.provider';


/**
 * Id of the layer used for geolocation visualization
 * @class
 * @author taulinger
 */
export const GEOLOCATION_LAYER_ID = 'geolocation_layer';

export class GeolocationPlugin extends BaPlugin {

	constructor() {
		super();
		this._firstTimeActivatingGeolocation = true;
		this._geolocationWatcherId = null;
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		translationService.register('geolocationPluginProvider', provider);
	}

	_handlePositionError(error) {
		console.warn('Geolocation activation failed', error);
		switch (error.code) {
			case error.PERMISSION_DENIED:
				setDenied(true);
				alert(this._translationService.translate('geolocationPlugin_store_geolocation_denied'));
				break;
			default:
				alert(this._translationService.translate('geolocationPlugin_store_geolocation_not_available'));
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
		const { MapService: mapService, CoordinateService: coordinateService } = $injector.inject('MapService', 'CoordinateService');

		const positionEpsg3857 = this._transformPositionTo3857(position);
		const extent3857 = [...positionEpsg3857, ...positionEpsg3857];
		const geodeticExtent = coordinateService.transformExtent(
			extent3857,
			mapService.getSrid(),
			mapService.getDefaultGeodeticSrid()
		);
		const extent = coordinateService.transformExtent(
			coordinateService.buffer(geodeticExtent, position.coords.accuracy),
			mapService.getDefaultGeodeticSrid(),
			mapService.getSrid()
		);
		setFit(extent, { maxZoom: 16 });
	}

	_handlePositionAndUpdateStore(position) {
		const {
			StoreService: storeService
		}
			= $injector.inject('StoreService');

		//if geolocation was previously denied, we reset the flag
		if (storeService.getStore().getState().geolocation.denied) {
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
		else if (storeService.getStore().getState().geolocation.tracking) {
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
		if (this._geolocationWatcherId !== null) {
			navigator.geolocation.clearWatch(this._geolocationWatcherId);
			this._geolocationWatcherId = null;
		}
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

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
