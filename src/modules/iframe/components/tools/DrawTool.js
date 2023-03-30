import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { finish, remove, reset, setType } from '../../../../store/draw/draw.action';
import { MvuElement } from '../../../MvuElement';
import undoSvg from './assets/arrow-counterclockwise.svg';
import cancelSvg from './assets/close-lg.svg';
import finishSvg from './assets/checked.svg';

import css from './drawTool.css';

const Update_Tools = 'update_tools';

export class DrawTool extends MvuElement {
	constructor() {
		super({
			type: null,
			style: null,
			mode: null,
			validGeometry: null,
			tools: null
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

	update(type, data, model) {
		switch (type) {
			case Update_Tools:
				return { ...model, tools: data };
		}
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
				activate: () => {
					reset();
					setType('marker');
				}
			},
			{
				id: 2,
				name: 'line',
				active: false,
				title: translate('iframe_drawTool_line'),
				icon: 'line',
				activate: () => {
					reset();
					setType('line');
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

	_getIcons(model) {
		const icons = [];
		const translate = (key) => this._translationService.translate(key);
		const { mode, validGeometry } = model;

		const getIcon = (icon, title, onClick, disabled = false) => {
			return html`<ba-icon .icon="${icon}" .title=${title} .disabled=${disabled} @click=${onClick}></ba-icon>`;
		};

		const activeTool = this._getActiveTool(model);
		const activeToolName = activeTool ? activeTool.name : 'noTool';

		// Cancel-Icon
		const getIconOptions = () => {
			if (validGeometry) {
				// alternate Finish-Icon
				return { icon: finishSvg, title: translate('iframe_drawTool_finish'), onClick: () => finish() };
			}
			return {
				icon: cancelSvg,
				title: translate('iframe_drawTool_cancel'),
				onClick: () => reset()
			};
		};
		const options = getIconOptions();

		icons.push(getIcon(options.icon, options.title, options.onClick, mode !== 'draw'));

		// Remove-Icon
		const removeAllowed = ['draw', 'modify'].includes(mode);

		const title =
			mode === 'draw' && activeToolName === 'line' && validGeometry
				? translate('iframe_drawTool_delete_point')
				: translate('iframe_drawTool_delete_drawing');
		const icon = mode === 'draw' && activeToolName === 'line' && validGeometry ? undoSvg : cancelSvg;
		icons.push(getIcon(icon, title, () => remove(), !removeAllowed));

		return icons;
	}

	createView(model) {
		const { tools } = model;
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
				<button id=${tool.name + '-button'} data-test-id class="draw-tool__button ${classMap(classes)}" title=${tool.title} @click=${toggle}>
					<div class="draw-tool__background"></div>
					<div class="draw-tool__icon ${tool.icon}"></div>
					<div class="draw-tool__button-text">${tool.title}</div>
				</button>
			`;
		};

		const icons = this._getIcons(model);

		return html`
			<style>
				${css}
			</style>
			<div class="draw-tool">
				<div class="draw-tool__content">
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
		`;
	}

	static get tag() {
		return 'ba-draw-tool';
	}
}
