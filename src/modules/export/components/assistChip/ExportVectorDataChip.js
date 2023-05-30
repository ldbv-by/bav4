/**
 * @module modules/export/components/assistChip/ExportVectorDataChip
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { openModal } from '../../../../store/modal/modal.action';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import exportSvg from './assets/download.svg';
import { KML } from 'ol/format';

const Update_GeoResource_ID = 'update_georesource_id';
const Update_Feature = 'update_feature';
/**
 *
 * @class
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
}
