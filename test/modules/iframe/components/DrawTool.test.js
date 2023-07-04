import { IFrameComponents } from '../../../../src/domain/iframeComponents';
import { QueryParameters } from '../../../../src/domain/queryParameters';
import { $injector } from '../../../../src/injection';
import { DrawTool } from '../../../../src/modules/iframe/components/tools/DrawTool';
import { activate, deactivate } from '../../../../src/store/draw/draw.action';
import { drawReducer } from '../../../../src/store/draw/draw.reducer';
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
		getQueryParams: () => new URLSearchParams()
	};

	const setup = async (drawState = drawDefaultState) => {
		const state = {
			draw: drawState
		};

		store = TestUtils.setupStoreAndDi(state, {
			draw: drawReducer
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
		const drawToolQueryParams = new URLSearchParams(QueryParameters.IFRAME_COMPONENTS + '=' + IFrameComponents.DRAW_TOOL + ',foo,bar');

		beforeEach(() => {
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(drawToolQueryParams);
		});
		it('builds list of tools', async () => {
			const element = await setup();

			expect(element._model.tools).toBeTruthy();
			expect(element._model.tools.length).toBe(2);
		});

		describe('when queryParam for drawTool is set', () => {
			it('shows a label', async () => {
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll('.ba-tool-container__title')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.ba-tool-container__title')[0].innerText).toBe('iframe_drawTool_label');
			});

			it('shows a list of tools', async () => {
				const element = await setup();

				expect(element._model.tools).toBeTruthy();
				expect(element._model.tools.length).toBe(2);

				expect(element.shadowRoot.querySelectorAll('.draw-tool__enable-button')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('#close-icon')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.draw-tool__buttons')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.draw-tool__buttons').childElementCount).toBe(2);
			});

			it('activates and deactivate  the draw tool', async () => {
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

			it('activates the Line draw tool', async () => {
				const element = await setup();
				const toolButton = element.shadowRoot.querySelector('#line-button');
				activate();

				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();
				expect(store.getState().draw.type).toBe('line');
			});

			it('activates the Marker draw tool', async () => {
				const element = await setup();
				const toolButton = element.shadowRoot.querySelector('#marker-button');
				activate();

				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();
				expect(store.getState().draw.type).toBe('marker');
			});

			it('deactivates last tool, when activate another', async () => {
				const element = await setup();
				const lastButton = element.shadowRoot.querySelector('#marker-button');
				activate();

				lastButton.click();

				const toolButton = element.shadowRoot.querySelector('#line-button');
				toolButton.click();

				expect(toolButton.classList.contains('is-active')).toBeTrue();
				expect(lastButton.classList.contains('is-active')).toBeFalse();
			});

			it('toggles the marker tool', async () => {
				const element = await setup();
				const toolButton = element.shadowRoot.querySelector('#marker-button');
				activate();

				toolButton.click();

				expect(store.getState().draw.active).toBeTrue();
				expect(store.getState().draw.type).toBe('marker');

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
