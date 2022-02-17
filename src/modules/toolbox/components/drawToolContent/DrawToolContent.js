import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import css from './drawToolContent.css';
import { StyleSizeTypes } from '../../../../services/domain/styles';
import { clearDescription, clearText, finish, remove, reset, setDescription, setStyle, setType } from '../../../../store/draw/draw.action';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { AssetSourceType, getAssetSource, hexToRgb } from '../../../map/components/olMap/olStyleUtils';

const Update = 'update';
const Update_Tools = 'update_tools';
const Update_FileSaveResult = 'update_fileSaveResult';
const Update_CollapsedInfo = 'update_collapsedInfo';
const Update_CollapsedStyle = 'update_collapsedStyle';

/**
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 */
export class DrawToolContent extends AbstractToolContent {
	constructor() {
		super({
			type: null,
			style: null,
			collapsedInfo: null,
			collapsedStyle: null,
			description: null,
			selectedStyle: null,
			mode: null,
			fileSaveResult: { adminId: 'init', fileId: 'init' },
			validGeometry: null,
			tools: null
		});

		const { TranslationService: translationService, EnvironmentService: environmentService, UrlService: urlService, ShareService: shareService } = $injector.inject('TranslationService', 'EnvironmentService', 'UrlService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._urlService = urlService;
		this.signal(Update_Tools, this._buildTools());
	}

	onInitialize() {
		this.observe(state => state.draw, data => this.signal(Update, data));
		this.observe(state => state.shared, data => this.signal(Update_FileSaveResult, data));
	}

	update(type, data, model) {
		const setActiveToolByType = (tools, type) => {
			return tools.map(tool => {
				return { ...tool, active: tool.name === type };
			});
		};

		switch (type) {
			case Update:
				return {
					...model,
					type: data.type ? data.type : null,
					style: data.style ? data.style : null,
					description: data.description ? data.description : null,
					selectedStyle: data.selectedStyle ? data.selectedStyle : null,
					mode: data.mode ? data.mode : null,
					validGeometry: data.validGeometry ? data.validGeometry : null,
					tools: setActiveToolByType(model.tools, data.type)
				};
			case Update_Tools:
				return { ...model, tools: data };
			case Update_FileSaveResult:
				return { ...model, fileSaveResult: data.fileSaveResult };
			case Update_CollapsedInfo:
				return { ...model, collapsedInfo: data };
			case Update_CollapsedStyle:
				return { ...model, collapsedStyle: data };
		}
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [{
			id: 1,
			name: 'marker',
			active: false,
			title: translate('toolbox_drawTool_symbol'),
			icon: 'symbol',
			activate: () => {
				setType('marker');
				clearText();
				clearDescription();
			}
		}, {
			id: 2,
			name: 'text',
			active: false,
			title: translate('toolbox_drawTool_text'),
			icon: 'text',
			activate: () => {
				setType('text');
				clearText();
				clearDescription();
			}
		}, {
			id: 3,
			name: 'line',
			active: false,
			title: translate('toolbox_drawTool_line'),
			icon: 'line',
			activate: () => {
				setType('line');
				clearText();
				clearDescription();
			}
		}, {
			id: 4,
			name: 'polygon',
			active: false,
			title: translate('toolbox_drawTool_polygon'),
			icon: 'polygon',
			activate: () => {
				setType('polygon');
				clearText();
				clearDescription();
			}
		}];
	}

	_getActiveTool(model) {
		return model.tools.find(tool => tool.active);
	}

	_showActive(tools) {
		tools.forEach(tool => {
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

	_getButtons(model) {
		const buttons = [];
		const translate = (key) => this._translationService.translate(key);
		const { mode, validGeometry } = model;

		const getButton = (id, title, onClick) => {
			return html`<ba-button id=${id + '-button'} data-test-id
								class="tool-container__button" 
								.label=${title}
								@click=${onClick}></ba-button>`;
		};

		const activeTool = this._getActiveTool(model);
		const activeToolName = activeTool ? activeTool.name : 'noTool';
		// Cancel-Button

		if (mode === 'draw') {
			const getButtonOptions = () => {
				if (validGeometry) {
					// alternate Finish-Button
					return { id: 'finish', title: translate('toolbox_drawTool_finish'), onClick: () => finish() };
				}
				return {
					id: 'cancel',
					title: translate('toolbox_drawTool_cancel'),
					onClick: () => reset()
				};
			};
			const options = getButtonOptions();

			buttons.push(getButton(options.id, options.title, options.onClick));
		}
		// Remove-Button
		const removeAllowed = ['draw', 'modify'].includes(mode);
		if (removeAllowed) {
			const id = 'remove';
			const title = mode === 'draw' && ['polygon', 'line'].includes(activeToolName) && validGeometry ? translate('toolbox_drawTool_delete_point') : translate('toolbox_drawTool_delete_drawing');
			const onClick = () => remove();
			buttons.push(getButton(id, title, onClick));
		}

		const getShareButton = () => html`<ba-share-button .share=${model.fileSaveResult}></ba-share-button>`;
		buttons.push(getShareButton(model));

		return buttons;
	}

	_getSubText(model) {
		const { mode } = model;
		const translate = (key) => this._translationService.translate(key);
		const getTranslatedSpan = (key) => html`<span>${unsafeHTML(translate(key))}</span>`;
		const getDrawModeMessage = (mode) => getTranslatedSpan('toolbox_drawTool_draw_' + mode);
		return this._environmentService.isTouch() ? getDrawModeMessage(mode) : nothing;
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { type: preselectedType, style: preselectedStyle, selectedStyle, tools, description, collapsedInfo, collapsedStyle } = model;
		this._showActive(tools);
		const toolTemplate = (tool) => {
			const classes = { 'is-active': tool.active };
			const toggle = () => {
				if (tool.active) {
					setType(null);
				}
				else {
					tool.activate();
				}
			};

			return html`
            <button id=${tool.name + '-button'} data-test-id
                class="tool-container__button ${classMap(classes)}" 
                title=${tool.title}
                @click=${toggle}>
                <div class="tool-container__background"></div>
                <div class="tool-container__icon ${tool.icon}">
                </div>  
                <div class="tool-container__button-text">${tool.title}</div>
            </button>
            `;
		};

		const drawingStyle = selectedStyle ? selectedStyle.style : preselectedStyle;
		const drawingType = preselectedType ? preselectedType : (selectedStyle ? selectedStyle.type : null);
		const getStyleTemplate = (type, style) => {
			const onChangeColor = (e) => {
				const getStyle = () => {
					if (style.symbolSrc && getAssetSource(style.symbolSrc) === AssetSourceType.LOCAL) {
						return { ...style, color: e.target.value };
					}
					const getSymbolSrc = () => {
						const { IconService: iconService } = $injector.inject('IconService');
						const iconResult = iconService.getIconResult(style.symbolSrc);
						return iconResult.getUrl(hexToRgb(e.target.value));
					};

					return { ...style, symbolSrc: getSymbolSrc(), color: e.target.value };
				};
				const changedStyle = getStyle();
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

			const onChangeDescription = (e) => {
				setDescription(e.target.value);
			};

			const onChangeSymbol = (e) => {
				const hexColor = this.getModel().style.color;
				const url = e.detail.selected.getUrl(hexToRgb(hexColor));
				const symbolSrc = url ? url : e.detail.selected.base64;
				const changedStyle = { ...this.getModel().style, symbolSrc: symbolSrc };
				setStyle(changedStyle);
			};

			const selectTemplate = (sizes, selectedSize) => {
				console.warn(selectedSize);
				return sizes.map((size) => html`<option value=${size} ?selected=${size === selectedSize}>${translate('toolbox_drawTool_style_size_' + size)} </option>)}`);
			};

			const toggleCollapseInfo = () => {
				this.signal(Update_CollapsedInfo, !collapsedInfo);
			};
			const bodyCollapseClassInfo = {
				iscollapse: !collapsedInfo
			};
			const iconCollapseInfoClass = {
				iconexpand: collapsedInfo
			};

			const toggleCollapseStyle = () => {
				this.signal(Update_CollapsedStyle, !collapsedStyle);
			};
			const bodyCollapseClassStyle = {
				iscollapse: !collapsedStyle
			};
			const iconCollapseStyleClass = {
				iconexpand: collapsedStyle
			};

			/**
			 *  Helper-Function to create a VGA-Palette with 16 Colors.
			 *
			 * @returns {TemplateResult} the ColorPalette
			 */
			const getColorPalette = () => {
				return html`
				<div class='color-row'>										
					<button class='color red' value='#FF0000' @click=${onChangeColor}>
					</button>													
					<button class='color yellow' value='#FFFF00' @click=${onChangeColor}>
					</button>																							
					<button class='color lime' value='#00FF00'  @click=${onChangeColor}>
					</button>																							
					<button class='color aqua' value='#00FFFF'  @click=${onChangeColor}>
					</button>																						
					<button class='color blue' value='#0000FF'  @click=${onChangeColor}>
					</button>																						
					<button class='color fuchsia mr' value='#FF00FF'  @click=${onChangeColor}>
					</button>				
					<button class='color white' value='#FFFFFF'  @click=${onChangeColor}>
					</button>	
					<button class='color grey' value='#808080'  @click=${onChangeColor}>
					</button>													
				</div>	
				<div class='color-row'>
					<button class='color maroon' value='#800000'  @click=${onChangeColor}>
					</button>																							
					<button class='color olive' value='#808000'  @click=${onChangeColor}>
					</button>														
					<button class='color green' value='#008000'  @click=${onChangeColor}>
					</button>												
					<button class='color teal' value='#008080'  @click=${onChangeColor}>
					</button>											
					<button class='color navy' value='#000080'  @click=${onChangeColor}>
					</button>													
					<button class='color purple mr' value='#800080'  @click=${onChangeColor}>
					</button>	
					<button class='color silver' value='#C0C0C0'  @click=${onChangeColor}>
					</button>	
					<button class='color black' value='#000000'  @click=${onChangeColor}>
					</button>
				</div>
				`;
			};


			// todo: refactor to specific toolStyleContent-Components or factory
			if (type && style) {
				switch (type) {
					case 'marker':
						return html`
						<div id='style_marker' class="tool-container__style" >		
							<div  class='tool-section'> 
								<div class='sub-header' @click="${toggleCollapseInfo}"> 
									<span class='sub-header-text'>
										${translate('toolbox_drawTool_style_feature')}
									</span>
									<i class='icon chevron ${classMap(iconCollapseInfoClass)}'>
									</i>
								</div>
								<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
									<div class="fieldset" title="${translate('toolbox_drawTool_style_text')}"">								
										<input  required="required"  type="text" id="style_text" name="${translate('toolbox_drawTool_style_text')}" .value=${style.text} @input=${onChangeText}>
										<label for="style_text" class="control-label">${translate('toolbox_drawTool_style_text')}</label><i class="bar"></i>
									</div>
									<div  class="fieldset" title="${translate('toolbox_drawTool_style_desc')}">						
										<textarea required="required"  id="style_desc" name="${translate('toolbox_drawTool_style_desc')}" .value=${description} @input=${onChangeDescription}></textarea>
										<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
									</div>
								</div>
							</div>
							<div  class='tool-section'> 
								<div class='sub-header'  @click="${toggleCollapseStyle}"> 
									<span class='sub-header-text'>
									${translate('toolbox_drawTool_style_style')}
									</span>
									<i  class='icon chevron ${classMap(iconCollapseStyleClass)}'>
									</i>
								</div>
								<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">			
									<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">	
										<div class='color-input-container'>
											<div class='color-input  ${style.scale}' style=' mask: url("${style.symbolSrc}") ; -webkit-mask-image: url("${style.symbolSrc}") '>
												<input type="color" id="style_color"   name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @input=${onChangeColor}>
											</div>	
										</div>	
										<div class='attribute-container'>
											${getColorPalette()}
											<div class='color-row'>								
												<div class="tool-container__style_size" title="${translate('toolbox_drawTool_style_size')}">														
													<select id="style_size" @change=${onChangeScale}>
														${selectTemplate(Object.values(StyleSizeTypes), style.scale)}
													</select>								
												</div>									
											</div>
											<div class='color-row'>
												<div class="tool-container__style_symbol" title="${translate('toolbox_drawTool_style_symbol')}">								
													<ba-iconselect  id="style_symbol" .title="${translate('toolbox_drawTool_style_symbol_select')}" .value=${style.symbolSrc} .color=${style.color} @select=${onChangeSymbol} ></ba-iconselect>													
												</div>	
											</div>									
										</div>							
									</div>													
								</div>
							</div>
						</div>
						`;
					case 'text':
						return html`
						<div id='style_Text' class="tool-container__style" title='Text'>	
							<div  class='tool-section'> 
								<div class='sub-header' @click="${toggleCollapseInfo}"> 
									<span class='sub-header-text'>
									${translate('toolbox_drawTool_style_feature')}
									</span>
									<i class='icon chevron ${classMap(iconCollapseInfoClass)}'>
									</i>
								</div>
								<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
									<div class="fieldset" title="${translate('toolbox_drawTool_style_text')}"">								
										<input  required="required"  type="text" id="style_text" name="${translate('toolbox_drawTool_style_text')}" .value=${style.text} @input=${onChangeText}>
										<label for="style_text" class="control-label">${translate('toolbox_drawTool_style_text')}</label><i class="bar"></i>
									</div>
									<div  class="fieldset" title="${translate('toolbox_drawTool_style_desc')}">						
										<textarea required="required"  id="style_desc" name="${translate('toolbox_drawTool_style_desc')}" .value=${description} @input=${onChangeDescription}></textarea>
										<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
									</div>
								</div>
							</div>
							<div  class='tool-section'> 
								<div class='sub-header' @click="${toggleCollapseStyle}"> 
									<span class='sub-header-text'>
									${translate('toolbox_drawTool_style_style')}
									</span>
									<i class='icon chevron ${classMap(iconCollapseStyleClass)}'>
									</i>
								</div>
								<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
									<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">	
										<div class='color-input-container'>
											<div class='color-input color-input__text ${style.scale}'>
												<input type="color" id="style_color"   name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @input=${onChangeColor}>
											</div>	
										</div>	
										<div class='attribute-container'>
											${getColorPalette()}
											<div class='color-row'>		
												<div class="tool-container__style_size" title="${translate('toolbox_drawTool_style_size')}">									
													<select id="style_size" @change=${onChangeScale}>
														${selectTemplate(Object.values(StyleSizeTypes), style.scale)}
													</select>
												</div>		
											</div>	
										</div>							
									</div>	
								</div>	
							</div>													
						</div>
						`;
					case 'line':
						return html`
						<div id='style_line' class="tool-container__style" title='Line'>
							<div  class='tool-section'> 
								<div class='sub-header' @click="${toggleCollapseInfo}"> 
									<span class='sub-header-text'>
									${translate('toolbox_drawTool_style_feature')}
									</span>
									<i class='icon chevron ${classMap(iconCollapseInfoClass)}'>
									</i>
								</div>
								<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">	
									<div  class="fieldset" title="${translate('toolbox_drawTool_style_desc')}">						
										<textarea required="required"  id="style_desc" name="${translate('toolbox_drawTool_style_desc')}" .value=${description} @input=${onChangeDescription}></textarea>
										<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
									</div>
								</div>
							</div>
							<div class='tool-section'> 														
								<div class='sub-header' @click="${toggleCollapseStyle}"> 
									<span class='sub-header-text'>
									${translate('toolbox_drawTool_style_style')}
									</span>
									<i class='icon chevron ${classMap(iconCollapseStyleClass)}'>
									</i>
								</div>
							<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
								<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">	
									<div class='color-input-container'>
										<div class='color-input color-input__line'>
											<input type="color" id="style_color"   name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @input=${onChangeColor}>
										</div>	
									</div>	
									<div>
									${getColorPalette()}		
									</div>							
								</div>	
							</div>
						</div>
						`;
					case 'polygon':
						return html`
							<div id='style_polygon' class="tool-container__style" title='Polygon'>
								<div  class='tool-section'> 
									<div class='sub-header' @click="${toggleCollapseInfo}"> 
										<span class='sub-header-text'>
										${translate('toolbox_drawTool_style_feature')}
										</span>
										<i class='icon chevron ${classMap(iconCollapseInfoClass)}'>
										</i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
										<div class="fieldset" title="${translate('toolbox_drawTool_style_desc')}">				
											<textarea required="required" id="style_desc" name="${translate('toolbox_drawTool_style_desc')}" .value=${description} @input=${onChangeDescription}></textarea>
											<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
										</div>																					
									</div>							
								</div>							
								<div  class='tool-section'> 		
									<div class='sub-header' @click="${toggleCollapseStyle}"> 
										<span class='sub-header-text'>
										${translate('toolbox_drawTool_style_style')}
										</span>
										<i class='icon chevron ${classMap(iconCollapseStyleClass)}'>
										</i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
										<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">	
											<div class='color-input-container'>
												<div class='color-input color-input__polygon'>
													<input type="color" id="style_color"   name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @input=${onChangeColor}>
												</div>	
											</div>	
											<div>
											${getColorPalette()}		
											</div>							
										</div>	
									</div>	
								</div>
							</div>
							`;
					default:
						break;
				}

			}

			return nothing;

		};

		const buttons = this._getButtons(model);
		const subText = this._getSubText(model);

		return html`
        <style>${css}</style>
            <div class="ba-tool-container">
                <div class="ba-tool-container__item ba-tool-menu__draw">
					<div class="ba-tool-container__title">
						${translate('toolbox_drawTool_header')}                    
					</div>      
					<div class="ba-tool-container__content">                						     				
						<div class="tool-container__buttons">                                    
                			${repeat(tools, (tool) => tool.id, (tool) => toolTemplate(tool))}
                		</div>	
                	</div>	
				<div class="tool-container__form">
				${getStyleTemplate(drawingType, drawingStyle)}
				</div>				            			
				<div class='sub-text'>${subText}</div>
				<div class="ba-tool-container__actions">                         				
				${buttons}
				</div> 
            </div >	  
        </div >
			`;

	}

	static get tag() {
		return 'ba-tool-draw-content';
	}
}
