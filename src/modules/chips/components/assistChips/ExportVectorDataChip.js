/**
 * @module modules/chips/components/assistChips/ExportVectorDataChip
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { openModal } from '../../../../store/modal/modal.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import exportSvg from './assets/download.svg';

const Update_Data = 'update_data';
/**
 * AssistChip to show the availability of export actions
 * @class
 * @extends {AbstractAssistChip}
 * @property {String} exportData the stringified representation of the features, available for an export
 * @author thiloSchlemmer
 */
export class ExportVectorDataChip extends AbstractAssistChip {
	constructor() {
		super({
			data: null
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		this.title = this._translationService.translate('chips_assist_chip_export_title');
	}

	update(type, data, model) {
		switch (type) {
			case Update_Data:
				return { ...model, data: data };
			default:
				return super.update(type, data, model);
		}
	}

	getIcon() {
		return exportSvg;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_export');
	}

	isVisible() {
		const { data } = this.getModel();
		return !!data;
	}

	onClick() {
		const { data } = this.getModel();
		const translate = (key) => this._translationService.translate(key);
		openModal(translate('chips_assist_chip_export'), html`<ba-export-content .exportData=${data}></ba-export-content>`);
	}

	set exportData(value) {
		this.signal(Update_Data, value);
	}

	static get tag() {
		return 'ba-export-vector-data-chip';
	}
}
