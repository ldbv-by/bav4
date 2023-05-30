/**
 * @module modules/export/components/assistChip/ExportVectorDataChip
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { openModal } from '../../../../store/modal/modal.action';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import exportSvg from './assets/download.svg';
import { KML } from 'ol/format';
import { VectorGeoResource } from '../../../../domain/geoResources';
import { Feature } from 'ol';

const Update_GeoResource_ID = 'update_georesource_id';
const Update_Feature = 'update_feature';
/**
 * AssistChip to show the availability of export actions
 * @class
 * @property {String} geoResourceId the ID of a existing {@link VectorGeoResource}
 * @property {Feature} feature the single {@link ol.Feature}, available for an export
 * @author thiloSchlemmer
 */
export class ExportVectorDataChip extends AbstractAssistChip {
	constructor() {
		super({
			geoResourceId: null,
			feature: null
		});
		const { TranslationService, GeoResourceService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._geoResourceService = GeoResourceService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_GeoResource_ID:
				return { ...model, geoResourceId: data, feature: null };
			case Update_Feature:
				return { ...model, feature: data, geoResourceId: null };
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
		const { geoResourceId, feature } = this.getModel();

		return geoResourceId || feature;
	}

	onClick() {
		const { geoResourceId, feature } = this.getModel();

		const fromGeoResource = (geoResourceId) => {
			const geoResource = this._geoResourceService.byId(geoResourceId);
			return geoResource.data ?? null;
		};

		const fromFeature = (feature) => {
			return new KML().writeFeature(feature);
		};

		const exportData = geoResourceId ? fromGeoResource(geoResourceId) : fromFeature(feature);

		openModal('Export', html`<ba-export-dialog .exportData=${exportData}></ba-export-dialog>`);
	}

	set geoResourceId(value) {
		const geoResource = this._geoResourceService.byId(value);
		if (geoResource && geoResource instanceof VectorGeoResource) {
			this.signal(Update_GeoResource_ID, value);
		} else {
			console.warn('value is not a valid ID for an existing instance of VectorGeoResource', value);
		}
	}

	set feature(value) {
		if (value instanceof Feature) {
			this.signal(Update_Feature, value);
		} else {
			console.warn('value is no Feature', value);
		}
	}
}
