import { $injector } from '../../../../injection';
import { AbstractAssistChip } from './AbstractAssistChip';
import baSvg from './assets/basolo.svg';
// import css from './bigMapChip.css';

/**
 *
 * @class
 * @author alsturm
 */
export class BigMapChip extends AbstractAssistChip {
	constructor() {
		super({});
		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);
		this._translationService = translationService;
		this._environmentService = environmentService;
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
		return translate('chips_assist_big_map');
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
	onClick() {
		alert('test');
	}

	static get tag() {
		return 'big-map-chip-chip';
	}
}
