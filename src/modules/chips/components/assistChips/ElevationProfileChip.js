/**
 * @module modules/chips/components/assistChips/ElevationProfileChip
 */
import { $injector } from '../../../../injection';
import { openProfile } from '../../../../store/elevationProfile/elevationProfile.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import profileSvg from './assets/profile.svg';

const Update_Profile_Coordinates = 'update_profile_coordinates';

/**
 * An AssistChip to show the elevation profile for an array of {@link module:domain/coordinateTypeDef~Coordinate}
 * @class
 * @extends {AbstractAssistChip}
 * @property {Array<module:domain/coordinateTypeDef~Coordinate>} coordinates the coordinates array, which defines the route of the requested elevation profile
 * @author thiloSchlemmer
 */
export class ElevationProfileChip extends AbstractAssistChip {
	constructor() {
		super({
			profileCoordinates: []
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._unsubscribeFromStore = this.observe(
			(state) => state.elevationProfile.coordinates,
			(coordinates) => this.signal(Update_Profile_Coordinates, coordinates)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Profile_Coordinates:
				return { ...model, profileCoordinates: [...data] };
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
		const { profileCoordinates } = this.getModel();
		return profileCoordinates.length > 1;
	}

	onClick() {
		const { profileCoordinates } = this.getModel();
		openProfile(profileCoordinates);
	}

	static get tag() {
		return 'ba-profile-chip';
	}

	set coordinates(value) {
		this._unsubscribeFromStore();
		this.signal(Update_Profile_Coordinates, value);
	}
}
