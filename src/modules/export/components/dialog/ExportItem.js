/**
 * @module modules/export/components/dialog/ExportItem
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import downloadSvg from './assets/download.svg';

const Update = 'update';
const Update_Selected_Srid = 'update_selected_srid';
/**
 * @typedef {Object} ExportContent
 * @property {module:services/domain/sourceType~SourceTypeName} sourceType
 * @property {Array<number>} srids
 * @property {string} data *
 */

/**
 * @class
 * @author thiloSchlemmer
 */
export class ExportItem extends MvuElement {
	constructor() {
		super({ sourceType: null, srids: null, selectedSrid: null, exportData: null });
		const { TranslationService, SourceTypeService, ExportVectorDataService } = $injector.inject(
			'TranslationService',
			'SourceTypeService',
			'ExportVectorDataService'
		);
		this._translationService = TranslationService;
		this._sourceTypeService = SourceTypeService;
		this._exportVectorDataService = ExportVectorDataService;
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, sourceType: data.sourceType, srids: data.srids, selectedSrid: data.srids[0], exportData: data.data };
			case Update_Selected_Srid:
				return { ...model, selectedSrid: data };
		}
	}

	createView(model) {
		const { sourceType: sourceTypeName, srids, selectedSrid, exportData } = model;
		const translate = (key) => this._translationService.translate(key);
		const onSridChange = (e) => {
			this.signal(Update_Selected_Srid, e.target.value);
		};

		return html`<div class="export-item__content">
			<div class="export-item__head">
				<div class="export-item__label">${translate(`export_item_label_${sourceTypeName}`)}</div>
				<div class="export-item__description">${translate(`export_item_description_${sourceTypeName}`)}</div>
			</div>
			<select id="srid" .value="${selectedSrid}" @change="${onSridChange}" ?disabled=${srids.length === 1}>
				${srids.map((srid) => html` <option value="${srid}">EPSG:${srid}</option> `)}
			</select>
			<label for="srid" class="control-label">${translate('export_item_srid_selection')}</label><i class="bar"></i>
			<ba-button
				id="download-button"
				.label=${translate(`export_item_download_${sourceTypeName}`)}
				.icon=${downloadSvg}
				.type=${'primary'}
				.disabled=${!selectedSrid || !exportData}
			></ba-button>
		</div>`;
	}

	/**
	 * content for export action
	 * @param {ExportContent} value
	 */
	set content(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-export-item';
	}
}
