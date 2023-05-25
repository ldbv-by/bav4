/**
 * @module modules/export/components/dialog/ExportDialogContent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { SourceTypeName } from '../../../../domain/sourceType';
import { repeat } from 'lit-html/directives/repeat.js';
// @ts-ignore
import css from './exportDialogContent.css';

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
		const exportTypes = this.getExportTypes(exportData);
		return html`<style>
				${css}
			</style>
			<div class="export_content">
				${repeat(
					exportTypes,
					(exportType) => exportType.sourceType,
					(exportType) => html`<ba-export-item .content=${exportType}></ba-export-item>`
				)}
			</div>`;
	}

	/**
	 * creates the available ExportTypes
	 * @param {string} exportData the data to export
	 * @returns {Array<import('./ExportItem').ExportType>}
	 */
	getExportTypes(exportData) {
		return [
			{ sourceType: SourceTypeName.KML, srids: [4326], data: exportData },
			{ sourceType: SourceTypeName.GPX, srids: [4326], data: exportData },
			{ sourceType: SourceTypeName.GEOJSON, srids: [4326, 3857, 25832, 25833], data: exportData },
			{ sourceType: SourceTypeName.EWKT, srids: [4326, 3857, 25832, 25833], data: exportData }
		];
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
