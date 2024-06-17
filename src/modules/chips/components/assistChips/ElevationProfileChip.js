/**
 * @module modules/chips/components/assistChips/ElevationProfileChip
 */
import { $injector } from '../../../../injection';
import { openProfile } from '../../../../store/elevationProfile/elevationProfile.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import profileSvg from './assets/profile.svg';

const Update_Profile_Coordinates = 'update_profile_coordinates';
const Update_Profile_Id = 'update_profile_Id';

/**
 * An AssistChip to open the elevation profile, optionally for an array of {@link module:domain/coordinateTypeDef~Coordinate}
 * @class
 * @extends {AbstractAssistChip}
 * @property {Array<module:domain/coordinateTypeDef~CoordinateLike>} coordinates the coordinates array, which defines the route of the requested elevation profile
 * @author thiloSchlemmer
 */
export class ElevationProfileChip extends AbstractAssistChip {
	constructor() {
		super({
			profileCoordinates: null,
			id: null
		});
		const { TranslationService, ElevationService } = $injector.inject('TranslationService', 'ElevationService');
		this._translationService = TranslationService;
		this._elevationService = ElevationService;
		this._unsubscribeFromStore = this.observe(
			(state) => state.elevationProfile.id,
			(id) => this.signal(Update_Profile_Id, id)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Profile_Coordinates:
				return { ...model, profileCoordinates: [...data] };
			case Update_Profile_Id:
				return { ...model, id: data };
		}
	}

	getIcon() {
		return profileSvg;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_elevation_profile');
	}

	isVisible() {
		const { profileCoordinates, id } = this.getModel();
		return profileCoordinates ? profileCoordinates.length > 1 : !!id;
	}

	onClick() {
		const { profileCoordinates } = this.getModel();
		if (profileCoordinates?.length > 1) {
			this._elevationService.requestProfile(profileCoordinates);
		}
		openProfile();
	}

	static get tag() {
		return 'ba-profile-chip';
	}

	set coordinates(coordinates) {
		this._unsubscribeFromStore();
		this.signal(Update_Profile_Coordinates, coordinates);
	}
}
