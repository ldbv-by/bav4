import { Select } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { $injector } from '../../../../injection';
import { updateCoordinates } from '../../../../store/elevationProfile/elevationProfile.action';
import { getLineString } from '../../utils/olGeometryUtils';
import { OlMapHandler } from '../OlMapHandler';

const Empty_Elevation_Profile_Coordinates = [];
export class ElevationProfileHandler extends OlMapHandler {
	constructor() {
		super('Elevation_Profile_Handler');

		const { StoreService: storeService } = $injector.inject('StoreService');
		this._storeService = storeService;
		this._listeners = [];
	}

	/**
	 *
	 * @override
	 */
	register(map) {
		const interactions = map.getInteractions();
		interactions.on('add', (e) => {
			if (e.element instanceof Select) {
				this._updateListener(e.element);
			}
		});

		interactions.on('remove', (e) => {
			if (e.element instanceof Select) {
				this._updateListener(null);
			}
		});

	}

	_updateCoordinates(event) {
		const selectedFeatures = event.target;

		const getCoordinates = (features) => {
			const featureCount = features.getLength();

			if (featureCount === 1) {
				const selectedFeature = selectedFeatures.getArray()[0];
				const geometry = getLineString(selectedFeature.getGeometry());
				return geometry ? geometry.getCoordinates() : Empty_Elevation_Profile_Coordinates;
			}
			return Empty_Elevation_Profile_Coordinates;
		};
		const coordinates = getCoordinates(selectedFeatures);
		updateCoordinates(coordinates);
	}

	_updateListener(select) {

		if (this._listeners.length > 0) {
			this._listeners.forEach(listener => unByKey(listener));
			this._listeners = [];
			updateCoordinates(Empty_Elevation_Profile_Coordinates);
		}
		if (select) {
			this._listeners.push(select.getFeatures().on('add', (e) => this._updateCoordinates(e)));
			this._listeners.push(select.getFeatures().on('remove', (e) => this._updateCoordinates(e)));
		}
	}
}
