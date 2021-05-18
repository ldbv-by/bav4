import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import { finish, remove, reset } from '../../../map/store/measurement.action';

import css from './measureToolContent.css';
/**
 * @class
 * @author thiloSchlemmer
 */
export class MeasureToolContent extends BaElement {

	constructor() {
		super();

		const { TranslationService: translationService, EnvironmentService: environmentService, UnitsService: unitsService } = $injector.inject('TranslationService', 'EnvironmentService', 'UnitsService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._unitsService = unitsService;
		this._tool = {
			name: 'measure',
			active: false,
			title: 'toolbox_measureTool_measure',
			icon: 'measure'
		};
		this._isFirstMeasurement = true;
	}

	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { active, statistic, mode } = state;
		this._tool.active = active;
		const areaClasses = { 'is-area': statistic.area > 0 };
	
		const buttons = this._getButtons(state);
		const buildPackage = (measurement) => {
			const splitted = measurement.split(' ');
			if (splitted.length === 2) {
				return { value:splitted[0], unit:splitted[1] };
			}
			return { value:splitted[0], unit:'?' };
		}; 
		const formattedDistance = this._unitsService.formatDistance(statistic.length, 2);		
		const formattedArea = this._unitsService.formatArea(statistic.area, 2);
		const formattedDistancePackage = buildPackage(formattedDistance);
		const formattedAreaPackage = buildPackage(formattedArea);
		return html`
        <style>${css}</style>
            	<div class="ba-tool-container__item">
                	<div class="tool-container__header">  
						<span class='tool-container__header-text'>                
							${translate('toolbox_measureTool_header')}                   
						</span>   						             <span>(${mode})</span>
                	</div>      
					<div class="tool-container__text">				
					<div class='tool-container__text-item'>
						<span>
						${translate('toolbox_measureTool_stats_length')}:						
						</span>						
						<span class='prime-text-value'>${formattedDistancePackage.value}</span>		
						<span class='prime-text-unit'>${formattedDistancePackage.unit}</span>									
						<span class='copy'>
							<ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5} >
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
							<ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5} >
							</ba-icon>
						</ba-icon>
					</span>			
					</div>
					<div class='sub-text'>												
							<span>
								${translate('toolbox_drawTool_info')}
							</span>													
					</div>
				</div>				
				<div class="tool-container__buttons-secondary">                         						 
					${buttons}
					</div>                
            	</div>	  
            </div>	  
     
        `;

	}

	_getButtons(state) {
		const buttons = [];
		const translate = (key) => this._translationService.translate(key);
		const { active, statistic, mode } = state;
		this._isFirstMeasurement = this._isFirstMeasurement ? (statistic.length === 0 ? true : false) : false;
		this._tool.active = active;
	
		const getButton = (id, title, onClick) => {
			return html`<button id=${id} 
								class="tool-container__button" 
								title=${title}
								@click=${onClick}>${title}</button>`;
		};
		// Start-New-Button
		const startNewCompliantModes = ['draw', 'modify', 'select'];
		const finishAllowed = (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0) && mode === 'draw';
		if (startNewCompliantModes.includes(mode) ) {
			let id = 'startnew';
			let title = translate('toolbox_measureTool_start_new');
			let onClick =  () => reset();
			// alternate Finish-Button			
			if (finishAllowed) {
				id = 'finish';
				title = translate('toolbox_drawTool_finish');
				onClick =  () => finish();				
			}
			
			buttons.push(getButton(id, title, onClick));
		}

		// Remove-Button
		const removeAllowed = mode === 'draw' ? statistic.area > 0 : statistic.length > 0;
		if (removeAllowed) {
			const id = 'remove';
			const title = translate('toolbox_drawTool_delete');
			const onClick =  () => remove();
			buttons.push(getButton(id, title, onClick));
		}

		
		return buttons;
	}

	/**
	 * @override
	 * @param {Object} globalState 
	 */
	extractState(globalState) {
		const { measurement } = globalState;
		return measurement;
	}

	static get tag() {
		return 'ba-tool-measure-content';
	}
}