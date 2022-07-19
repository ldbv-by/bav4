import { html } from 'lit-html';
import css from './exportMfpToolContent.css';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { setMapSize, setScale } from '../../../../store/mfp/mfp.action';

const Update = 'update';
const Update_Scale = 'update_scale';
const Update_Map_Size = 'update_map_size';
const Update_Capabilities = 'update_capabilities';

export class ExportMfpToolContent extends AbstractToolContent {
	constructor() {
		super({
			mapSize: null,
			scale: null,
			capabilities: []
		});

		const { TranslationService: translationService, MfpService: mfpService } = $injector.inject('TranslationService', 'MfpService');
		this._translationService = translationService;
		this._mfpService = mfpService;
	}

	onInitialize() {
		this.observe(state => state.mfp.scale, data => this.signal(Update_Scale, data), false);
		this.observe(state => state.mfp.mapSize, data => this.signal(Update_Map_Size, data), false);
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, mapSize: data.mapSize, scale: data.scale };
			case Update_Scale:
				return { ...model, scale: data };
			case Update_Map_Size:
				return { ...model, mapSize: data };
			case Update_Capabilities:
				return { ...model, capabilities: [...data] };
		}
	}

	async _loadCapabilities() {
		const capabilities = await this._mfpService.getCapabilities();
		if (capabilities.length) {
			this.signal(Update_Capabilities, capabilities);
		}
	}

	_isMapSizeEqual(a, b) {
		if (!a || !b) {
			return false;
		}
		return a.width === b.width && a.height === b.height;
	}

	_getLayout(mapSize) {
		const { capabilities } = this.getModel();
		const layout = capabilities.find(capability => this._isMapSizeEqual(capability.mapSize, mapSize));
		return layout ? layout : null;
	}

	createView(model) {
		const { mapSize, scale, capabilities } = model;
		const translate = (key) => this._translationService.translate(key);
		const capabilitiesAvailable = capabilities.length > 0;

		if (!capabilitiesAvailable) {
			this._loadCapabilities();
		}

		const mapSizes = capabilitiesAvailable ? capabilities.map(capability => {
			return { name: capability.name, mapSize: capability.mapSize };
		}) : [{ mapSize: null }];

		const currentMapSize = mapSize ? mapSize : mapSizes[0].mapSize;

		const scales = capabilities.find(c => this._isMapSizeEqual(c.mapSize, currentMapSize))?.scales ;
		const currentLayout = this._getLayout(currentMapSize);

		const onClick = () => emitNotification(`Export to MapFishPrint with ${currentLayout} and ${scale}`, LevelTypes.INFO);

		const onChangeMapSize = (e) => {
			const layout = e.target.value;
			const mapSize = capabilities.find(c => c.name === layout)?.mapSize;
			setMapSize(mapSize);
		};

		const onChangeScale = (e) => {
			const scale = e.target.value;
			setScale(scale);
		};

		const getScaleOptions = (scales, selectedScale) => {
			if (scales && scales.length > 0) {
				return scales.map((scale) => html`<option value=${scale} ?selected=${scale === selectedScale}>1:${scale} </option>)}`);
			}
			return html.nothing;
		};

		const getMapSizeOptions = (mapSizes, selectedMapSize) => {
			if (mapSizes && mapSizes.length > 0) {
				return mapSizes.map((m) => html`<option value=${m.mapSize} ?selected=${m.mapSize === selectedMapSize}>${m.name} </option>)}`);
			}
			return html.nothing;
		};

		return html`<style>${css}</style>
        <div class="ba-tool-container">
        <div class="ba-tool-container__title">
					${translate('toolbox_exportMfp_header')}
            <div class='ba-tool-container__content'>
            <div class="fieldset">
					<select id='select_layout' @change=${onChangeMapSize}>
						${getMapSizeOptions(mapSizes, mapSize)}
					</select>
					<label for="select_layout" class="control-label">${translate('toolbox_exportMfp_layout')}</label><i class="bar"></i>
			</div>
            <div class="fieldset">
					<select id='select_scale'  @change=${onChangeScale}>
                    ${getScaleOptions(scales, scale)}
					</select>
					<label for="select_scale" class="control-label">${translate('toolbox_exportMfp_scale')}</label><i class="bar"></i>
			</div>
            <div class="ba-tool-container__actions footer"> 
                <ba-button id='btn_submit' .label=${translate('toolbox_exportMfp_submit')} .type=${'primary'} @click=${onClick}></ba-button>
            </div>
        </div>`;
	}

	static get tag() {
		return 'ba-tool-export-mfp-content';
	}

}
