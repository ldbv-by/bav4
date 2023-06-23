/**
 * @module modules/export/components/dialog/ExportDialogContent
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { SourceTypeName } from '../../../../domain/sourceType';
import { repeat } from 'lit-html/directives/repeat.js';
// @ts-ignore
import css from './exportDialogContent.css';
import { MediaType } from '../../../../domain/mediaTypes';
import { $injector } from '../../../../injection/index';

const Update = 'update';
const Update_Export_Types = 'update_export_types';
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
		super({ exportData: null, isPortrait: false, exportTypes: null });
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, exportData: data };
			case Update_Media_Related_Properties:
				return { ...model, ...data };
			case Update_Export_Types:
				return { ...model, exportTypes: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_Media_Related_Properties, { isPortrait: media.portrait })
		);
		this.signal(Update_Export_Types, this._getExportTypes());
	}

	createView(model) {
		const { exportData, isPortrait, exportTypes } = model;

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

	_getExportTypes() {
		const { ProjectionService: projectionService } = $injector.inject('ProjectionService');
		return [
			{ sourceTypeName: SourceTypeName.KML, mediaType: MediaType.KML, srids: [4326] /* defined by KML standard specification */ },
			{ sourceTypeName: SourceTypeName.GPX, mediaType: MediaType.GPX, srids: [4326] /* defined by GPX standard specification */ },
			{ sourceTypeName: SourceTypeName.GEOJSON, mediaType: MediaType.GeoJSON, srids: [4326] /* defined by GeoJSON standard specification */ },
			{
				sourceTypeName: SourceTypeName.EWKT,
				mediaType: MediaType.TEXT_PLAIN,
				srids: projectionService.getProjections() /* various srids, defined by application capabilities */
			}
		];
	}

	set exportData(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-export-content';
	}
}
