import { $injector } from '../../../../injection';
import { openProfile } from '../../../../store/elevationProfile/elevationProfile.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import profileSvg from './assets/profile.svg';


const Update_Profile_Coordinates = 'update_selected_ids';

/**
 *
 * @class
 * @author thiloSchlemmer
 */
export class ElevationProfileChip extends AbstractAssistChip {
	constructor() {
		super({
			profileCoordinates: []
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}


	onInitialize() {
		this.observe(state => state.elevationProfile.coordinates, (coordinates) => this.signal(Update_Profile_Coordinates, coordinates));
	}

	update(type, data, model) {
		switch (type) {
			case Update_Profile_Coordinates:
				return { ...model, profileCoordinates: data };
		}
	}

	/**
	 * @override
	 */
	getIcon() {
		return profileSvg;
	}

	/**
	 * @override
	 */
	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_elevation_profile');
	}

	/**
	 * @override
	 */
	isVisible() {
		const { profileCoordinates } = this.getModel();
		return profileCoordinates.length > 1;
	}

	/**
	 * @override
	 */
	onClick() {
		const { profileCoordinates } = this.getModel();
		openProfile(profileCoordinates);
	}

	static get tag() {
		return 'ba-profile-chip';
	}
}
