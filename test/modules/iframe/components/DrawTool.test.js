import { QueryParameters } from '../../../../src/domain/queryParameters';
import { Tools } from '../../../../src/domain/tools';
import { $injector } from '../../../../src/injection';
import { DrawTool } from '../../../../src/modules/iframe/components/tools/DrawTool';
import { drawReducer } from '../../../../src/store/draw/draw.reducer';
import { EventLike } from '../../../../src/utils/storeUtils';
import { TestUtils } from '../../../test-utils';

window.customElements.define(DrawTool.tag, DrawTool);

describe('DrawTool', () => {
	let store;
	const windowMock = {
		matchMedia() {},
		location: {
			get search() {
				return null;
			}
		}
	};
	const drawDefaultState = {
		active: false,
		mode: null,
		type: null,
		reset: null
	};

	const setup = async (drawState = drawDefaultState) => {
		const state = {
			draw: drawState
		};

		store = TestUtils.setupStoreAndDi(state, {
			draw: drawReducer
		});
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(DrawTool.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({
				type: null,
				mode: null,
				validGeometry: null,
				tools: jasmine.any(Array)
			});
		});
	});

	describe('when initialized', () => {
		it('builds list of tools', async () => {
			const element = await setup();

			expect(element._model.tools).toBeTruthy();
			expect(element._model.tools.length).toBe(2);
		});

		describe('when queryParam for drawTool is set', () => {
			const drawToolQueryParam = QueryParameters.TOOL_ID + '=' + Tools.DRAWING;

			beforeEach(() => {
				spyOnProperty(windowMock.location, 'search').and.returnValue(drawToolQueryParam);
			});

			it('shows a list of tools', async () => {
				const element = await setup();

				expect(element._model.tools).toBeTruthy();
				expect(element._model.tools.length).toBe(2);

				expect(element.shadowRoot.querySelectorAll('.draw-tool__buttons')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.draw-tool__buttons').childElementCount).toBe(2);
			});

			it('activates the Line draw tool', async () => {
				const element = await setup();

				const toolButton = element.shadowRoot.querySelector('#line-button');

				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();
				expect(store.getState().draw.reset).toBeTruthy();
				expect(store.getState().draw.type).toBe('line');
			});

			it('activates the Marker draw tool', async () => {
				const element = await setup();

				const toolButton = element.shadowRoot.querySelector('#marker-button');

				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();
				expect(store.getState().draw.reset).toBeTruthy();
				expect(store.getState().draw.type).toBe('marker');
			});

			it('deactivates last tool, when activate another', async () => {
				const element = await setup();

				const lastButton = element.shadowRoot.querySelector('#marker-button');
				lastButton.click();

				const toolButton = element.shadowRoot.querySelector('#line-button');
				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();
				expect(lastButton.classList.contains('is-active')).toBeFalse();
			});

			it('toggles a tool', async () => {
				const element = await setup();
				const toolButton = element.shadowRoot.querySelector('#line-button');

				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();

				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeFalse();
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

			it('resets the measurement', async () => {
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

			it('deletes the last drawn point of drawing', async () => {
				const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
				const undoIcon = element.shadowRoot.querySelector('#undo_icon');

				undoIcon.click();
				expect(undoIcon.title).toBe('iframe_drawTool_delete_point');
				expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
			});
		});
	});
});
