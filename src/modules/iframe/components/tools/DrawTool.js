/**
 * @module modules/iframe/components/tools/DrawTool
 */
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { deactivate as deactivateDrawing, activate as activateDrawing, finish, remove, reset, setType } from '../../../../store/draw/draw.action';
import { MvuElement } from '../../../MvuElement';
import undoSvg from './assets/arrow-counterclockwise.svg';
import pencil from './assets/pencil.svg';
import cancelSvg from './assets/close-lg.svg';
import finishSvg from './assets/checked.svg';
import { QueryParameters } from '../../../../domain/queryParameters';

import css from './drawTool.css';
import { IFrameComponents } from '../../../../domain/iframeComponents';

const Update = 'update';
const Update_Tools = 'update_tools';
/**
 *  IFrame component to draw simple geometries (Point, Line)
 */
export class DrawTool extends MvuElement {
	constructor() {
		super({
			active: false,
			type: null,
			mode: null,
			validGeometry: null,
			tools: null
		});

		const { TranslationService: translationService, EnvironmentService: environmentService } = $injector.inject(
			'TranslationService',
			'EnvironmentService'
		);
		this._translationService = translationService;
		this._environmentService = environmentService;

		this.signal(Update_Tools, this._buildTools());
	}

	onInitialize() {
		this.observe(
			(state) => state.draw,
			(data) => this.signal(Update, data)
		);
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
					active: data.active ? data.active : false,
					type: data.type ? data.type : null,
					mode: data.mode ? data.mode : null,
					validGeometry: data.validGeometry ? data.validGeometry : null,
					tools: setActiveToolByType(model.tools, data.type)
				};
			case Update_Tools:
				return { ...model, tools: data };
		}
	}

	isRenderingSkipped() {
		const queryParams = this._environmentService.getQueryParams();

		// check if we have a query parameter defining the iframe drawTool
		const iframeComponents = queryParams.get(QueryParameters.IFRAME_COMPONENTS);
		return iframeComponents ? !iframeComponents.split(',').includes(IFrameComponents.DRAW_TOOL) : true;
	}

	createView(model) {
		const { active, tools } = model;
		this._showActive(tools);
		const translate = (key) => this._translationService.translate(key);
		const toolTemplate = (tool) => {
			const classes = { 'is-active': tool.active, 'is-enabled': active };
			const toggle = () => {
				if (tool.active) {
					tool.deactivate();
				} else {
					tool.activate();
				}
			};

			return html`
				<button
					id=${tool.name + '-button'}
					data-test-id
					class="draw-tool__button ${classMap(classes)}"
					?disabled=${!active}
					title=${tool.title}
					@click=${toggle}
				>
					<div class="draw-tool__background"></div>
					<div class="draw-tool__icon ${tool.icon}"></div>
					<div class="draw-tool__button-text">${tool.title}</div>
				</button>
			`;
		};

		const icons = this._getIcons(model);

		const getActiveClass = () => {
			return active ? 'draw-tool__enable' : 'draw-tool__disable';
		};

		return html`
			<style>
				${css}
			</style>
			<div class="draw-tool">
				<div class="draw-tool__content ${getActiveClass()}">
					<div class="draw-tool__toggle">
						<ba-button
							class="draw-tool__enable-button"
							.type=${'primary'}
							.icon=${pencil}
							.label=${translate('iframe_drawTool_enable')}
							@click=${activateDrawing}
						></ba-button>
						<ba-icon id="close-icon" class='tool-container__close-button draw-tool__disable-button' .icon='${cancelSvg}' .size=${1.6} .color=${'var(--text2)'} .color_hover=${'var(--text2)'} @click=${deactivateDrawing}>						
					</div>
					<div class="draw-tool-container">
						<div class="ba-tool-container__title">${translate('iframe_drawTool_label')}</div>
						<div class="draw-tool__buttons">
							${repeat(
								tools,
								(tool) => tool.id,
								(tool) => toolTemplate(tool)
							)}
						</div>
						<div class="draw-tool__actions">${icons}</div>
					</div>
				</div>
			</div>
		`;
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [
			{
				id: 1,
				name: 'marker',
				active: false,
				title: translate('iframe_drawTool_symbol'),
				icon: 'symbol',
				activate: () => setType('marker'),
				deactivate: () => reset()
			},
			{
				id: 2,
				name: 'line',
				active: false,
				title: translate('iframe_drawTool_line'),
				icon: 'line',
				activate: () => setType('line'),
				deactivate: () => reset()
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

	_getIcons(model) {
		const translate = (key) => this._translationService.translate(key);
		const { mode, validGeometry } = model;

		const activeTool = this._getActiveTool(model);
		const activeToolName = activeTool ? activeTool.name : 'noTool';
		const removeAllowed = ['draw', 'modify'].includes(mode);
		const unfinishedLine = mode === 'draw' && activeToolName === 'line' && validGeometry;

		const getActiveIconTypes = () => {
			const iconTypes = {
				finish: { id: 'finish', icon: finishSvg, title: translate('iframe_drawTool_finish'), onClick: () => finish(), disabled: mode !== 'draw' },
				cancel: {
					id: 'cancel',
					icon: cancelSvg,
					title: translate('iframe_drawTool_cancel'),
					onClick: () => reset(),
					disabled: mode !== 'draw'
				},
				undo: {
					id: 'undo',
					icon: undoSvg,
					title: translate('iframe_drawTool_delete_point'),
					onClick: () => remove(),
					disabled: !removeAllowed
				},
				remove: {
					id: 'remove',
					icon: cancelSvg,
					title: translate('iframe_drawTool_delete_drawing'),
					onClick: () => remove(),
					disabled: !removeAllowed
				}
			};

			return [validGeometry ? iconTypes.finish : iconTypes.cancel, unfinishedLine ? iconTypes.undo : iconTypes.remove];
		};

		const getIcon = (id, title, onClick, disabled) => {
			const classes = { 'is-disabled': disabled };
			return html`<ba-button
				id=${id + '_icon'}
				class=${classMap(classes)}
				.title=${title}
				.label=${title}
				.disabled=${disabled}
				@click=${onClick}
			></ba-button>`;
		};

		return getActiveIconTypes().map((iconType) => getIcon(iconType.id, iconType.title, iconType.onClick, iconType.disabled));
	}

	static get tag() {
		return 'ba-draw-tool';
	}
}
