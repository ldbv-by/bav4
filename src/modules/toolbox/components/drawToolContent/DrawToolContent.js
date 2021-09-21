import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { setStyle, setType } from '../../../map/store/draw.action';
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
		this._tools = this._buildTools();
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [{
			id: 1,
			name: 'Symbol',
			active: false,
			title: translate('toolbox_drawTool_symbol'),
			icon: 'symbol',
			activate: () => setType('Symbol')
		}, {
			id: 2,
			name: 'Text',
			active: false,
			title: translate('toolbox_drawTool_text'),
			icon: 'text',
			activate: () => setType('Text')
		}, {
			id: 3,
			name: 'Line',
			active: false,
			title: translate('toolbox_drawTool_line'),
			icon: 'line',
			activate: () => setType('Line')
		}, {
			id: 4,
			name: 'Polygon',
			active: false,
			title: translate('toolbox_drawTool_polygon'),
			icon: 'polygon',
			activate: () => setType('Polygon')
		}];
	}

	_setActiveToolByType(type) {
		this._tools.forEach(tool => tool.active = tool.name === type);
		this._showActive();
	}

	_showActive() {
		this._tools.forEach(tool => {
			const id = tool.name;
			const element = this._root.querySelector('#' + id);
			if (element) {
				if (tool.active) {
					element.classList.add('is-active');
				}
				else {
					element.classList.remove('is-active');
				}
			}
		});
	}

	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { type: preselectedType, style: preselectedStyle, selectedStyle } = state;
		this._setActiveToolByType(preselectedType);

		const toolTemplate = (tool) => {
			const classes = { 'is-active': tool.active };
			const toggle = () => {
				tool.active = !tool.active;
				if (tool.active) {
					tool.activate();
				}
				else {
					setType(null);
				}
				this._showActive();
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
		const drawingStyle = selectedStyle ? selectedStyle.style : preselectedStyle;
		const drawingType = preselectedType ? preselectedType : (selectedStyle ? selectedStyle.type : null);


		const getStyleTemplate = (type, style) => {
			const onChangeColor = (e) => {
				const changedStyle = { ...style, color: e.target.value };
				setStyle(changedStyle);
			};
			const onChangeScale = (e) => {
				const changedStyle = { ...style, scale: e.target.value };
				setStyle(changedStyle);
			};
			const onChangeText = (e) => {
				const changedStyle = { ...style, text: e.target.value };
				setStyle(changedStyle);
			};

			if (type && style) {
				switch (type) {
					case 'Symbol':
						return html`
						<div id='style_symbol'
							class="tool-container__style" 
							title='Symbol'>
							<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
								<label for="style_color">${translate('toolbox_drawTool_style_color')}</label>	
								<input type="color" id="style_color" name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @change=${onChangeColor}>						
							</div>					
							<div class="tool-container__style_size" title="${translate('toolbox_drawTool_style_scale')}">
								<label for="style_scale">${translate('toolbox_drawTool_style_scale')}</label>	
								<input type="number" id="style_scale" min="0.5" max="2" step="0.5" name="${translate('toolbox_drawTool_style_size')}" .value=${style.scale} @change=${onChangeScale}>
							</div>
						</div>
						`;
					case 'Text':
						return html`
						<div id='style_Text'
							class="tool-container__style" 
							title='Text'>
							<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
								<label for="style_color">${translate('toolbox_drawTool_style_color')}</label>	
								<input type="color" id="style_color" name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @change=${onChangeColor}>						
							</div>					
							<div class="tool-container__style_text" title="${translate('toolbox_drawTool_style_text')}">
								<label for="style_text">${translate('toolbox_drawTool_style_text')}</label>	
								<input type="string" id="style_text" name="${translate('toolbox_drawTool_style_text')}" .value=${style.text} @change=${onChangeText}>
							</div>
							<div class="tool-container__style_heigth" title="${translate('toolbox_drawTool_style_scale')}">
								<label for="style_height">${translate('toolbox_drawTool_style_size')}</label>	
								<input type="number" id="style_height" min="5" max="30" name="${translate('toolbox_drawTool_style_scale')}" .value=${style.scale} @change=${onChangeScale}>
							</div>
						</div>
						`;
					case 'Line':
						return html`
						<div id='style_line'
							class="tool-container__style" 
							title='Line'>
							<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
								<label for="style_color">${translate('toolbox_drawTool_style_color')}</label>	
								<input type="color" id="style_color" name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @change=${onChangeColor}>						
							</div>					
						</div>
						`;
					case 'Polygon':
						return html`
							<div id='style_polygon'
								class="tool-container__style" 
								title='Polygon'>
								<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
									<label for="style_color">${translate('toolbox_drawTool_style_color')}</label>	
									<input type="color" id="style_color" name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @change=${onChangeColor}>						
								</div>				
							</div>
							`;
					default:
						break;
				}

			}

			return nothing;

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
				<div class="tool-container__form">
				${getStyleTemplate(drawingType, drawingStyle)}
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
                </div >
            </div >	  
        </div >
			`;

	}

	/**
	 * @override
	 * @param {Object} globalState
	 */
	extractState(globalState) {
		const { draw } = globalState;
		return draw;
	}

	static get tag() {
		return 'ba-tool-draw-content';
	}
}
