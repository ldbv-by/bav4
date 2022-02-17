/* eslint-disable no-undef */

import { ToolContainer } from '../../../../../src/modules/toolbox/components/toolContainer/ToolContainer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { setCurrentTool, ToolId } from '../../../../../src/store/tools/tools.action';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';

window.customElements.define(ToolContainer.tag, ToolContainer);

describe('ToolContainer', () => {
	let store;

	const environmentService = {
		isEmbedded: () => { }
	};

	const setup = async (state = {}) => {

		const initialState = {

			media: {
				portrait: false,
				minWidth: true
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			tools: toolsReducer,
			media: createNoInitialStateMediaReducer()
		});

		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(ToolContainer.tag);
	};

	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new ToolContainer().getModel();

			expect(model).toEqual({
				isPortrait: false,
				hasMinWidth: false,
				toolId: null
			});
		});
	});

	describe('when initialized', () => {

		it('renders nothing when toolId is Null', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders nothing when embedded', async () => {
			spyOn(environmentService, 'isEmbedded').and.returnValue(true);
			const state = {
				tools: {
					current: 'foo'
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('adds a div which holds the container', async () => {
			const state = {
				tools: {
					current: 'foo'
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.tool-container__content.is-open')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#close-icon').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('opens the toolcontainer with draw-content', async () => {
			const state = {
				tools: {
					current: 'foo'
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.tool-container__content.is-open')).toHaveSize(1);
		});

		it('renders the correct content panel', async () => {
			const element = await setup();

			Object.entries(ToolId).forEach(([, value]) => {

				setCurrentTool(value);
				const content = element.shadowRoot.querySelector('.tool-container__content');

				switch (value) {
					case ToolId.MEASURING:
						expect(content.innerHTML.toString().includes(MeasureToolContent.tag)).toBeTrue();
						break;
					case ToolId.DRAWING:
						expect(content.innerHTML.toString().includes(DrawToolContent.tag)).toBeTrue();
						break;
					case ToolId.SHARING:
						expect(content.innerHTML.toString().includes(ShareToolContent.tag)).toBeTrue();
						break;
				}
			});
		});
	});

	describe('responsive layout ', () => {

		it('layouts for landscape desktop', async () => {
			const state = {
				tools: {
					current: 'foo'
				},
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveSize(1);
		});

		it('layouts for landscape tablet', async () => {
			const state = {
				tools: {
					current: 'foo'
				},
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveSize(1);
		});

		it('layouts for portrait desktop', async () => {
			const state = {
				tools: {
					current: 'foo'
				},
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveSize(1);
		});

		it('layouts for portrait tablet', async () => {
			const state = {
				tools: {
					current: 'foo'
				},
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveSize(1);
		});
	});

	describe('when close button clicked', () => {

		it('resets the toolId', async () => {
			const state = {
				tools: {
					current: 'foo'
				}
			};
			const element = await setup(state);

			element.shadowRoot.querySelector('.tool-container__close-button').click();

			expect(store.getState().tools.current).toBeNull();
		});
	});
});
