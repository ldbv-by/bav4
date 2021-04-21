import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { activate as activateMeasurement, deactivate as deactivateMeasurement, reset } from '../../../map/store/measurement.action';

import css from './measureToolContent.css';
/**
 * @class
 * @author thiloSchlemmer
 */
export class MeasureToolContent extends BaElement {

	constructor() {
		super();

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		this._isToolActive = false;
		this._tool = { 
			name:'measure', 
			active:false, 
			title: 'toolbox_measureTool_measure',
			icon:'measure',
			activate:() => activateMeasurement(),
			deactivate:() => deactivateMeasurement() };
		this._isFirstMeasurement = true;
	}	

	createView() {
		const translate = (key) => this._translationService.translate(key);    
		const { active, statistic  } = this._state;		  		

		this._tool.active = active;
		const toolClasses = { 'is-active': this._tool.active };
		const measurementClasses = { 'is-first': this._isFirstMeasurement };
		
		const toggle = () => {	
			if (this._tool.active) {
				this._isFirstMeasurement = true;
				this._tool.deactivate();
			}
			else {
				this._tool.activate();	
				this._isFirstMeasurement = false;				
			}
		};

		const onClick = () => {
			reset();
		};
		return html`
        <style>${css}</style>
            <div class="container">
                <div class="ba-tool-container__item ba-tool-menu__zeichnen">
                <div>
                    <span class="tool-container__header">
                    ${translate('toolbox_measureTool_header')}
                    </span>
                </div>      
                <div class="tool-container__buttons">                                    
					<div id=${this._tool.name}
						class="tool-container__button ${classMap(toolClasses)}" 
						title=${translate(this._tool.title)}
						@click=${toggle}>				
							<div class="tool-container__background"></div>
							<div class="tool-container__icon ${this._tool.icon}">
							</div>  
							<div class="tool-container__button-text">${translate(this._tool.title)}
							</div>				
					</div>
					<div id=startnew class="tool-container__button ${classMap(measurementClasses)}" 
						title=${translate(this._tool.title)}
						@click=${onClick}>								
						<div class="tool-container__background"></div>		
						<div class="tool-container__icon start-new">
						</div>  
						<div class="tool-container__button-text">Start new</div>
					</div>					
                </div>
				<div class="tool-container__statistic" >								
					<div class="tool-container__statistic-text">${translate('toolbox_measureTool_stats_length')}: ${statistic.length}</div>
					<div class="tool-container__statistic-text">${translate('toolbox_measureTool_stats_area')}: ${unsafeHTML(statistic.area)}</div>
				</div>
                <div class="tool-container__buttons-secondary">                         
                    <button>                                 
                    ${translate('toolbox_drawTool_delete')}
                    </button>
                    <button>                            
                    ${translate('toolbox_drawTool_share')}
                    </button>
                    <button>                          
                    ${translate('toolbox_drawTool_save')}
                    </button>                                             
                </div>                
                <div class="tool-container__info"> 
                    <span>
                    ${translate('toolbox_drawTool_info')}
                    </span>
                </div>
            </div>	  
        </div>
        `;

	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { measurement } = state;
		return measurement;
	}

	static get tag() {
		return 'ba-tool-measure-content';
	}
}