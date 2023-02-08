import { $injector } from '../../../../injection';
import { openProfile } from '../../../../store/elevationProfile/elevationProfile.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import profileSvg from './assets/profile.svg';


const Update_Profile_Coordinates = 'update_profile_coordinates';


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
		this._unsubscribeFromStore = this._usePropertyValue ? null : this.observe(state => state.elevationProfile.coordinates, (coordinates) => this.signal(Update_Profile_Coordinates, coordinates));
	}

	update(type, data, model) {
		switch (type) {
			case Update_Profile_Coordinates:
				return { ...model, profileCoordinates: [...data] };
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
		const forceTo2D = (coordinates) => coordinates.map(c => c.slice(0, 2));

		openProfile(forceTo2D(profileCoordinates));
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._unsubscribeFromStore();
	}

	static get tag() {
		return 'ba-profile-chip';
	}

	set coordinates(value) {
		this._unsubscribeFromStore();
		this.signal(Update_Profile_Coordinates, value);
	}
}
