/**
 * @module modules/chips/components/assistChips/AddToCollectionChip
 */
import { $injector } from '../../../../injection';
import { AbstractAssistChip } from './AbstractAssistChip';
import starSvg from './assets/star.svg';

/**

 */
export class AddToCollectionChip extends AbstractAssistChip {
	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;

		this._onClick = () => {};
	}

	getIcon() {
		return starSvg;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('featureInfo_featureCollection_add_feature');
	}

	isVisible() {
		return true;
	}

	onClick() {
		this._onClick();
	}

	static get tag() {
		return 'ba-add-collection-chip';
	}
}
