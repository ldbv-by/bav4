/**
 * @module modules/export/components/dialog/ExportDialogContent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { SourceTypeName } from '../../../../domain/sourceType';
import { repeat } from 'lit-html/directives/repeat.js';
// @ts-ignore
import css from './exportDialogContent.css';
import { MediaType } from '../../../../services/HttpService';

const Update = 'update';

/**
 * A content component to show available export actions
 * for specified (stringified) exportData
 * @class
 * @property {string} exportData the stringified collection of data, which should be exported
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
		const exportTypes = this.getExportTypes();
		return html`<style>
				${css}
			</style>
			<div class="export_content">
				${repeat(
					exportTypes,
					(exportType) => exportType.sourceType,
					(exportType) => html`<ba-export-item .exportType=${exportType} .exportData=${exportData}></ba-export-item>`
				)}
			</div>`;
	}

	getExportTypes() {
		return [
			{ sourceType: SourceTypeName.KML, mediaType: MediaType.KML, fileExtension: 'kml', srids: [4326] },
			{ sourceType: SourceTypeName.GPX, mediaType: MediaType.GPX, fileExtension: 'gpx', srids: [4326] },
			{
				sourceType: SourceTypeName.GEOJSON,
				mediaType: MediaType.GeoJSON,
				fileExtension: 'geojson',
				srids: [4326, 3857, 25832, 25833]
			},
			{ sourceType: SourceTypeName.EWKT, mediaType: MediaType.TEXT_PLAIN, fileExtension: 'txt', srids: [4326, 3857, 25832, 25833] }
		];
	}

	set exportData(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-export-content';
	}
}
