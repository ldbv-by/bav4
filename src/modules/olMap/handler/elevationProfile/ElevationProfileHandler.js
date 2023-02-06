import { Point, LinearRing, LineString, Polygon } from 'ol/geom';
import { Select } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { $injector } from '../../../../injection';
import { updateCoordinates } from '../../../../store/elevationProfile/elevationProfile.action';
import { OlMapHandler } from '../OlMapHandler';

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
			const empty = [];
			const featureCount = features.getLength();

			if (featureCount === 1) {
				const selectedFeature = selectedFeatures.getArray()[0];

				const geometry = selectedFeature.getGeometry();
				if (geometry instanceof Point) {
					return empty;
				}
				if (geometry instanceof LineString) {
					return geometry.getCoordinates();
				}
				else if (geometry instanceof LinearRing) {
					return geometry.getCoordinates();
				}
				else if (geometry instanceof Polygon) {
					return geometry.getCoordinates(false)[0];
				}
			}
			return empty;
		};
		const coordinates = getCoordinates(selectedFeatures);
		updateCoordinates(coordinates);
	}

	_updateListener(select) {
		if (this._listener) {
			unByKey(this._listener);
		}
		if (select) {
			this._listeners.push(select.getFeatures().on('add', (e) => this._updateCoordinates(e)));
			this._listeners.push(select.getFeatures().on('remove', (e) => this._updateCoordinates(e)));
		}
	}
}
