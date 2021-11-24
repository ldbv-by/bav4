import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import css from './drawToolContent.css';
import { StyleSizeTypes } from '../../../../services/domain/styles';
import { finish, remove, reset, setStyle, setType } from '../../../../store/draw/draw.action';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { openModal } from '../../../../store/modal/modal.action';
import { QueryParameters } from '../../../../services/domain/queryParameters';

const Update = 'update';
const Update_Tools = 'update_tools';

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
					type: data.type,
					style: data.style,
					selectedStyle: data.selectedStyle,
					mode: data.mode,
					validGeometry: data.validGeometry,
					fileSaveResult: data.fileSaveResult,
					tools: setActiveToolByType(model.tools, data.type)
				};
			case Update_Tools:
				return { ...model, tools: data };
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
			activate: () => setType('marker')
		}, {
			id: 2,
			name: 'text',
			active: false,
			title: translate('toolbox_drawTool_text'),
			icon: 'text',
			activate: () => setType('text')
		}, {
			id: 3,
			name: 'line',
			active: false,
			title: translate('toolbox_drawTool_line'),
			icon: 'line',
			activate: () => setType('line')
		}, {
			id: 4,
			name: 'polygon',
			active: false,
			title: translate('toolbox_drawTool_polygon'),
			icon: 'polygon',
			activate: () => setType('polygon')
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
			return html`<ba-button id=${id} 
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

		buttons.push(this._getShareButton(model));

		return buttons;
	}

	_getShareButton(model) {
		const { fileSaveResult } = model;
		const translate = (key) => this._translationService.translate(key);
		const isValidForSharing = (fileSaveResult) => {
			if (!fileSaveResult) {
				return false;
			}
			if (!fileSaveResult.adminId || !fileSaveResult.fileId) {
				return false;
			}
			return true;
		};
		const buildShareUrl = async (id) => {
			const extraParams = { [QueryParameters.LAYER]: id };
			const url = this._shareService.encodeState(extraParams);
			try {
				const shortUrl = await this._urlService.shorten(url);
				return shortUrl;
			}
			catch (error) {
				console.warn('Could shortener-service is not working:', error);
				return url;
			}


		};
		const generateShareUrls = async () => {
			const forAdminId = await buildShareUrl(fileSaveResult.adminId);
			const forFileId = await buildShareUrl(fileSaveResult.fileId);
			return { adminId: forAdminId, fileId: forFileId };

		};
		if (isValidForSharing(fileSaveResult)) {

			const title = translate('toolbox_drawTool_share');
			const onClick = () => {
				generateShareUrls().then(shareUrls => {
					openModal(title, html`<ba-sharemeasure .shareurls=${shareUrls}></ba-sharemeasure>`);
				});
			};
			return html`<ba-button id='share' 
			class="tool-container__button" 
			.label=${title}
			@click=${onClick}></ba-button>`;

		}
		return nothing;
	}

	_getSubText(model) {
		const { mode } = model;
		const translate = (key) => this._translationService.translate(key);
		let subTextMessage = translate('toolbox_drawTool_info');
		if (this._environmentService.isTouch()) {
			switch (mode) {
				case 'active':
					subTextMessage = translate('toolbox_drawTool_draw_active');
					break;
				case 'draw':
					subTextMessage = translate('toolbox_drawTool_draw_draw');
					break;
				case 'modify':
					subTextMessage = translate('toolbox_drawTool_draw_modify');
					break;
				case 'select':
					subTextMessage = translate('toolbox_drawTool_draw_select');
			}
		}
		return html`<span>${unsafeHTML(subTextMessage)}</span>`;
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { type: preselectedType, style: preselectedStyle, selectedStyle, tools } = model;
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
				const decodeIconId = (iconUrl) => {
					const fromEncodedUrl = iconUrl.splice(iconUrl.lastIndexOf(encodeURIComponent('/')) + iconUrl.lastIndexOf(encodeURIComponent('/')).length);
					return fromEncodedUrl;
				};
				const getStyle = () => {
					if (style.symbolSrc.startsWith('data:image/svg+xml;base64,')) {
						return { ...style, color: e.target.value };
					}
					const { IconService: iconService } = $injector.inject('IconService');

					const iconId = decodeIconId(style.symbolSrc);
					return { ...style, symbolSrc: iconService.getUrl(iconId, e.target.value) };

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

			const onChangeSymbol = (e) => {
				const changedStyle = { ...this.getModel().style, symbolSrc: e.detail.selected.base64 };
				setStyle(changedStyle);
			};

			const selectTemplate = (sizes, selectedSize) => {
				return sizes.map((size) => html`<option value=${size} ?selected=${size === selectedSize}>${translate('toolbox_drawTool_style_size_' + size)} </option>)}`);
			};

			// todo: refactor to specific toolStyleContent-Components or factory
			if (type && style) {
				switch (type) {
					case 'marker':
						return html`
						<div id='style_marker'
							class="tool-container__style" 
							title='Symbol'>							
							<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
								<label for="style_color">${translate('toolbox_drawTool_style_color')}</label>	
								<input type="color" id="style_color" name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @change=${onChangeColor}>						
							</div>					
							<div class="tool-container__style_size" title="${translate('toolbox_drawTool_style_size')}">
								<label for="style_size">${translate('toolbox_drawTool_style_size')}</label>									
								<select id="style_size" @change=${onChangeScale}>
									${selectTemplate(Object.values(StyleSizeTypes), style.scale)}
								</select>								
							</div>			
							<div class="tool-container__style_symbol" title="${translate('toolbox_drawTool_style_symbol')}">
								<label for="style_symbol">${translate('toolbox_drawTool_style_symbol')}</label>	
								<ba-iconselect  id="style_symbol" .title="${translate('toolbox_drawTool_style_symbol_select')}" .value=${style.symbolSrc} .color=${style.color} @select=${onChangeSymbol} ></ba-iconselect>													
							</div>				
						</div>
						`;
					case 'text':
						return html`
						<div id='style_Text'
							class="tool-container__style" 
							title='Text'>
							<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
								<label for="style_color">${translate('toolbox_drawTool_style_color')}</label>	
								<input type="color" id="style_color" name="${translate('toolbox_drawTool_style_color')}" .value=${style.color} @change=${onChangeColor}>						
							</div>	
							<div class="tool-container__style_heigth" title="${translate('toolbox_drawTool_style_size')}">
								<label for="style_size">${translate('toolbox_drawTool_style_size')}</label>	
								<select id="style_size" @change=${onChangeScale}>
									${selectTemplate(Object.values(StyleSizeTypes), style.scale)}
								</select>
							</div>				
							<div class="tool-container__style_text" title="${translate('toolbox_drawTool_style_text')}">
								<label for="style_text">${translate('toolbox_drawTool_style_text')}</label>	
								<input type="string" id="style_text" name="${translate('toolbox_drawTool_style_text')}" .value=${style.text} @change=${onChangeText}>
							</div>							
						</div>
						`;
					case 'line':
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
					case 'polygon':
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
