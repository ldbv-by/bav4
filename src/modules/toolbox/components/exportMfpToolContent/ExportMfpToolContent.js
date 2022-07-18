import { html } from 'lit-html';
import css from './exportMfpToolContent.css';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

const Update = 'update';
const Update_Scale = 'update_scale';
const Update_Format = 'update_format';

export class ExportMfpToolContent extends AbstractToolContent {
	constructor() {
		super({
			format: 'A4 landscape',
			scale: 1000000
		});

		this._capabilities = [];
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	onInitialize() {
		// todo: replace with MfpService.getCapabilities()
		this._capabilities = [
			{ name: 'A4 landscape', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 785, height: 475 } },
			{ name: 'A4 portrait', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 539, height: 722 } },
			{ name: 'A3 portrait', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 786, height: 1041 } },
			{ name: 'A3 landscape', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 1132, height: 692 } }
		];
		this.signal(Update, { format: this._capabilities[0].name, scale: this._capabilities[0].scales[0] });
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, format: data.format, scale: data.scale };
			case Update_Scale:
				return { ...model, scale: data };
			case Update_Format:
				return { ...model, format: data };

		}
	}

	createView(model) {
		const { format, scale } = model;
		const translate = (key) => this._translationService.translate(key);

		const formats = this._capabilities.map(capability => capability.name);
		const scales = this._capabilities.find(c => c.name === format).scales;

		const onClick = () => emitNotification(`Export to MapFishPrint with ${format} and ${scale}`, LevelTypes.INFO);

		const onChangeFormat = (e) => {
			const format = e.target.value;
			this.signal(Update_Format, format);
		};

		const onChangeScale = (e) => {
			const scale = e.target.value;
			this.signal(Update_Scale, scale);
		};

		const selectTemplate = (values, selectedValue) => {
			return values.map((value) => html`<option value=${value} ?selected=${value === selectedValue}>${value} </option>)}`);
		};

		return html`<style>${css}</style>
        <div class="ba-tool-container">
        <div class="ba-tool-container__title">
					${translate('toolbox_exportMfp_header')}
            <div class='ba-tool-container__content'>
            <div class="fieldset">
					<select id='select_format' @change=${onChangeFormat}>
						${selectTemplate(formats, format)}
					</select>
					<label for="select_format" class="control-label">${translate('toolbox_exportMfp_format')}</label><i class="bar"></i>
			</div>
            <div class="fieldset">
					<select id='select_scale'  @change=${onChangeScale}>
                    ${selectTemplate(scales, scale)}
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
