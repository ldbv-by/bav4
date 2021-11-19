import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import { LayerInfoResult } from '../services/LayerInfoService';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';

const UPDATE_LAYERINFO = 'UPDATE_LAYERINFO';

/**
 * Component for managing layerinfo.
 * @class
 * @author costa_gi
 */
export class LayerInfoPanel extends MvuElement {

	constructor() {
		super({ layerInfo: null });
		const { TranslationService: translationService, LayerInfoService: layerInfoService }
		= $injector.inject('TranslationService', 'LayerInfoService');
		this._translationService = translationService;
		this._layerInfoService = layerInfoService;
	}

	update(type, data, model) {
		switch (type) {
			case UPDATE_LAYERINFO:
				return { ...model, layerInfo: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { layerInfo } = model;

		if (layerInfo) {
			return html`
			<div>${layerInfo.title}</div>
			<div>${unsafeHTML(`${layerInfo.content}`)}</div>
			`;
		}
		return html`<ba-spinner></ba-spinner>`;
	}

	static get tag() {
		return 'ba-layerinfo-panel';
	}

	/**
	 * @property {string} geoResourceId - the Id for the layerinfo
	 */
	set geoResourceId(value) {
		this._getLayerInfo(value);
	}

	/**
	 * @private
	 */
	async _getLayerInfo(geoResourceId) {

		try {
			let result = await this._layerInfoService.byId(geoResourceId);
			if (result === null) {
				const translate = (key) => this._translationService.translate(key);
				const infoText = translate('layerinfo_empty_layerInfo');
				result = new LayerInfoResult(infoText);
			}
			this.signal(UPDATE_LAYERINFO, result);
		}
		catch (e) {
			const message = this._translationService.translate('layerinfo_layerInfo_response_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn(e);
			this.signal(UPDATE_LAYERINFO, null);
		}
	}
}
