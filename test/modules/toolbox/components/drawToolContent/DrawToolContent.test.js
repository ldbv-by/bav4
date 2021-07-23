import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { drawReducer } from '../../../../../src/modules/map/store/draw.reducer';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';

window.customElements.define(DrawToolContent.tag, DrawToolContent);

describe('DrawToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};
	const setup = async (config = {}) => {

		const { embed = false } = config;

		const state = {
			toolContainer: {
				open: false,
				contentId: false
			}
		};

		store = TestUtils.setupStoreAndDi(state, { draw: drawReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(DrawToolContent.tag);
	};

	describe('class', () => {

		it('inherits from AbstractToolContent', async () => {

			const element = await setup();

			expect(element instanceof AbstractToolContent).toBeTrue();
		});
	});

	describe('when initialized', () => {

		it('builds list of tools', async () => {
			const element = await setup();

			expect(element._tools).toBeTruthy();
			expect(element._tools.length).toBe(4);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(4);
		});

		it('activates the Line draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveTool').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#line');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Line');
		});

		it('activates the Symbol draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveTool').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#symbol');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Symbol');
		});

		it('activates the Text draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveTool').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#text');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Text');
		});

		it('activates the Polygon draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveTool').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#polygon');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Polygon');
		});

		it('deactivates last tool, when activate another', async () => {
			const element = await setup();
			const lastTool = {
				name: 'polygon',
				active: true,
				activate: jasmine.createSpy()
			};
			element._activeTool = lastTool;
			const lastButton = element.shadowRoot.querySelector('#polygon');
			lastButton.classList.add('is-active');

			const toolButton = element.shadowRoot.querySelector('#line');
			toolButton.click();

			expect(lastTool.active).toBeFalse();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(lastButton.classList.contains('is-active')).toBeFalse();
		});

		it('toggles a tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveTool').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#line');

			toolButton.click();


			expect(toolButton.classList.contains('is-active')).toBeTrue();

			toolButton.click();

			expect(spy).toHaveBeenCalledTimes(2);
			expect(toolButton.classList.contains('is-active')).toBeFalse();
		});
	});
});
