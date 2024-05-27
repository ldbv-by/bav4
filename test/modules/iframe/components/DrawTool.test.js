import { QueryParameters } from '../../../../src/domain/queryParameters';
import { Tools } from '../../../../src/domain/tools';
import { $injector } from '../../../../src/injection';
import { DrawTool } from '../../../../src/modules/iframe/components/tools/DrawTool';
import { activate, deactivate } from '../../../../src/store/draw/draw.action';
import { drawReducer } from '../../../../src/store/draw/draw.reducer';
import { toolsReducer } from '../../../../src/store/tools/tools.reducer';
import { EventLike } from '../../../../src/utils/storeUtils';
import { TestUtils } from '../../../test-utils';

window.customElements.define(DrawTool.tag, DrawTool);

describe('DrawTool', () => {
	let store;
	const drawDefaultState = {
		active: false,
		mode: null,
		type: null,
		reset: null
	};
	const environmentServiceMock = {
		isEmbedded: () => true,
		getQueryParams: () => new URLSearchParams()
	};

	const setup = async (drawState = drawDefaultState) => {
		const state = {
			draw: drawState
		};

		store = TestUtils.setupStoreAndDi(state, {
			draw: drawReducer,
			tools: toolsReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentServiceMock).registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(DrawTool.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new DrawTool().getModel();

			expect(model).toEqual({
				active: false,
				type: null,
				mode: null,
				validGeometry: null,
				tools: jasmine.any(Array)
			});
		});
	});

	describe('when initialized', () => {
		const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=true`);

		it('builds list of tools', async () => {
			const element = await setup();

			expect(element._model.tools).toBeTruthy();
			expect(element._model.tools.length).toBe(3);

			expect(element._model.tools.map((t) => t.name)).toEqual(jasmine.arrayWithExactContents(['point', 'line', 'polygon']));
		});

		describe('QueryParameters.EC_DRAW_TOOL is NOT present', () => {
			it('renders nothing', async () => {
				const queryParam = new URLSearchParams();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('QueryParameters.EC_DRAW_TOOL is a comma-separated list of values', () => {
			it('builds the full list of tools (from invalid toolName)', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=fooBar`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(3);
				expect(element.shadowRoot.querySelector('#point-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeTruthy();
			});

			it('builds the full list of tools (from list of invalid toolNames)', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=foo,bar`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(3);
				expect(element.shadowRoot.querySelector('#point-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeTruthy();
			});

			it('builds the list of tools WITHOUT point-tool', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=line,polygon`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(2);
				expect(element.shadowRoot.querySelector('#point-button')).toBeFalsy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeTruthy();
			});

			it('builds the list of tools WITHOUT line-tool', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=point,polygon`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(2);
				expect(element.shadowRoot.querySelector('#point-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeFalsy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeTruthy();
			});

			it('builds the list of tools WITHOUT polygon-tool', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=point,line`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(2);
				expect(element.shadowRoot.querySelector('#point-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeFalsy();
			});

			it('builds the list of tools ONLY with point-tool', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=point`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('#point-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeFalsy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeFalsy();
			});

			it('builds the list of tools ONLY with line-tool', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=line`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('#point-button')).toBeFalsy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeFalsy();
			});

			it('builds the list of tools ONLY with polygon-tool', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=polygon`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('#point-button')).toBeFalsy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeFalsy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeTruthy();
			});

			it('builds the list of tools case-insensitive', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_DRAW_TOOL}=point,LINE,pOLygon`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.draw-tool__button')).toHaveSize(3);
				expect(element.shadowRoot.querySelector('#point-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#line-button')).toBeTruthy();
				expect(element.shadowRoot.querySelector('#polygon-button')).toBeTruthy();
			});
		});

		describe('QueryParameters.EC_DRAW_TOOL is present', () => {
			let environmentServiceSpy;
			beforeEach(() => {
				environmentServiceSpy = spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			});

			it('renders nothing when default mode', async () => {
				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(false);
				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
				expect(environmentServiceSpy).toHaveBeenCalledTimes(1);
			});

			it('shows a label', async () => {
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.ba-tool-container__title')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.ba-tool-container__title')[0].innerText).toBe('iframe_drawTool_label');
				expect(environmentServiceSpy).toHaveBeenCalledTimes(1);
			});

			it('shows a list of tools', async () => {
				const element = await setup();

				expect(element._model.tools).toBeTruthy();
				expect(element._model.tools.length).toBe(3);

				expect(element.shadowRoot.querySelectorAll('.draw-tool__enable-button')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('#close-icon')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.draw-tool__buttons')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.draw-tool__buttons').childElementCount).toBe(3);
				expect(environmentServiceSpy).toHaveBeenCalledTimes(1);
			});

			describe('events', () => {
				it('shows/hides the enable/disable buttons', async () => {
					const element = await setup();
					expect(element.shadowRoot.querySelectorAll('.draw-tool__enable')).toHaveSize(0);
					expect(element.shadowRoot.querySelectorAll('.draw-tool__disable')).toHaveSize(1);

					activate();

					expect(element.shadowRoot.querySelectorAll('.draw-tool__enable')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('.draw-tool__disable')).toHaveSize(0);

					deactivate();

					expect(element.shadowRoot.querySelectorAll('.draw-tool__enable')).toHaveSize(0);
					expect(element.shadowRoot.querySelectorAll('.draw-tool__disable')).toHaveSize(1);
				});

				describe('the enable/disable button is clicked', () => {
					it('updates the tools s-o-s', async () => {
						const element = await setup();

						element.shadowRoot.querySelector('.draw-tool__enable-button').click();

						expect(store.getState().tools.current).toBe(Tools.DRAW);

						element.shadowRoot.querySelector('.draw-tool__disable-button').click();

						expect(store.getState().tools.current).toBeNull();
					});
				});

				it('activates the Line draw tool', async () => {
					const element = await setup();
					const toolButton = element.shadowRoot.querySelector('#line-button');
					activate();

					toolButton.click();

					expect(toolButton.classList.contains('is-active')).toBeTrue();
					expect(store.getState().draw.type).toBe('line');
				});

				it('activates the Point draw tool', async () => {
					const element = await setup();
					const toolButton = element.shadowRoot.querySelector('#point-button');
					activate();

					toolButton.click();

					expect(toolButton.classList.contains('is-active')).toBeTrue();
					expect(store.getState().draw.type).toBe('point');
				});

				it('activates the Polygon draw tool', async () => {
					const element = await setup();
					const toolButton = element.shadowRoot.querySelector('#polygon-button');
					activate();

					toolButton.click();

					expect(toolButton.classList.contains('is-active')).toBeTrue();
					expect(store.getState().draw.type).toBe('polygon');
				});

				it('deactivates last tool, when activate another', async () => {
					const element = await setup();
					const lastButton = element.shadowRoot.querySelector('#point-button');
					activate();

					lastButton.click();

					const toolButton = element.shadowRoot.querySelector('#line-button');
					toolButton.click();

					expect(toolButton.classList.contains('is-active')).toBeTrue();
					expect(lastButton.classList.contains('is-active')).toBeFalse();
				});

				it('toggles the point tool', async () => {
					const element = await setup();
					const toolButton = element.shadowRoot.querySelector('#point-button');
					activate();

					toolButton.click();

					expect(store.getState().draw.active).toBeTrue();
					expect(store.getState().draw.type).toBe('point');

					toolButton.click();

					expect(store.getState().draw.reset).toEqual(jasmine.any(EventLike));
				});

				it('toggles the line tool', async () => {
					const element = await setup();
					const toolButton = element.shadowRoot.querySelector('#line-button');
					activate();

					toolButton.click();

					expect(store.getState().draw.active).toBeTrue();
					expect(store.getState().draw.type).toBe('line');

					toolButton.click();

					expect(store.getState().draw.reset).toEqual(jasmine.any(EventLike));
				});

				it('toggles the polygon tool', async () => {
					const element = await setup();
					const toolButton = element.shadowRoot.querySelector('#polygon-button');
					activate();

					toolButton.click();

					expect(store.getState().draw.active).toBeTrue();
					expect(store.getState().draw.type).toBe('polygon');

					toolButton.click();

					expect(store.getState().draw.reset).toEqual(jasmine.any(EventLike));
				});

				it('displays the finish-button for line', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });

					expect(element.shadowRoot.querySelectorAll('#cancel_icon')).toHaveSize(0);
					expect(element.shadowRoot.querySelectorAll('#finish_icon')).toHaveSize(1);
					expect(element.shadowRoot.querySelector('#finish_icon').title).toBe('iframe_drawTool_finish');
				});

				it('displays the finish-button disabled for marker', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

					expect(element.shadowRoot.querySelectorAll('#cancel_icon')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('#finish_icon')).toHaveSize(0);
				});

				it('finishes the drawing', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
					const finishIcon = element.shadowRoot.querySelector('#finish_icon');

					finishIcon.click();

					expect(store.getState().draw.finish).toBeInstanceOf(EventLike);
				});

				it('resets the drawing', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });
					const resetIcon = element.shadowRoot.querySelector('#cancel_icon');

					resetIcon.click();

					expect(resetIcon.title).toBe('iframe_drawTool_cancel');
					expect(store.getState().draw.reset).toBeInstanceOf(EventLike);
				});

				it('removes the selected drawing', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'modify', type: 'line' });
					const removeIcon = element.shadowRoot.querySelector('#remove_icon');

					removeIcon.click();
					expect(removeIcon.title).toBe('iframe_drawTool_delete_drawing');
					expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
				});

				it('deletes the last drawn point of drawing line', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
					const undoIcon = element.shadowRoot.querySelector('#undo_icon');

					undoIcon.click();
					expect(undoIcon.title).toBe('iframe_drawTool_delete_point');
					expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
				});

				it('deletes the last drawn point of drawing polygon', async () => {
					const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'polygon', validGeometry: true });
					const undoIcon = element.shadowRoot.querySelector('#undo_icon');

					undoIcon.click();
					expect(undoIcon.title).toBe('iframe_drawTool_delete_point');
					expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
				});
			});
		});
	});
});
