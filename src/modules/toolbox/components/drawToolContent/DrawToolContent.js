/**
 * @module modules/toolbox/components/drawToolContent/DrawToolContent
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import css from './drawToolContent.css';
import { StyleSize } from '../../../../domain/styles';
import { clearDescription, clearText, finish, remove, reset, setDescription, setStyle, setType } from '../../../../store/draw/draw.action';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { hexToRgb } from '../../../../utils/colors';
import { AssetSourceType, getAssetSource } from '../../../../utils/assets';

const Update = 'update';
const Update_Tools = 'update_tools';
const Update_StoredContent = 'update_storedContent';
const Update_CollapsedInfo = 'update_collapsedInfo';
const Update_CollapsedStyle = 'update_collapsedStyle';

/**
 * Component to control drawing properties
 * @class
 * @author thiloSchlemmer
 * @author alsturm
 */
export class DrawToolContent extends AbstractToolContent {
	#lastMode = null;
	constructor() {
		super({
			type: null,
			style: null,
			collapsedInfo: null,
			collapsedStyle: null,
			description: null,
			statistic: null,
			selectedStyle: null,
			mode: null,
			validGeometry: null,
			tools: null,
			storedContent: null
		});

		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			SecurityService: securityService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'SecurityService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._securityService = securityService;
		this.signal(Update_Tools, this._buildTools());
	}

	onInitialize() {
		this.observe(
			(state) => state.draw,
			(data) => this.signal(Update, data)
		);
		this.observe(
			(state) => state.fileStorage.data,
			(data) => this.signal(Update_StoredContent, data)
		);
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_CollapsedInfo, !media.portrait)
		);
		this.observeModel('mode', (mode) => this._setFocusOnInputsOptionally(mode));
	}

	update(type, data, model) {
		const setActiveToolByType = (tools, type) => {
			return tools.map((tool) => {
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
					statistic: data.statistic ? data.statistic : null,
					selectedStyle: data.selectedStyle ? data.selectedStyle : null,
					mode: data.mode ? data.mode : null,
					validGeometry: data.validGeometry ? data.validGeometry : null,
					collapsedInfo: model.collapsedInfo ?? true,
					tools: setActiveToolByType(model.tools, data.type)
				};
			case Update_Tools:
				return { ...model, tools: data };
			case Update_StoredContent:
				return { ...model, storedContent: data };
			case Update_CollapsedInfo:
				return { ...model, collapsedInfo: data };
			case Update_CollapsedStyle:
				return { ...model, collapsedStyle: data };
		}
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [
			{
				id: 1,
				name: 'marker',
				active: false,
				title: translate('toolbox_drawTool_symbol'),
				icon: 'symbol',
				activate: () => {
					reset();
					clearText();
					clearDescription();
					setType('marker');
				}
			},
			{
				id: 2,
				name: 'text',
				active: false,
				title: translate('toolbox_drawTool_text'),
				icon: 'text',
				activate: () => {
					reset();
					clearText();
					clearDescription();
					setType('text');
				}
			},
			{
				id: 3,
				name: 'line',
				active: false,
				title: translate('toolbox_drawTool_line'),
				icon: 'line',
				activate: () => {
					reset();
					clearText();
					clearDescription();
					setType('line');
				}
			},
			{
				id: 4,
				name: 'polygon',
				active: false,
				title: translate('toolbox_drawTool_polygon'),
				icon: 'polygon',
				activate: () => {
					reset();
					clearText();
					clearDescription();
					setType('polygon');
				}
			}
		];
	}

	_getActiveTool(model) {
		return model.tools.find((tool) => tool.active);
	}

	_showActive(tools) {
		tools.forEach((tool) => {
			const element = this._root.querySelector(`#${tool.name}-button`);

			if (element) {
				if (tool.active) {
					element.classList.add('is-active');
				} else {
					element.classList.remove('is-active');
				}
			}
		});
	}

	_setFocusOnInputsOptionally(mode) {
		const isDrawingFinishedAndSwitchingToModify = (this.#lastMode === 'active' || this.#lastMode === 'draw') && mode === 'modify' ? true : false;

		if (isDrawingFinishedAndSwitchingToModify) {
			const bestElementToFocusOn = this._root.querySelector('.collapse-content:not(.iscollapse) *:is(input,textarea)');
			bestElementToFocusOn?.focus();
		}
		this.#lastMode = mode;
	}

	_getButtons(model) {
		const buttons = [];
		const translate = (key) => this._translationService.translate(key);
		const { mode, validGeometry } = model;

		const getButton = (id, label, title, onClick) => {
			return html`<ba-button
				id=${id + '-button'}
				data-test-id
				class="tool-container__button"
				.label=${label}
				.title=${title}
				@click=${onClick}
			></ba-button>`;
		};

		const activeTool = this._getActiveTool(model);
		const activeToolName = activeTool ? activeTool.name : 'noTool';
		// Cancel-Button

		if (mode === 'draw') {
			const getButtonOptions = () => {
				if (validGeometry) {
					// alternate Finish-Button
					return {
						id: 'finish',
						label: translate('toolbox_drawTool_finish'),
						title: translate('toolbox_drawTool_finish_title'),
						onClick: () => finish()
					};
				}
				return {
					id: 'cancel',
					label: translate('toolbox_drawTool_cancel'),
					title: translate('toolbox_drawTool_cancel_title'),
					onClick: () => reset()
				};
			};
			const options = getButtonOptions();

			buttons.push(getButton(options.id, options.label, options.title, options.onClick));
		}
		// Remove-Button
		const removeAllowed = ['draw', 'modify'].includes(mode);
		if (removeAllowed) {
			const id = 'remove';
			const label =
				mode === 'draw' && ['polygon', 'line'].includes(activeToolName) && validGeometry
					? translate('toolbox_drawTool_delete_point')
					: translate('toolbox_drawTool_delete_drawing');
			const onClick = () => remove();
			buttons.push(getButton(id, label, '', onClick));
		}

		return buttons;
	}

	_getSubText(model) {
		const { mode } = model;
		const translate = (key) => this._translationService.translate(key);
		const getTranslatedSpan = (key) => html`<span>${unsafeHTML(translate(key))}</span>`;
		const getDrawModeMessage = (mode) =>
			mode ? getTranslatedSpan('toolbox_drawTool_draw_' + mode) : getTranslatedSpan('toolbox_drawTool_draw_init');
		return this._environmentService.isTouch() ? getDrawModeMessage(mode) : nothing;
	}

	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const {
			type: preselectedType,
			style: preselectedStyle,
			selectedStyle,
			statistic,
			tools,
			description,
			collapsedInfo,
			collapsedStyle,
			storedContent
		} = model;
		this._showActive(tools);
		const toolTemplate = (tool) => {
			const classes = { 'is-active': tool.active };
			const toggle = () => {
				if (tool.active) {
					setType(null);
				} else {
					tool.activate();
				}
			};

			return html`
				<button id=${tool.name + '-button'} data-test-id class="tool-container__button ${classMap(classes)}" title=${tool.title} @click=${toggle}>
					<div class="tool-container__background"></div>
					<div class="tool-container__icon ${tool.icon}"></div>
					<div class="tool-container__button-text">${tool.title}</div>
				</button>
			`;
		};

		const drawingStyle = selectedStyle ? selectedStyle.style : preselectedStyle;
		const drawingType = preselectedType ? preselectedType : selectedStyle ? selectedStyle.type : null;
		const getStyleTemplate = (type, style) => {
			const onChangeColor = (hexColor) => {
				const getStyle = () => {
					if (style.symbolSrc && getAssetSource(style.symbolSrc) === AssetSourceType.LOCAL) {
						return { ...style, color: hexColor };
					}
					const getSymbolSrc = () => {
						const { IconService: iconService } = $injector.inject('IconService');
						const iconResult = iconService.getIconResult(style.symbolSrc);
						return iconResult?.getUrl(hexToRgb(hexColor));
					};

					return { ...style, symbolSrc: getSymbolSrc(), color: hexColor };
				};
				const changedStyle = getStyle();
				setStyle(changedStyle);
			};
			const onChangeScale = (e) => {
				const changedStyle = { ...style, scale: e.target.value };
				setStyle(changedStyle);
			};
			const onChangeText = (e) => {
				const changedStyle = { ...style, text: this._securityService.sanitizeHtml(e.target.value) };
				setStyle(changedStyle);
			};

			const preventEmptyString = (e) => {
				if (e.target.value === '') {
					clearText();
				}
			};

			const onChangeDescription = (e) => {
				setDescription(this._securityService.sanitizeHtml(e.target.value));
			};

			const onChangeSymbol = (e) => {
				const hexColor = style.color;
				const iconResult = e.detail.selected;
				const url = iconResult.getUrl(hexToRgb(hexColor));
				const symbolSrc = url ? url : iconResult.base64;
				const changedStyle = { ...style, symbolSrc: symbolSrc, anchor: iconResult.anchor };
				setStyle(changedStyle);
			};

			const selectTemplate = (sizes, selectedSize) => {
				return sizes.map(
					(size) => html`<option value=${size} ?selected=${size === selectedSize}>${translate('toolbox_drawTool_style_size_' + size)}</option>`
				);
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

			// todo: refactor to specific toolStyleContent-Components or factory
			if (type && style) {
				switch (type) {
					case 'marker':
						return html`
							<div id="style_marker" class="tool-container__style">
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseInfo}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_feature')} </span>
										<i class="icon chevron ${classMap(iconCollapseInfoClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
										<div>
											<div class="form-container">
												<div class="ba-form-element" title="${translate('toolbox_drawTool_style_text')}">
													<input
														type="text"
														id="style_text"
														name="${translate('toolbox_drawTool_style_text')}"
														.value=${style.text}
														@input=${onChangeText}
													/>
													<label for="style_text" class="control-label">${translate('toolbox_drawTool_style_text')}</label>
													<i class="bar"></i>
													<label class="helper-label">${translate('toolbox_drawTool_style_text_helper')}</label>
												</div>
												<div class="ba-form-element" title="${translate('toolbox_drawTool_style_desc')}">
													<textarea
														id="style_desc"
														name="${translate('toolbox_drawTool_style_desc')}"
														.value=${description}
														@input=${onChangeDescription}
													></textarea>
													<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
												</div>
												<ba-geometry-info .statistic=${statistic}></ba-geometry-info>
											</div>
										</div>
									</div>
								</div>
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseStyle}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_style')} </span>
										<i class="icon chevron ${classMap(iconCollapseStyleClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
										<div>
											<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
												<div class="color-input-container">
													<div
														class="color-input  ${style.scale}"
														style=' mask: url("${style.symbolSrc}") ; -webkit-mask-image: url("${style.symbolSrc}") '
													>
														<input
															type="color"
															id="style_color"
															name="${translate('toolbox_drawTool_style_color')}"
															.value=${style.color}
															@input=${(e) => onChangeColor(e.target.value)}
														/>
													</div>
												</div>
												<div class="attribute-container">
													<ba-color-palette @colorChanged=${(e) => onChangeColor(e.detail.color)}></ba-color-palette>
													<div class="color-row">
														<div class="tool-container__style_size" title="${translate('toolbox_drawTool_style_size')}">
															<select id="style_size" @change=${onChangeScale}>
																${selectTemplate(Object.values(StyleSize), style.scale)}
															</select>
														</div>
													</div>
													<div class="color-row">
														<div class="tool-container__style_symbol" title="${translate('toolbox_drawTool_style_symbol')}">
															<ba-iconselect
																id="style_symbol"
																.title="${translate('toolbox_drawTool_style_symbol_select')}"
																.value=${style.symbolSrc}
																.color=${style.color}
																@select=${onChangeSymbol}
															></ba-iconselect>
														</div>
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
							<div id="style_Text" class="tool-container__style" title="Text">
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseInfo}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_feature')} </span>
										<i class="icon chevron ${classMap(iconCollapseInfoClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
										<div>
											<div class="form-container">
												<div class="ba-form-element" title="${translate('toolbox_drawTool_style_text')}">
													<input
														type="text"
														id="style_text"
														name="${translate('toolbox_drawTool_style_text')}"
														.value=${style.text}
														@input=${onChangeText}
														@blur=${preventEmptyString}
													/>
													<label for="style_text" class="control-label">${translate('toolbox_drawTool_style_text')}</label><i class="bar"></i>
													<label class="helper-label">${translate('toolbox_drawTool_style_text_helper')}</label>
												</div>
												<div class="ba-form-element" title="${translate('toolbox_drawTool_style_desc')}">
													<textarea
														id="style_desc"
														name="${translate('toolbox_drawTool_style_desc')}"
														.value=${description}
														@input=${onChangeDescription}
													></textarea>
													<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
												</div>
												<ba-geometry-info .statistic=${statistic}></ba-geometry-info>
											</div>
										</div>
									</div>
								</div>
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseStyle}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_style')} </span>
										<i class="icon chevron ${classMap(iconCollapseStyleClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
										<div>
											<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
												<div class="color-input-container">
													<div class="color-input color-input__text ${style.scale}">
														<input
															type="color"
															id="style_color"
															name="${translate('toolbox_drawTool_style_color')}"
															.value=${style.color}
															@input=${(e) => onChangeColor(e.target.value)}
														/>
													</div>
												</div>
												<div class="attribute-container">
													<ba-color-palette @colorChanged=${(e) => onChangeColor(e.detail.color)}></ba-color-palette>
													<div class="color-row">
														<div class="tool-container__style_size" title="${translate('toolbox_drawTool_style_size')}">
															<select id="style_size" @change=${onChangeScale}>
																${selectTemplate(Object.values(StyleSize), style.scale)}
															</select>
														</div>
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
							<div id="style_line" class="tool-container__style" title="Line">
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseInfo}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_feature')} </span>
										<i class="icon chevron ${classMap(iconCollapseInfoClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
										<div>
											<div class="form-container">
												<div class="ba-form-element" title="${translate('toolbox_drawTool_style_desc')}">
													<textarea
														id="style_desc"
														name="${translate('toolbox_drawTool_style_desc')}"
														.value=${description}
														@input=${onChangeDescription}
													></textarea>
													<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
												</div>
												<ba-geometry-info .statistic=${statistic}></ba-geometry-info>
											</div>
										</div>
									</div>
								</div>
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseStyle}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_style')} </span>
										<i class="icon chevron ${classMap(iconCollapseStyleClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
										<div>
											<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
												<div class="color-input-container">
													<div class="color-input color-input__line">
														<input
															type="color"
															id="style_color"
															name="${translate('toolbox_drawTool_style_color')}"
															.value=${style.color}
															@input=${(e) => onChangeColor(e.target.value)}
														/>
													</div>
												</div>
												<ba-color-palette @colorChanged=${(e) => onChangeColor(e.detail.color)}></ba-color-palette>
											</div>
										</div>
									</div>
								</div>
							</div>
						`;
					case 'polygon':
						return html`
							<div id="style_polygon" class="tool-container__style" title="Polygon">
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseInfo}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_feature')} </span>
										<i class="icon chevron ${classMap(iconCollapseInfoClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassInfo)}">
										<div>
											<div class="form-container">
												<div class="ba-form-element" title="${translate('toolbox_drawTool_style_desc')}">
													<textarea
														id="style_desc"
														name="${translate('toolbox_drawTool_style_desc')}"
														.value=${description}
														@input=${onChangeDescription}
													></textarea>
													<label for="style_desc" class="control-label">${translate('toolbox_drawTool_style_desc')}</label><i class="bar"></i>
												</div>
												<ba-geometry-info .statistic=${statistic}></ba-geometry-info>
											</div>
										</div>
									</div>
								</div>
								<div class="tool-section">
									<div class="sub-header" @click="${toggleCollapseStyle}">
										<span class="sub-header-text"> ${translate('toolbox_drawTool_style_style')} </span>
										<i class="icon chevron ${classMap(iconCollapseStyleClass)}"> </i>
									</div>
									<div class="collapse-content ${classMap(bodyCollapseClassStyle)}">
										<div>
											<div class="tool-container__style_color" title="${translate('toolbox_drawTool_style_color')}">
												<div class="color-input-container">
													<div class="color-input color-input__polygon">
														<input
															type="color"
															id="style_color"
															name="${translate('toolbox_drawTool_style_color')}"
															.value=${style.color}
															@input=${(e) => onChangeColor(e.target.value)}
														/>
													</div>
												</div>
												<ba-color-palette @colorChanged=${(e) => onChangeColor(e.detail.color)}></ba-color-palette>
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
			<style>
				${css}
			</style>
			<div class="ba-tool-container">
				<div class="ba-tool-container__item ba-tool-menu__draw">
					<div class="ba-tool-container__title">${translate('toolbox_drawTool_header')}</div>
					<div class="ba-tool-container__content">
						<div class="tool-container__buttons">
							${repeat(
								tools,
								(tool) => tool.id,
								(tool) => toolTemplate(tool)
							)}
						</div>
					</div>
					<div class="tool-container__form">${getStyleTemplate(drawingType, drawingStyle)}</div>
					<div class="sub-text">${subText}</div>
					<div class="chips__container">
						<ba-profile-chip></ba-profile-chip><ba-share-data-chip></ba-share-data-chip>
						<ba-export-vector-data-chip .exportData=${storedContent}></ba-export-vector-data-chip>
					</div>
					<div class="ba-tool-container__actions">${buttons}</div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-tool-draw-content';
	}
}
