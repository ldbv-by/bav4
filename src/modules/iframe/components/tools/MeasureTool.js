/**
 * @module modules/iframe/components/tools/MeasureTool
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../injection';
import { activate, deactivate, finish, remove, reset } from '../../../../store/measurement/measurement.action';
import { MvuElement } from '../../../MvuElement';
import css from './measureTool.css';
import measure from './assets/measure.svg';
import cancelSvg from './assets/close-lg.svg';

const Update = 'update';
const Default_Statistic = { length: null, area: null };
/**
 *  Embed-mode-only component to measure simple geometries (Line, Polygon)
 * @class
 */
export class MeasureTool extends MvuElement {
	#renderingSkipped = true;
	constructor() {
		super({
			active: false,
			mode: null,
			validGeometry: null,
			statistic: Default_Statistic
		});
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			UnitsService: unitsService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'UnitsService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._unitsService = unitsService;
	}

	onInitialize() {
		//TODO
		this.#renderingSkipped = false;
		this.observe(
			(state) => state.measurement,
			(data) => this.signal(Update, data)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					statistic: { ...Default_Statistic, ...data.statistic },
					active: data.active,
					validGeometry: data.validGeometry ? data.validGeometry : null,
					mode: data.mode
				};
		}
	}

	isRenderingSkipped() {
		return this.#renderingSkipped;
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);

		const { active, statistic } = model;
		const areaClasses = { 'is-area': statistic.area != null };

		const buttons = this._getButtons(model);
		const subText = this._getSubText(model);

		const formattedDistance = this._unitsService.formatDistance(statistic.length, 2);
		const formattedArea = this._unitsService.formatArea(statistic.area, 2);

		const getActiveClass = () => {
			return active ? 'measure-tool__enable' : 'measure-tool__disable';
		};

		return html`
        <style>${css}</style>
		<div class="measure-tool">
			<div class="measure-tool__content ${getActiveClass()}">
				<div class="measure-tool__toggle">
					<ba-button
					class="measure-tool__enable-button"
						.label=${translate('iframe_measureTool_enable')}
						.title=${translate('iframe_measureTool_enable_title')}
						.type=${'primary'}
						.icon=${measure}
						@click=${() => activate()}
					></ba-button>
					<ba-icon id="close-icon" class='tool-container__close-button measure-tool__disable-button' 
						.title=${translate('iframe_measureTool_disable')} 
						.icon='${cancelSvg}' 
						.size=${1.6} .color=${'var(--text2)'} 
						.color_hover=${'var(--text2)'} 
						@click=${() => deactivate()}>						
				</div>
				<div class="measure-tool-container">
					<div class="ba-tool-container__title">
						${translate('iframe_measureTool_label')}
					</div> 
				<div class="ba-tool-container__content">	
					<div class='tool-container__text-item'>
						<span class='prime-text-label'>
						${translate('iframe_measureTool_stats_length')} (${formattedDistance.unit}):						
						</span>						
						<span id='span-distance-value' data-test-id class='prime-text-value selectable'>${formattedDistance.localizedValue}</span>																							
					</div>														
					<div class='tool-container__text-item area ${classMap(areaClasses)}'>
						<span class='prime-text-label'>
							${translate('iframe_measureTool_stats_area')} (${unsafeHTML(formattedArea.unit)}):		
						</span>						
						<span id='span-area-value' data-test-id class='prime-text-value selectable'>${formattedArea.localizedValue}</span>
						</span>			
					</div>
					<div class='sub-text'>${subText}</div>	
				</div>				
				<div class="ba-tool-container__actions">                         						 
					${buttons}					
				</div>	  
			</div>	  
        </div>							
        `;
	}

	_getButtons(model) {
		const translate = (key) => this._translationService.translate(key);
		const { statistic, mode } = model;

		const startNewCompliantModes = ['draw', 'modify', 'select'];
		const finishAllowed = (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0) && mode === 'draw';
		const removeAllowed = mode === 'draw' ? (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0) : statistic.length > 0;

		const getButton = (id, label, title, onClick) => {
			return html`<ba-button id=${id} data-test-id class="tool-container__button" .label=${label} .title=${title} @click=${onClick}></ba-button>`;
		};

		const getStartNew = () => {
			return startNewCompliantModes.includes(mode) && finishAllowed
				? nothing
				: getButton('startnew', translate('iframe_measureTool_start_new'), translate('iframe_measureTool_start_new_title'), () => reset());
		};

		const getFinish = () => {
			return startNewCompliantModes.includes(mode) && finishAllowed
				? getButton('finish', translate('iframe_measureTool_finish'), translate('iframe_measureTool_finish_title'), () => finish())
				: nothing;
		};

		const getRemovePoint = () => {
			return mode === 'draw' && removeAllowed ? getButton('remove', translate('iframe_measureTool_delete_point'), '', () => remove()) : nothing;
		};

		const getRemoveMeasure = () => {
			return mode !== 'draw' && removeAllowed ? getButton('remove', translate('iframe_measureTool_delete_measure'), '', () => remove()) : nothing;
		};

		return html`${getStartNew()}${getFinish()}${getRemovePoint()}${getRemoveMeasure()}`;
	}

	_getSubText(state) {
		const { mode } = state;
		const translate = (key) => this._translationService.translate(key);
		const getTranslatedSpan = (key) => html`<span>${unsafeHTML(translate(key))}</span>`;
		const getMeasurementModeMessage = (mode) => getTranslatedSpan('iframe_measureTool_measure_' + mode);
		return this._environmentService.isTouch() && mode ? getMeasurementModeMessage(mode) : nothing;
	}

	static get tag() {
		return 'ba-measure-tool';
	}
}
