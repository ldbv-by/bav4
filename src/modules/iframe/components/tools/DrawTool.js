import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../../injection';
import { finish, remove, reset, setType } from '../../../../store/draw/draw.action';
import { MvuElement } from '../../../MvuElement';
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

	_getButtons(model) {
		const buttons = [];
		const translate = (key) => this._translationService.translate(key);
		const { mode, validGeometry } = model;

		const getButton = (id, title, onClick, disabled = false) => {
			return html`<ba-button
				id=${id + '-button'}
				data-test-id
				class="draw-tool__button"
				.disabled=${disabled}
				.label=${title}
				@click=${onClick}
			></ba-button>`;
		};

		const activeTool = this._getActiveTool(model);
		const activeToolName = activeTool ? activeTool.name : 'noTool';

		// Cancel-Button
		const getButtonOptions = () => {
			if (validGeometry) {
				// alternate Finish-Button
				return { id: 'finish', title: translate('iframe_drawTool_finish'), onClick: () => finish() };
			}
			return {
				id: 'cancel',
				title: translate('iframe_drawTool_cancel'),
				onClick: () => reset()
			};
		};
		const options = getButtonOptions();

		buttons.push(getButton(options.id, options.title, options.onClick, mode !== 'draw'));

		// Remove-Button
		const removeAllowed = ['draw', 'modify'].includes(mode);

		const id = 'remove';
		const title =
			mode === 'draw' && activeToolName === 'line' && validGeometry
				? translate('iframe_drawTool_delete_point')
				: translate('iframe_drawTool_delete_drawing');

		buttons.push(getButton(id, title, () => remove(), !removeAllowed));

		return buttons;
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

		const buttons = this._getButtons(model);

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
					<div class="draw-tool__actions">${buttons}</div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-draw-tool';
	}
}
