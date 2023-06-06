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
const Update_Media_Related_Properties = 'update_isPortrait';
/**
 * A content component to show available export actions
 * for specified (stringified) exportData
 * @class
 * @property {string} exportData the stringified collection of data, which should be exported
 * @author thiloSchlemmer
 */
export class ExportDialogContent extends MvuElement {
	constructor() {
		super({ exportData: null, isPortrait: false });
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, exportData: data };
			case Update_Media_Related_Properties:
				return { ...model, ...data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_Media_Related_Properties, { isPortrait: media.portrait })
		);
	}

	createView(model) {
		const { exportData, isPortrait } = model;
		const exportTypes = this._getExportTypes();

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		return html`<style>
				${css}
			</style>
			<div class="container ${getOrientationClass()}">
				${repeat(
					exportTypes,
					(exportType) => exportType.sourceType,
					(exportType) => html`<ba-export-item .exportType=${exportType} .exportData=${exportData}></ba-export-item>`
				)}
			</div>`;
	}

	// todo: could be moved to an exportTypes.provider to get the exportTypes as bvv-specific list,
	// nonetheless must this bvv-specific list match up with the list of possible (technically) formats
	// from the ExportVectorDataService
	_getExportTypes() {
		return [
			{ sourceTypeName: SourceTypeName.KML, mediaType: MediaType.KML, srids: [4326] },
			{ sourceTypeName: SourceTypeName.GPX, mediaType: MediaType.GPX, srids: [4326] },
			{ sourceTypeName: SourceTypeName.GEOJSON, mediaType: MediaType.GeoJSON, srids: [4326] },
			{ sourceTypeName: SourceTypeName.EWKT, mediaType: MediaType.TEXT_PLAIN, srids: [4326, 3857, 25832, 25833] }
		];
	}

	set exportData(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-export-content';
	}
}
