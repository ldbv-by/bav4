/**
 * @module modules/olMap/handler/elevationProfile/OlElevationProfileHandler
 */
import { Modify, Select } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { $injector } from '../../../../injection';
import { updateCoordinates } from '../../../../store/elevationProfile/elevationProfile.action';
import { observe } from '../../../../utils/storeUtils';
import {
	getLineString,
	PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES,
	PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857,
	simplify
} from '../../utils/olGeometryUtils';
import { InteractionStateType } from '../../utils/olInteractionUtils';
import { OlMapHandler } from '../OlMapHandler';

const Empty_Elevation_Profile_Coordinates = [];
export class OlElevationProfileHandler extends OlMapHandler {
	constructor() {
		super('Elevation_Profile_Handler');

		const { StoreService: storeService } = $injector.inject('StoreService');
		this._storeService = storeService;
		this._mapListeners = { select: [], modify: [] };
		this._map = null;
	}

	/**
	 * @override
	 */
	register(map) {
		this._map = map;
		const interactions = map.getInteractions();
		interactions.on('add', (e) => {
			if (e.element instanceof Select) {
				this._updateListener(InteractionStateType.SELECT, e.element);
			}

			if (e.element instanceof Modify) {
				this._updateListener(InteractionStateType.MODIFY, e.element);
			}
		});

		interactions.on('remove', (e) => {
			if (e.element instanceof Select) {
				this._updateListener(InteractionStateType.SELECT, null);
			}
			if (e.element instanceof Modify) {
				this._updateListener(InteractionStateType.MODIFY, null);
			}
		});
		observe(
			this._storeService.getStore(),
			(state) => state.elevationProfile.active,
			(active) => this._updateSelectCoordinatesOnClose(active)
		);
	}

	_updateSelectCoordinatesOnClose(active) {
		const isClosed = !active;
		const select = this._map
			.getInteractions()
			.getArray()
			.find((interaction) => interaction instanceof Select);
		const coordinates = select ? this._getCoordinates(select.getFeatures()) : Empty_Elevation_Profile_Coordinates;

		if (isClosed) {
			updateCoordinates(coordinates);
		}
	}

	_getCoordinates(features) {
		const featureCount = features.getLength();
		const force2D = (coordinates) => coordinates.map((c) => c.slice(0, 2));

		if (featureCount === 1) {
			const feature = features.getArray()[0];
			const geometry = simplify(
				getLineString(feature.getGeometry()),
				PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES,
				PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857
			);
			return geometry ? force2D(geometry.getCoordinates()) : Empty_Elevation_Profile_Coordinates;
		}
		return Empty_Elevation_Profile_Coordinates;
	}

	_updateSelectCoordinates(event) {
		const selectedFeatures = event.target;
		const coordinates = this._getCoordinates(selectedFeatures);
		updateCoordinates(coordinates);
	}

	_updateModifyCoordinates(event) {
		const modifiedFeatures = event.features;
		const coordinates = this._getCoordinates(modifiedFeatures);
		updateCoordinates(coordinates);
	}

	_updateListener(type, interaction) {
		const listeners = this._mapListeners[type];
		if (listeners.length > 0) {
			listeners.forEach((listener) => unByKey(listener));
			this._mapListeners[type] = [];
			updateCoordinates(Empty_Elevation_Profile_Coordinates);
		}
		if (interaction) {
			switch (type) {
				case InteractionStateType.SELECT:
					listeners.push(interaction.getFeatures().on('add', (e) => this._updateSelectCoordinates(e)));
					listeners.push(interaction.getFeatures().on('remove', (e) => this._updateSelectCoordinates(e)));
					break;
				case InteractionStateType.MODIFY:
					listeners.push(interaction.on('modifyend', (e) => this._updateModifyCoordinates(e)));
					break;
			}
		}
	}
}
