/**
 * @module modules/toolbox/components/measureToolContent/MeasureToolContent
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import { finish, remove, reset, setDisplayRuler } from '../../../../store/measurement/measurement.action';

import css from './measureToolContent.css';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

const Update = 'update';
const Update_StoredContent = 'update_storedContent';

const Default_Statistic = { length: null, area: null };
/**
 * @class
 * @author thiloSchlemmer
 * @author costa_gi
 */
export class MeasureToolContent extends AbstractToolContent {
	constructor() {
		super({
			statistic: Default_Statistic,
			mode: null,
			displayRuler: null,
			storedContent: null
		});

		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			UnitsService: unitsService,
			ShareService: shareService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'UnitsService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._unitsService = unitsService;
		this._shareService = shareService;
	}

	onInitialize() {
		this.observe(
			(state) => state.measurement,
			(data) => this.signal(Update, data)
		);
		this.observe(
			(state) => state.fileStorage.data,
			(data) => this.signal(Update_StoredContent, data)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					statistic: { ...Default_Statistic, ...data.statistic },
					displayRuler: data.displayRuler,
					mode: data.mode
				};
			case Update_StoredContent:
				return { ...model, storedContent: data };
		}
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { statistic, displayRuler, storedContent } = model;
		const areaClasses = { 'is-area': statistic.area != null };

		const buttons = this._getButtons(model);
		const subText = this._getSubText(model);

		const formattedDistance = this._unitsService.formatDistance(statistic.length, 2);
		const formattedArea = this._unitsService.formatArea(statistic.area, 2);

		const onCopyDistanceToClipboard = async () => this._copyValueToClipboard(formattedDistance.value, 'distance');
		const onCopyAreaToClipboard = async () => this._copyValueToClipboard(formattedArea.value, 'area');
		const onToggleDisplayRuler = () => setDisplayRuler(!displayRuler);

		return html`
        <style>${css}</style>
            <div class="ba-tool-container" >
               	<div class="ba-tool-container__title">  	    
					${translate('toolbox_measureTool_header')}                   
               	</div>  
				<div class="ba-tool-container__content">	
					<div class='tool-container__text-item'>
						<span class='prime-text-label'>
						${translate('toolbox_measureTool_stats_length')} (${formattedDistance.unit}):						
						</span>						
						<span id='span-distance-value' data-test-id class='prime-text-value selectable'>${formattedDistance.localizedValue}</span>													
						<span class='copy'>
							<ba-icon class='close' .icon='${clipboardIcon}' .title=${translate('toolbox_copy_icon')} .size=${1.5} @click=${onCopyDistanceToClipboard}>
							</ba-icon>
						</span>											
					</div>														
					<div class='tool-container__text-item area ${classMap(areaClasses)}'>
						<span class='prime-text-label'>
							${translate('toolbox_measureTool_stats_area')} (${unsafeHTML(formattedArea.unit)}):		
						</span>						
						<span id='span-area-value' data-test-id class='prime-text-value selectable'>${formattedArea.localizedValue}</span>
						<span class='copy'>
							<ba-icon class='close' .icon='${clipboardIcon}' .title=${translate('toolbox_copy_icon')} .size=${1.5} @click=${onCopyAreaToClipboard}>
							</ba-icon>
						</ba-icon>
						</span>			
					</div>
					<div class='display-ruler-toggle'>
						<ba-switch .title=${translate('toolbox_measureTool_display_ruler')} .checked=${displayRuler} @toggle=${onToggleDisplayRuler}><span slot="before">${translate('toolbox_measureTool_display_ruler')}</slot></ba-switch>
					</div>
					<div class='sub-text'>${subText}</div>	
				</div>	
				<div class='chips__container'> 
					<ba-profile-chip></ba-profile-chip>
					<ba-share-data-chip></ba-share-data-chip>
					<ba-export-vector-data-chip .exportData=${storedContent}></ba-export-vector-data-chip>
				</div>				
				<div class="ba-tool-container__actions">                         						 
					${buttons}					
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
			return html`<ba-button
				id=${id}
				data-test-id
				class="tool-container__button"
				.label=${label}
				.title=${title ?? ''}
				@click=${onClick}
			></ba-button>`;
		};

		const getStartNew = () => {
			return startNewCompliantModes.includes(mode) && finishAllowed
				? nothing
				: getButton('startnew', translate('toolbox_measureTool_start_new'), translate('toolbox_measureTool_start_new_title'), () => reset());
		};

		const getFinish = () => {
			return startNewCompliantModes.includes(mode) && finishAllowed
				? getButton('finish', translate('toolbox_measureTool_finish'), translate('toolbox_measureTool_finish_title'), () => finish())
				: nothing;
		};

		const getRemovePoint = () => {
			return mode === 'draw' && removeAllowed ? getButton('remove', translate('toolbox_measureTool_delete_point'), '', () => remove()) : nothing;
		};

		const getRemoveMeasure = () => {
			return mode !== 'draw' && removeAllowed ? getButton('remove', translate('toolbox_measureTool_delete_measure'), '', () => remove()) : nothing;
		};

		return html`${getStartNew()}${getFinish()}${getRemovePoint()}${getRemoveMeasure()}`;
	}

	_getSubText(state) {
		const { mode } = state;
		const translate = (key) => this._translationService.translate(key);
		const getTranslatedSpan = (key) => html`<span>${unsafeHTML(translate(key))}</span>`;
		const getMeasurementModeMessage = (mode) => getTranslatedSpan('toolbox_measureTool_measure_' + mode);
		return this._environmentService.isTouch() && mode ? getMeasurementModeMessage(mode) : nothing;
	}

	async _copyValueToClipboard(value, measure) {
		try {
			await this._shareService.copyToClipboard(value);
			switch (measure) {
				case 'distance': {
					emitNotification(
						`${this._translationService.translate(
							'toolbox_measureTool_clipboard_measure_distance_notification_text'
						)} ${this._translationService.translate('toolbox_clipboard_success')}`,
						LevelTypes.INFO
					);
					break;
				}
				case 'area': {
					emitNotification(
						`${this._translationService.translate(
							'toolbox_measureTool_clipboard_measure_area_notification_text'
						)} ${this._translationService.translate('toolbox_clipboard_success')}`,
						LevelTypes.INFO
					);
					break;
				}
			}
		} catch (error) {
			const message = this._translationService.translate('toolbox_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	static get tag() {
		return 'ba-tool-measure-content';
	}
}
