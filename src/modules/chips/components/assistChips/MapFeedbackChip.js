/**
 * @module modules/chips/components/assistChips/MapFeedbackChip
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection/index';
import { closeModal, openModal } from '../../../../store/modal/modal.action';
import { isCoordinate } from '../../../../utils/checks';
import { AbstractAssistChip } from './AbstractAssistChip';
import { FeedbackType } from '../../../feedback/components/toggleFeedback/ToggleFeedbackPanel';
import mapFeedbackIcon from './assets/map.svg';

const Update = 'update';

/**
 * AssistChip to open the MapFeedback directly with a predefined center coordinate
 * @class
 * @extends {AbstractAssistChip}
 * @property {module:domain/coordinateTypeDef~Coordinate} center The center coordinate of the map feedback
 * @author thiloSchlemmer
 */
export class MapFeedbackChip extends AbstractAssistChip {
	constructor() {
		super({ center: null });
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	onInitialize() {
		this.title = this._translationService.translate('chips_assist_chip_map_feedback_title');
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					center: data
				};
			default:
				return super.update(type, data, model);
		}
	}

	getIcon() {
		return mapFeedbackIcon;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_map_feedback_label');
	}

	isVisible() {
		const { center } = this.getModel();
		return isCoordinate(center);
	}

	async onClick() {
		const { center } = this.getModel();
		const translate = (key) => this._translationService.translate(key);
		const title = translate('chips_assist_chip_map_feedback_modal_title');
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
