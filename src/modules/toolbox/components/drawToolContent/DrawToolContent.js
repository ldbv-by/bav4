import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { setType } from '../../../map/store/draw.action';
import css from './drawToolContent.css';


/**
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 */
export class DrawToolContent extends AbstractToolContent {
	constructor() {
		super();

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		this._activeTool = false;
		this._tools = this._buildTools();
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [{
			id: 1,
			name: 'symbol',
			active: false,
			title: translate('toolbox_drawTool_symbol'),
			icon: 'symbol',
			activate: () =>
				setType('symbol'),
			deactivate: () => { },
		}, {
			id: 2,
			name: 'text',
			active: false,
			title: translate('toolbox_drawTool_text'),
			icon: 'text',
			activate: () => setType('text'),
			deactivate: () => { },
		}, {
			id: 3,
			name: 'line',
			active: false,
			title: translate('toolbox_drawTool_line'),
			icon: 'line',
			activate: () => setType('line'),
			deactivate: () => { },
		}, {
			id: 4,
			name: 'polygon',
			active: false,
			title: translate('toolbox_drawTool_polygon'),
			icon: 'polygon',
			activate: () => setType('polygon'),
			deactivate: () => { },
		}];
	}

	_setActiveTool(tool) {
		if (this._activeTool) {
			if (this._activeTool !== tool) {
				this._activeTool.active = false;
				this._activeTool.deactivate();
				this._showActive();
			}
		}
		this._activeTool = tool;
		this._showActive();
	}

	_showActive() {
		const id = this._activeTool.name;
		const element = this._root.querySelector('#' + id);
		if (this._activeTool.active) {
			element.classList.add('is-active');
		}
		else {
			element.classList.remove('is-active');
		}
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		const toolTemplate = (tool) => {
			const classes = { 'is-active': tool.active };
			const toggle = () => {
				if (tool.active) {
					tool.deactivate();
				}
				else {
					tool.activate();
				}
				tool.active = !tool.active;
				this._setActiveTool(tool);
			};

			return html`
            <div id=${tool.name}
                class="tool-container__button ${classMap(classes)}" 
                title=${tool.title}
                @click=${toggle}>
                <div class="tool-container__background"></div>
                <div class="tool-container__icon ${tool.icon}">
                </div>  
                <div class="tool-container__button-text">${tool.title}</div>
            </div>
            `;
		};

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
                ${repeat(this._tools, (tool) => tool.id, (tool) => toolTemplate(tool))}
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