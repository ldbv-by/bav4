import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import { GeoResourceInfoResult } from '../services/GeoResourceInfoService';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import css from './geoResourceInfoPanel.css';

const Update_IsPortrait = 'update_isPortrait_hasMinWidth';
const UPDATE_GEORESOURCEINFO = 'UPDATE_GEORESOURCEINFO';

/**
 * Component for managing georesourceinfo.
 * @class
 * @author costa_gi
 * @author alsturm
 */
export class GeoResourceInfoPanel extends MvuElement {

	constructor() {
		super({ geoResourceInfo: null });
		const { TranslationService: translationService, GeoResourceInfoService: geoResourceInfoService }
		= $injector.inject('TranslationService', 'GeoResourceInfoService');
		this._translationService = translationService;
		this._geoResourceInfoService = geoResourceInfoService;
		this.observe(state => state.media, media => this.signal(Update_IsPortrait, media.portrait));
	}

	update(type, data, model) {
		switch (type) {
			case UPDATE_GEORESOURCEINFO:
				return { ...model, geoResourceInfo: data };
			case Update_IsPortrait:
				return { ...model, isPortrait: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { geoResourceInfo, isPortrait } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		if (geoResourceInfo) {
			return html`
			<style>${css}</style>
			<div>${geoResourceInfo.title}</div>
			<div class='${getOrientationClass()}'>${unsafeHTML(`${geoResourceInfo.content}`)}</div>
			`;
		}
		return html`<ba-spinner></ba-spinner>`;
	}

	static get tag() {
		return 'ba-georesourceinfo-panel';
	}

	/**
	 * @property {string} geoResourceId - the Id for the georesourceinfo
	 */
	set geoResourceId(value) {
		this._getGeoResourceInfo(value);
	}

	/**
	 * @private
	 */
	async _getGeoResourceInfo(geoResourceId) {

		try {
			let result = await this._geoResourceInfoService.byId(geoResourceId);
			if (result === null) {
				const translate = (key) => this._translationService.translate(key);
				const infoText = translate('geoResourceInfo_empty_geoResourceInfo');
				result = new GeoResourceInfoResult(infoText);
			}
			this.signal(UPDATE_GEORESOURCEINFO, result);
		}
		catch (e) {
			const message = this._translationService.translate('geoResourceInfo_geoResourceInfo_response_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn(e);
			this.signal(UPDATE_GEORESOURCEINFO, null);
		}
	}
}
