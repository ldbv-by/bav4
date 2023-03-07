import { $injector } from '../../../../injection';
import { AbstractAssistChip } from './AbstractAssistChip';
import baSvg from './assets/ba.svg';

/**
 *
 * @class
 * @author alsturm
 */
export class BigMapChip extends AbstractAssistChip {
	constructor() {
		super({
			profileCoordinates: []
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 * @override
	 */
	getIcon() {
		return baSvg;
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
		return this._environmentService.isEmbedded();
	}

	/**
	 * @override
	 */
	onClick() {}

	/**
	 * @override
	 */
	onDisconnect() {
		this._unsubscribeFromStore();
	}

	static get tag() {
		return 'big-map-chip-chip';
	}
}
