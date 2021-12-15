import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import { finish, remove, reset } from '../../../../store/measurement/measurement.action';

import css from './measureToolContent.css';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

const Update = 'update';
const Update_FileSaveResult = 'update_fileSaveResult';

/**
 * @class
 * @author thiloSchlemmer
 * @author costa_gi
 */
export class MeasureToolContent extends AbstractToolContent {

	constructor() {
		super({
			statistic: { length: 0, area: 0 },
			fileSaveResult: null,
			mode: null
		});

		const { TranslationService: translationService, EnvironmentService: environmentService, UnitsService: unitsService, UrlService: urlService, ShareService: shareService } = $injector.inject('TranslationService', 'EnvironmentService', 'UnitsService', 'UrlService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._unitsService = unitsService;
		this._shareService = shareService;
		this._urlService = urlService;
	}

	onInitialize() {
		this.observe(state => state.measurement, data => this.signal(Update, data));
		this.observe(state => state.shared, data => this.signal(Update_FileSaveResult, data));
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					statistic: data.statistic,
					mode: data.mode
				};
			case Update_FileSaveResult:
				return { ...model, fileSaveResult: data.fileSaveResult };
		}
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { statistic } = model;

		const areaClasses = { 'is-area': statistic.area > 0 };

		const buttons = this._getButtons(model);
		const subText = this._getSubText(model);
		const buildPackage = (measurement) => {
			const splitted = measurement.split(' ');
			if (splitted.length === 2) {
				return { value: splitted[0], unit: splitted[1] };
			}
			return { value: splitted[0], unit: '?' };
		};
		const formattedDistance = this._unitsService.formatDistance(statistic.length, 2);
		const formattedArea = this._unitsService.formatArea(statistic.area, 2);
		const formattedDistancePackage = buildPackage(formattedDistance);
		const formattedAreaPackage = buildPackage(formattedArea);
		const onCopyDistanceToClipboard = async () => this._copyValueToClipboard(formattedDistance, 'distance');
		const onCopyAreaToClipboard = async () => this._copyValueToClipboard(formattedArea, 'area');

		return html`
        <style>${css}</style>
            	<div class="ba-tool-container">
                	<div class="ba-tool-container__title">  	    
						${translate('toolbox_measureTool_header')}                   
                	</div>  
				<div class="ba-tool-container__content">	
					<div class='tool-container__text-item'>
						<span>
						${translate('toolbox_measureTool_stats_length')}:						
						</span>						
						<span class='prime-text-value'>${formattedDistancePackage.value}</span>		
						<span class='prime-text-unit'>${formattedDistancePackage.unit}</span>									
						<span class='copy'>
							<ba-icon class='close' .icon='${clipboardIcon}' .title=${translate('toolbox_copy_icon')} .size=${1.5} @click=${onCopyDistanceToClipboard}>
							</ba-icon>
						</span>											
					</div>														
					<div class='tool-container__text-item area ${classMap(areaClasses)}'>
						<span>
							${translate('toolbox_measureTool_stats_area')}:		
						</span>						
						<span class='prime-text-value'>${formattedAreaPackage.value}</span>
						<span class='prime-text-unit'>${unsafeHTML(formattedAreaPackage.unit)}</span>
						<span class='copy'>
							<ba-icon class='close' .icon='${clipboardIcon}' .title=${translate('toolbox_copy_icon')} .size=${1.5} @click=${onCopyAreaToClipboard}>
							</ba-icon>
						</ba-icon>
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
		const buttons = [];
		const translate = (key) => this._translationService.translate(key);
		const { statistic, mode } = model;

		const getButton = (id, title, onClick) => {
			return html`<ba-button id=${id} 
								class="tool-container__button" 
								.label=${title}
								@click=${onClick}></ba-button>`;
		};
		// Start-New-Button
		const startNewCompliantModes = ['draw', 'modify', 'select'];
		const finishAllowed = (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0) && mode === 'draw';
		if (startNewCompliantModes.includes(mode)) {
			let id = 'startnew';
			let title = translate('toolbox_measureTool_start_new');
			let onClick = () => reset();
			// alternate Finish-Button
			if (finishAllowed) {
				id = 'finish';
				title = translate('toolbox_drawTool_finish');
				onClick = () => finish();
			}

			buttons.push(getButton(id, title, onClick));
		}

		// Remove-Button
		const removeAllowed = mode === 'draw' ? (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0) : statistic.length > 0;
		if (removeAllowed) {
			const id = 'remove';
			const title = mode === 'draw' ? translate('toolbox_measureTool_delete_point') : translate('toolbox_measureTool_delete_measure');
			const onClick = () => remove();
			buttons.push(getButton(id, title, onClick));
		}

		const getShareButton = () => html`<ba-share-button .share=${model.fileSaveResult}></ba-share-button>`;
		buttons.push(getShareButton(model));

		return buttons;
	}

	_getSubText(state) {
		const { mode } = state;
		const translate = (key) => this._translationService.translate(key);
		const getTranslatedSpan = (key) => html`<span>${unsafeHTML(translate(key))}</span>`;
		const getMeasurementModeMessage = (mode) => getTranslatedSpan('toolbox_measureTool_measure_' + mode);
		return this._environmentService.isTouch() ? getMeasurementModeMessage(mode) : nothing;
	}

	async _copyValueToClipboard(value, measure) {
		try {
			await this._shareService.copyToClipboard(value);
			switch (measure) {
				case 'distance': {
					emitNotification(`${this._translationService.translate('toolbox_measureTool_clipboard_measure_distance_notification_text')} ${this._translationService.translate('toolbox_clipboard_success')}`, LevelTypes.INFO);
					break;
				}
				case 'area': {
					emitNotification(`${this._translationService.translate('toolbox_measureTool_clipboard_measure_area_notification_text')} ${this._translationService.translate('toolbox_clipboard_success')}`, LevelTypes.INFO);
					break;
				}
			}
		}
		catch (error) {
			const message = this._translationService.translate('toolbox_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	static get tag() {
		return 'ba-tool-measure-content';
	}
}
