import { $injector } from '../../../../injection';
import { AbstractAssistChip } from './AbstractAssistChip';
import profileSvg from './assets/profile.svg';


const Update_Selected_Ids = 'update_selected_ids';

/**
 *
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 */
export class ProfileChip extends AbstractAssistChip {
	constructor() {
		super({
			selectedIds: []
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}


	onInitialize() {
		this.observe(state => state.measurement.selection, (ids) => this.signal(Update_Selected_Ids, ids));
	}

	update(type, data, model) {
		switch (type) {
			case Update_Selected_Ids:
				return { ...model, selectedIds: data };
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
		return translate('chips_assist_chip_profile');
	}


	/**
     * @override
     */
	isVisible() {
		const { selectedIds } = this.getModel();
		return selectedIds.length === 1;
	}

	/**
     * @override
     */
	onClick() {
		console.warn('onClick-handler is not yet implemented');
	}

	static get tag() {
		return 'ba-profile-chip';
	}
}
