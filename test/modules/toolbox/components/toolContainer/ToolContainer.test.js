/* eslint-disable no-undef */

import { ToolContainer } from '../../../../../src/modules/toolbox/components/toolContainer/ToolContainer';
import { toolContainerReducer } from '../../../../../src/modules/toolbox/store/toolContainer.reducer';
import { measurementReducer } from '../../../../../src/modules/map/store/measurement.reducer';
import { setContainerContent, toggleToolContainer } from '../../../../../src/modules/toolbox/store/toolContainer.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';

window.customElements.define(ToolContainer.tag, ToolContainer);
window.customElements.define(DrawToolContent.tag, DrawToolContent);
window.customElements.define(MeasureToolContent.tag, MeasureToolContent);
window.customElements.define(ShareToolContent.tag, ShareToolContent);

describe('ToolContainer', () => {
	let store;

	const setup = async (state = {}, config = {}) => {
		const { embed = false, windowMock = { navigator: {}, open() { } } } = config;


		const initialState = {
			measurement: {
				active: false,
				mode: 'active',
				statistic: { length: 0, area: 0 },
				reset: null,
				finish: null,
				remove: null
			},
			toolContainer: {
				open: false,
				contentId: false
			},
			media: {
				portrait: false,
				minWidth: true
			},
			...state
		};

		const shareServiceMock = {
			copyToClipboard() {
				return Promise.resolve();
			}
		};
		const urlServiceMock = {
			shorten() {
				return Promise.resolve('http://shorten.foo');
			}
		};
		class MockClass {
			constructor() {
				this.get = 'I\'m a UnitsService.';
			}

			formatDistance(distance, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(distance) + 'm';
			}

			formatArea(area, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(area) + 'm²';
			}
		}

		store = TestUtils.setupStoreAndDi(initialState, {
			toolContainer: toolContainerReducer,
			measurement: measurementReducer,
			media: createNoInitialStateMediaReducer()
		});

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				isTouch: () => false,
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UrlService', urlServiceMock)
			.register('UnitsService', MockClass);
		return TestUtils.render(ToolContainer.tag);
	};


	describe('when initialized', () => {

		it('adds a div which holds the container', async () => {
			const element = await setup();

			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
		});

		it('opens the toolcontainer with draw-content', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeFalsy();
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();
			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector(DrawToolContent.tag)).toBeTruthy();
		});

		it('opens the toolcontainer with measure-content', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeFalsy();
			setContainerContent('ba-tool-measure-content');
			toggleToolContainer();
			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector(MeasureToolContent.tag)).toBeTruthy();
		});

		it('opens the toolcontainer with share-content', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeFalsy();
			setContainerContent('ba-tool-share-content');
			toggleToolContainer();
			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector(ShareToolContent.tag)).toBeTruthy();
		});

		it('activates measurement, only when contentTool is open', async () => {
			const state = {
				toolContainer: {
					open: false,
					contentId: 'ba-tool-measure-content'
				}
			};
			await setup(state);

			expect(store.getState().measurement.active).toBeFalse();
		});

		it('deactivates measurement, when tool-content is switching from measure-tool-content', async () => {
			const element = await setup();

			setContainerContent('ba-tool-measure-content');
			toggleToolContainer();
			expect(store.getState().measurement.active).toBeTrue();
			setContainerContent('ba-tool-draw-content');

			expect(store.getState().measurement.active).toBeFalse();
			expect(element.shadowRoot.querySelector(DrawToolContent.tag)).toBeTruthy();
		});


		it('renders nothing when contentId is false', async () => {
			const element = await setup();

			toggleToolContainer();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders nothing when embedded', async () => {
			const state = {
				toolContainer: {
					open: false,
					contentId: 'ba-tool-measure-content'
				}
			};
			const element = await setup(state, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});


	});

	describe('responsive layout ', () => {

		it('layouts for landscape desktop', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
		});

		it('layouts for landscape tablet', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
		});

		it('layouts for portrait desktop', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
		});

		it('layouts for portrait tablet', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
		});
	});
});
