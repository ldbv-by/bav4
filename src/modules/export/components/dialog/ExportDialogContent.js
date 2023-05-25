/**
 * @module modules/export/components/dialog/ExportDialogContent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { SourceTypeName } from '../../../../domain/sourceType';

const Update = 'update';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ExportDialogContent extends MvuElement {
	constructor() {
		super({ exportData: null });
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, exportData: data };
		}
	}

	createView(model) {
		const { exportData } = model;
		const exportContent = { sourceType: SourceTypeName.KML, srids: [4326], data: exportData };
		return html`<div class="export_content">
			<ba-export-item .content=${exportContent}></ba-export-item>
			${exportData}
		</div>`;
	}

	/**
	 * sets the data which should be exported
	 * @param {String} value the export data; wether a plain string or a geoResourceId
	 */
	set exportData(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-export-content';
	}
}
