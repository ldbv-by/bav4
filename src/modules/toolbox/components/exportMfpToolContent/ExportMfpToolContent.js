/**
 * @module modules/toolbox/components/exportMfpToolContent/ExportMfpToolContent
 */
import { html } from 'lit-html';
import { $injector } from '@src/injection';
import { AbstractToolContent } from '@src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { cancelJob, requestJob, setId, setScale, setShowGrid, setShowLegend } from '@src/store/mfp/mfp.action';
import css from './exportMfpToolContent.css?inline';
import plus from './assets/plus.svg';
import minus from './assets/minus.svg';

const Update = 'update';
const Update_Scale = 'update_scale';
const Update_Id = 'update_id';
const Update_Show_Grid = 'update_show_grid';
const Update_Show_Legend = 'update_show_legend';

const Update_Job_Started = 'update_job_started';
const Update_IsPortrait = 'update_isPortrait';
const Update_Grid_Supported = 'update_grid_supported';
const Update_Export_Supported = 'update_export_supported';
const Update_Legend_Supported = 'update_legend_supported';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ExportMfpToolContent extends AbstractToolContent {
	constructor() {
		super({
			id: null,
			scale: null,
			showGrid: false,
			showLegend: false,
			isJobStarted: false,
			isPortrait: false,
			gridSupported: false,
			legendSupported: false,
			exportSupported: true
		});

		const { TranslationService: translationService, MfpService: mfpService } = $injector.inject('TranslationService', 'MfpService');
		this._translationService = translationService;
		this._mfpService = mfpService;
	}

	onInitialize() {
		this.observe(
			(state) => state.mfp.current,
			(data) => this.signal(Update, data)
		);
		this.observe(
			(state) => state.mfp.showGrid,
			(data) => this.signal(Update_Show_Grid, data)
		);
		this.observe(
			(state) => state.mfp.gridSupported,
			(data) => this.signal(Update_Grid_Supported, data)
		);
		this.observe(
			(state) => state.legends.active,
			(data) => this.signal(Update_Legend_Supported, data?.length > 0)
		);
		this.observe(
			(state) => state.mfp.exportSupported,
			(data) => this.signal(Update_Export_Supported, data)
		);
		this.observe(
			(state) => state.mfp.jobSpec,
			(data) => this.signal(Update_Job_Started, data)
		);
		this.observe(
			(state) => state.mfp.showLegend,
			(data) => this.signal(Update_Show_Legend, data)
		);
		this.observe(
			(state) => state.media,
			(data) => this.signal(Update_IsPortrait, data.portrait)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return { ...model, id: data?.id, scale: data?.scale };
			case Update_Scale:
				return { ...model, scale: data };
			case Update_Id:
				return { ...model, id: data };
			case Update_Show_Grid:
				return { ...model, showGrid: data };
			case Update_Show_Legend:
				return { ...model, showLegend: data };
			case Update_IsPortrait:
				return { ...model, isPortrait: data };
			case Update_Job_Started:
				return { ...model, isJobStarted: !!data?.payload };
			case Update_Grid_Supported:
				return { ...model, gridSupported: data };
			case Update_Legend_Supported:
				return { ...model, legendSupported: data };
			case Update_Export_Supported:
				return { ...model, exportSupported: data };
		}
	}

	createView(model) {
		const { id, scale, isJobStarted, showGrid, showLegend, isPortrait, gridSupported, exportSupported, legendSupported } = model;
		const translate = (key) => this._translationService.translate(key);
		const capabilities = this._mfpService.getCapabilities();

		const onClickAction = isJobStarted ? () => cancelJob() : () => requestJob();
		const btnLabel = isJobStarted ? translate('toolbox_exportMfp_cancel') : translate('toolbox_exportMfp_submit');
		const btnTitle = isJobStarted ? translate('toolbox_exportMfp_cancel_title') : translate('toolbox_exportMfp_submit_title');
		const btnType = isJobStarted ? 'loading' : 'primary';
		const btnId = isJobStarted ? 'btn_cancel' : 'btn_submit';
		const areSettingsComplete = capabilities && scale && id;

		const getButton = () =>
			html`<ba-button
				id=${btnId}
				class="tool-container__button preview_button"
				.label=${btnLabel}
				.title=${btnTitle}
				@click=${onClickAction}
				.type=${btnType}
				.disabled=${!areSettingsComplete}
			></ba-button>`;

		const getNotSupportedHint = () =>
			html`<div class="tool-container__button not-supported-hint">${translate('toolbox_exportMfp_export_not_supported')}</div>`;

		return html` <style>
				${css}
			</style>
			<div class="ba-tool-container" ?data-register-for-viewport-calc=${isPortrait}>
				<div class="ba-tool-container__title">${translate('toolbox_exportMfp_header')}</div>
				<div class="ba-tool-container__content">
					${areSettingsComplete ? this._getContent(id, scale, capabilities.layouts, showGrid, gridSupported, showLegend, legendSupported) : this._getSpinner()}
				</div>
				<div class="ba-tool-container__actions">${exportSupported ? getButton() : getNotSupportedHint()}</div>
			</div>`;
	}

	_getSpinner() {
		return html`<ba-spinner></ba-spinner>`;
	}

	_getContent(id, scale, layouts, showGrid, gridSupported, showLegend, legendSupported) {
		const translate = (key) => this._translationService.translate(key);
		const layoutItems = layouts.map((capability) => {
			return { name: translate(`toolbox_exportMfp_id_${capability.id}`), id: capability.id };
		});

		const scales = this._mfpService.getLayoutById(id)?.scales;

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

		const increaseScale = () => {
			const selectScale = this.shadowRoot.getElementById('select_scale');
			if (selectScale.selectedIndex < selectScale.length - 1) {
				selectScale.selectedIndex = selectScale.selectedIndex + 1;
				const parsedScale = parseInt(selectScale.value);
				setScale(parsedScale);
				this.signal(Update_Scale, parsedScale);
			}
		};

		const decreaseScale = () => {
			const selectScale = this.shadowRoot.getElementById('select_scale');
			if (selectScale.selectedIndex > 0) {
				selectScale.selectedIndex = selectScale.selectedIndex - 1;
				const parsedScale = parseInt(selectScale.value);
				setScale(parsedScale);
				this.signal(Update_Scale, parsedScale);
			}
		};

		const getScaleOptions = (scales, selectedScale) => {
			return scales.map(
				(scale) =>
					html`<option value=${scale} ?selected=${scale === selectedScale}>1:${scale}</option>
						)}`
			);
		};

		const getLayoutOptions = (layoutItems, selectedId) => {
			return layoutItems.map(
				(item) => html`
					<button
						class="layout-button ${item.id} ${getActiveClass(item.id, selectedId)}"
						value=${item.id}
						title=${item.name}
						@click=${onChangeId}
					></button>
				`
			);
		};

		const getActiveClass = (value, selectedId) => (value === selectedId ? 'active' : '');

		const onChangeShowLegend = (event) => {
			setShowLegend(event.detail.checked);
		};

		const onChangeShowGrid = (event) => {
			setShowGrid(event.detail.checked);
		};

		return html` <div class="tool-section">
				<div class="tool-sub-header">${translate('toolbox_exportMfp_layout')}</div>
				<div class="button-container">${getLayoutOptions(layoutItems, id)}</div>
			</div>
			<div class="tool-section" style="margin-top:1em">
				<div class="tool-sub-header">${translate('toolbox_exportMfp_scale')}</div>
				<div style="display: flex; justify-content: center">
					<ba-icon
						id="decrease"
						.icon=${plus}
						.color=${'var(--primary-color)'}
						.size=${2.2}
						.title=${translate('toolbox_exportMfp_scale_decrease')}
						@click=${decreaseScale}
					></ba-icon>
					<select id="select_scale" @change=${onChangeScale}>
						${getScaleOptions(scales, scale)}
					</select>
					<ba-icon
						id="increase"
						.icon=${minus}
						.color=${'var(--primary-color)'}
						.size=${2.2}
						.title=${translate('toolbox_exportMfp_scale_increase')}
						@click=${increaseScale}
					></ba-icon>
					<div></div>
				</div>
				<div class="tool-section separator" style="margin-top:1em">
					<div id="checkbox-tool-container" class="tool-section" style="margin-top:1em">
						<ba-checkbox
							id="showgrid"
							.checked=${gridSupported ? showGrid : false}
							.title=${gridSupported ? translate('toolbox_exportMfp_show_grid_title') : translate('toolbox_exportMfp_grid_supported')}
							@toggle=${onChangeShowGrid}
							.disabled=${!gridSupported}
							><span>${translate('toolbox_exportMfp_show_grid')}</span>
						</ba-checkbox>
						<ba-checkbox
							id="show-legends"
							.checked=${legendSupported ? showLegend : false}
							.title=${legendSupported ? translate('toolbox_exportMfp_show_legend_title') : translate('toolbox_exportMfp_legend_supported')}
							@toggle=${onChangeShowLegend}
							.disabled=${!legendSupported}
							><span>${translate('toolbox_exportMfp_show_legend')}</span>
						</ba-checkbox>
					</div>
				</div>
			</div>`;
	}

	static get tag() {
		return 'ba-tool-export-mfp-content';
	}
}
