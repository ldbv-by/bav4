import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { closeToolContainer } from '../../store/toolContainer.action'; 
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
		
	}


	createView() {
		const translate = (key) => this._translationService.translate(key);


		return html`
        <style>${css}</style>
            <div class="container">
                <div class="ba-tool-container__item ba-tool-menu__zeichnen">
                <div>
                    <span class="tool-container__header">
                    ${translate('toolbox_drawTool_header')}
                    </span>
                </div>                                      
                <div class="tool-container__tools-nav">                        
                        <button @click=${closeToolContainer} class="tool-container__close-button">
                            x
                        </button>                             
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
                    <div>
                    <div  class="tool-container__button_icon pencil">
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