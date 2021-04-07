import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../../map/store/measurement.action';

import css from './drawToolContent.css';


/**
 * @class
 * @author thiloSchlemmer
 */
export class DrawToolContent extends BaElement {
	constructor() {
		super();

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		this._activeTool = false;
	}

	activateMapTool(toolName) {
		if (this._activeTool === toolName) {
			return;
		}

		this.deactivateMapTool(this._activeTool);
		this._activeTool = toolName;
		switch (toolName) {
			case 'measure':
				activateMeasurement();
				break;

			default:
				break;
		}
	}

	deactivateMapTool(toolName) {
		if (this._activeTool !== toolName) {
			return;
		}

		this._activeTool = false;
		switch (toolName) {
			case 'measure':
				deactivateMeasurement();								
				break;

			default:
				break;
		}        
	}


	createView() {
		const translate = (key) => this._translationService.translate(key);        
		
		const toggle = (toolName) => {
			if (this._activeTool === toolName) {
				this.deactivateMapTool(toolName);
			}
			else {
				this.activateMapTool(toolName);
			}
		};	

		const toggleMeasurement = () => toggle('measure');

		return html`
        <style>${css}</style>
            <div class="container">
                <div class="ba-tool-container__item ba-tool-menu__zeichnen">
                <div>
                    <span class="tool-container__header">
                    ${translate('toolbox_drawTool_header')}
                    </span>
                </div>      
                <div class="tool-container__buttons">                                    
                    <div>
                        <div  class="tool-container__button_icon pencil">
                            
                        </div>
                        <div class="tool-container__button-text">
                        ${translate('toolbox_drawTool_symbol')}
                        </div>                   
                    </div>
                    <div>
                    <div  class="tool-container__button_icon pencil">
                        </div>
                        <div class="tool-container__button-text">
                        ${translate('toolbox_drawTool_text')}
                        </div>                   
                    </div>
                    <div>
                    <div  class="tool-container__button_icon pencil">
                        </div>
                        <div class="tool-container__button-text">
                        ${translate('toolbox_drawTool_line')}
                        </div>                   
                    </div>
                    <div>
                    <div  class="tool-container__button_icon pencil">
                        </div>
                        <div class="tool-container__button-text">
                        ${translate('toolbox_drawTool_polygon')}
                        </div>                   
                    </div>
                    <div @click=${toggleMeasurement}>
                    <div class="tool-container__button_icon pencil">
                        </div>
                        <div class="tool-container__button-text">
                            ${translate('toolbox_drawTool_measure')}
                        </div>                   
                    </div>
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

	static get tag() {
		return 'ba-tool-draw-content';
	}
}