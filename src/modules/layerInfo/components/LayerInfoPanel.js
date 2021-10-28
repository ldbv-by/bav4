import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';

const UPDATE_LAYERINFO = 'UPDATE_LAYERINFO';

/**
 * Component for managing layerinfo.
 * @class
 * @author costa_gi
 */
export class LayerInfoPanel extends MvuElement {

	constructor() {
		super({ layerInfo: null });
		const { LayerInfoService: layerInfoService } = $injector.inject('LayerInfoService');
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
			<div>${unsafeHTML(`${layerInfo.content}`)} ${layerInfo.title}</div>
			`;
		}
		return nothing;
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
			const result = await this._layerInfoService.byId(geoResourceId);
			this.signal(UPDATE_LAYERINFO, result);
		}
		catch (e) {
			console.warn(e.message);
			this.signal(UPDATE_LAYERINFO, null);
		}
	}
}
