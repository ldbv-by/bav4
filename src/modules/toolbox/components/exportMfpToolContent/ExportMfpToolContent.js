import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { setMapSize, setScale } from '../../../../store/mfp/mfp.action';

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
		this._loadCapabilities();
	}

	update(type, data, model) {
		switch (type) {
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
		if (capabilities.length > 0) {
			this.signal(Update_Capabilities, capabilities);
		}
	}

	createView(model) {
		const { mapSize, scale, capabilities } = model;
		const translate = (key) => this._translationService.translate(key);
		const capabilitiesAvailable = capabilities.length > 0;

		const onClick = () => emitNotification(`Export to MapFishPrint with ${mapSize.width}*${mapSize.height} and ${scale}`, LevelTypes.INFO);
		return html`
        <div class="ba-tool-container">
			<div class="ba-tool-container__title">
						${translate('toolbox_exportMfp_header')}
			</div>
			<div class='ba-tool-container__content'>
				${capabilitiesAvailable ? this._getContent(mapSize, scale, capabilities) : this._getSpinner()}				
			</div>
			<div class="ba-tool-container__actions"> 
				<ba-button id='btn_submit' class="tool-container__button" .label=${translate('toolbox_exportMfp_submit')} @click=${onClick} .disabled=${!capabilitiesAvailable}></ba-button>
			</div>			
		</div>`;
	}

	_getSpinner() {
		return html`<ba-spinner></ba-spinner>`;
	}

	_getContent(mapSize, scale, capabilities) {
		const translate = (key) => this._translationService.translate(key);
		const mapSizes = capabilities.map(capability => {
			return { name: capability.name, mapSize: capability.mapSize };
		});

		const currentOrDefaultMapSize = (mapSize ? mapSize : mapSizes[0].mapSize);

		const scales = capabilities.find(c => this._isMapSizeEqual(c.mapSize, currentOrDefaultMapSize))?.scales ;

		const onChangeMapSize = (e) => {
			const layout = e.target.value;
			const mapSize = capabilities.find(c => c.name === layout)?.mapSize;
			setMapSize(mapSize);
			this.signal(Update_Map_Size, mapSize);
		};

		const onChangeScale = (e) => {
			const parsedScale = parseInt(e.target.value);
			setScale(parsedScale);
			this.signal(Update_Scale, parsedScale);
		};

		const getScaleOptions = (scales, selectedScale) => {
			return scales.map((scale) => html`<option value=${scale} ?selected=${scale === selectedScale}>1:${scale}</option>)}`);
		};

		const getMapSizeOptions = (mapSizes, selectedMapSize) => {
			return mapSizes.map((m) => html`<option value=${m.name} ?selected=${m.mapSize === selectedMapSize}>${m.name}</option>)}`);
		};
		return html`<div class="fieldset">
						<select id='select_layout' @change=${onChangeMapSize}>
							${getMapSizeOptions(mapSizes, mapSize)}
						</select>
						<label for="select_layout" class="control-label">${translate('toolbox_exportMfp_layout')}</label><i class="bar"></i>
					</div>
					<div class="fieldset">
						<select id='select_scale' @change=${onChangeScale}>
						${getScaleOptions(scales, scale)}
						</select>
						<label for="select_scale" class="control-label">${translate('toolbox_exportMfp_scale')}</label><i class="bar"></i>
					</div>`;
	}

	_isMapSizeEqual(a, b) {
		if (!a || !b) {
			return false;
		}
		return a.width === b.width && a.height === b.height;
	}

	static get tag() {
		return 'ba-tool-export-mfp-content';
	}

}
