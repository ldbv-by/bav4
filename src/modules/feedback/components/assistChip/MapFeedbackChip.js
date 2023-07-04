/**
 * @module modules/feedback/components/assistChip/MapFeedbackChip
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection/index';
import { closeModal, openModal } from '../../../../store/modal/modal.action';
import { isCoordinate } from '../../../../utils/checks';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import { FeedbackType } from '../toggleFeedback/ToggleFeedbackPanel';
import mapFeedbackIcon from './assets/map.svg';

const Update = 'update';

/**
 * AssistChip to open the MapFeedback directly with a predefined center coordinate
 * @class
 * @property {module:domain/coordinateTypeDef~Coordinate} center The center coordinate of the map feedback
 * @author thiloSchlemmer
 */
export class MapFeedbackChip extends AbstractAssistChip {
	constructor() {
		super({ center: null });
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					center: data
				};
		}
	}

	getIcon() {
		return mapFeedbackIcon;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('map_assistChips_map_feedback_label');
	}

	isVisible() {
		const { center } = this.getModel();
		return isCoordinate(center);
	}

	async onClick() {
		const { center } = this.getModel();
		const translate = (key) => this._translationService.translate(key);
		const title = translate('map_assistChips_map_feedback_title');
		const content = html`<ba-mvu-togglefeedbackpanel
			.onSubmit=${closeModal}
			.type=${FeedbackType.MAP}
			.center=${center}
		></ba-mvu-togglefeedbackpanel>`;

		openModal(title, content);
	}

	set center(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-map-feedback-chip';
	}
}
