import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { setId, setScale } from '../../../../store/mfp/mfp.action';

const Update = 'update';
const Update_Scale = 'update_scale';
const Update_Id = 'update_id';
const Update_Capabilities = 'update_capabilities';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ExportMfpToolContent extends AbstractToolContent {
	constructor() {
		super({
			id: null,
			scale: null,
			capabilities: []
		});

		const { TranslationService: translationService, MfpService: mfpService } = $injector.inject('TranslationService', 'MfpService');
		this._translationService = translationService;
		this._mfpService = mfpService;
	}

	onInitialize() {
		this.observe(state => state.mfp.current, data => this.signal(Update, data));
		this._loadCapabilities();
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, id: data?.id, scale: data?.scale };
			case Update_Scale:
				return { ...model, scale: data };
			case Update_Id:
				return { ...model, id: data };
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
		const { id, scale, capabilities } = model;
		const translate = (key) => this._translationService.translate(key);
		const capabilitiesAvailable = capabilities.length > 0;

		const onClick = () => emitNotification(`Export to MapFishPrint with '${id}' and scale 1:${scale}`, LevelTypes.INFO);

		const areSettingsComplete = (capabilitiesAvailable && scale && id);
		return html`
        <div class="ba-tool-container">
			<div class="ba-tool-container__title">
				${translate('toolbox_exportMfp_header')}
			</div>
			<div class='ba-tool-container__content'>
				${areSettingsComplete ? this._getContent(id, scale, capabilities) : this._getSpinner()}				
			</div>
			<div class="ba-tool-container__actions"> 
				<ba-button id='btn_submit' class="tool-container__button" .label=${translate('toolbox_exportMfp_submit')} @click=${onClick} .disabled=${!areSettingsComplete}></ba-button>
			</div>			
		</div>`;
	}

	_getSpinner() {
		return html`<ba-spinner></ba-spinner>`;
	}

	_getContent(id, scale, capabilities) {
		const translate = (key) => this._translationService.translate(key);

		const layoutItems = capabilities.map(capability => {
			return { name: translate(`toolbox_exportMfp_id_${capability.id}`), id: capability.id };
		});

		const scales = this._mfpService.byId(id)?.scales;

		const onChangeId = (e) => {
			const id = e.target.value;

			setId(id);
			this.signal(Update_Id, id);
		};

		const onChangeScale = (e) => {
			const parsedScale = parseInt(e.target.value);

			setScale(parsedScale);
			this.signal(Update_Scale, parsedScale);
		};

		const getScaleOptions = (scales, selectedScale) => {
			return scales.map((scale) => html`<option value=${scale} ?selected=${scale === selectedScale}>1:${scale}</option>)}`);
		};

		const getLayoutOptions = (layoutItems, selectedId) => {
			return layoutItems.map((item) => html`<option value=${item.id} ?selected=${item.id === selectedId}>${item.name}</option>)}`);
		};
		return html`<div class="fieldset">
						<select id='select_layout' @change=${onChangeId}>							
							${getLayoutOptions(layoutItems, id)}
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

	static get tag() {
		return 'ba-tool-export-mfp-content';
	}

}
