import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import { remove, reset } from '../../../map/store/measurement.action';

import css from './measureToolContent.css';
/**
 * @class
 * @author thiloSchlemmer
 */
export class MeasureToolContent extends BaElement {

	constructor() {
		super();

		const { TranslationService: translationService, UnitsService: unitsService } = $injector.inject('TranslationService', 'UnitsService');
		this._translationService = translationService;
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
		const { active, statistic } = state;
		this._isFirstMeasurement = this._isFirstMeasurement ? (statistic.length === 0 ? true : false) : false;
		this._tool.active = active;
		const areaClasses = { 'is-area': statistic.area > 0 };
		const measurementClasses = { 'is-first': this._isFirstMeasurement };
		const removeAllowed = statistic.length > 0;
		const removeClasses = {
			'is-remove': removeAllowed,
			'is-not-remove': !removeAllowed
		};

		const onClickReset = () => {
			reset();
		};

		const onClickRemove = () => {
			remove();
		};

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
						</span>   						             
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
					<button id=startnew class="tool-container__button ${classMap(measurementClasses)}" 
					title=${translate('toolbox_measureTool_start_new')}
						@click=${onClickReset}>								
							${translate('toolbox_measureTool_start_new')}
						</button>				
					<button id=remove class="tool-container__button ${classMap(removeClasses)}"
						title=${translate('toolbox_drawTool_delete')}
						@click=${onClickRemove}>
						${translate('toolbox_drawTool_delete')}
						</button>
					</div>                
            	</div>	  
            </div>	  
     
        `;

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