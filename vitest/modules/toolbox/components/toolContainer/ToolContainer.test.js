import { ToolContainer } from '@src/modules/toolbox/components/toolContainer/ToolContainer';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { DrawToolContent } from '@src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '@src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { ShareToolContent } from '@src/modules/toolbox/components/shareToolContent/ShareToolContent';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer';
import { toolsReducer } from '@src/store/tools/tools.reducer';
import { setCurrentTool } from '@src/store/tools/tools.action';
import { TEST_ID_ATTRIBUTE_NAME } from '@src/utils/markup';
import { ExportMfpToolContent } from '@src/modules/toolbox/components/exportMfpToolContent/ExportMfpToolContent';
import { ImportToolContent } from '@src/modules/toolbox/components/importToolContent/ImportToolContent';
import { Tools } from '@src/domain/tools';

window.customElements.define(ToolContainer.tag, ToolContainer);

describe('ToolContainer', () => {
	let store;

	const environmentService = {
		isEmbedded: () => {}
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

		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('TranslationService', { translate: (key) => key });
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
			vi.spyOn(environmentService, 'isEmbedded').mockReturnValue(true);
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

			expect(element.shadowRoot.querySelectorAll('.tool-container__content.is-open')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveLength(1);
			expect(element.shadowRoot.querySelector('#close-icon').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe(true);
		});

		it('opens the toolcontainer with draw-content', async () => {
			const state = {
				tools: {
					current: 'foo'
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.tool-container__content.is-open')).toHaveLength(1);
		});

		it('renders the correct content panel', async () => {
			const element = await setup();

			Object.entries(Tools).forEach(([, value]) => {
				setCurrentTool(value);
				const content = element.shadowRoot.querySelector('.tool-container__content');

				switch (value) {
					case Tools.MEASURE:
						expect(element.shadowRoot.querySelectorAll('.hide')).toHaveLength(0);
						expect(content.innerHTML.toString().includes(MeasureToolContent.tag)).toBe(true);
						break;
					case Tools.DRAW:
						expect(element.shadowRoot.querySelectorAll('.hide')).toHaveLength(0);
						expect(content.innerHTML.toString().includes(DrawToolContent.tag)).toBe(true);
						break;
					case Tools.SHARE:
						expect(element.shadowRoot.querySelectorAll('.hide')).toHaveLength(0);
						expect(content.innerHTML.toString().includes(ShareToolContent.tag)).toBe(true);
						break;
					case Tools.IMPORT:
						expect(element.shadowRoot.querySelectorAll('.hide')).toHaveLength(0);
						expect(content.innerHTML.toString().includes(ImportToolContent.tag)).toBe(true);
						break;
					case Tools.EXPORT:
						expect(element.shadowRoot.querySelectorAll('.hide')).toHaveLength(0);
						expect(content.innerHTML.toString().includes(ExportMfpToolContent.tag)).toBe(true);
						break;
					case Tools.ROUTING:
						expect(element.shadowRoot.querySelectorAll('.hide')).toHaveLength(1);
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

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveLength(1);
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

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveLength(1);
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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveLength(1);
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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.tool-container__content')).toHaveLength(1);
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
