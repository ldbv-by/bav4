/* eslint-disable no-undef */

import { ToolContainer } from '../../../../../src/modules/toolbox/components/toolContainer/ToolContainer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { toolContainerReducer } from '../../../../../src/store/toolContainer/toolContainer.reducer';
import { setContainerContent, toggleToolContainer } from '../../../../../src/store/toolContainer/toolContainer.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { drawReducer } from '../../../../../src/store/draw/draw.reducer';
import { measurementReducer } from '../../../../../src/store/measurement/measurement.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { sharedReducer } from '../../../../../src/store/shared/shared.reducer';

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
			notifications: {
				notification: null
			},
			media: {
				portrait: false,
				minWidth: true
			},
			shared: { termsOfUseAcknowledged: false,
				fileSaveResult: null },
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
			draw: drawReducer,
			notifications: notificationReducer,
			media: createNoInitialStateMediaReducer(),
			shared: sharedReducer
		});

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				isTouch: () => false,
				getWindow: () => windowMock,
				isStandalone: () => false
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UrlService', urlServiceMock)
			.registerSingleton('IconsService', { all: () => [] })
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

		it('deactivates measurement, when contentTool is closing', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeFalsy();
			setContainerContent('ba-tool-measure-content');
			toggleToolContainer();
			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector(MeasureToolContent.tag)).toBeTruthy();
			expect(store.getState().measurement.active).toBeTrue();

			const closeButton = element.shadowRoot.querySelector('.tool-container__close-button');

			closeButton.click();

			expect(store.getState().measurement.active).toBeFalse();
		});


		it('deactivates draw, when contentTool is closing', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeFalsy();
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();
			expect(element.shadowRoot.querySelector('.tool-container__content.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector(DrawToolContent.tag)).toBeTruthy();
			expect(store.getState().draw.active).toBeTrue();

			const closeButton = element.shadowRoot.querySelector('.tool-container__close-button');

			closeButton.click();

			expect(store.getState().draw.active).toBeFalse();
		});

		it('prevent switching from one tool to other, if toolcontent is open', async () => {
			const element = await setup();

			setContainerContent('ba-tool-measure-content');
			toggleToolContainer();// now is open
			expect(store.getState().measurement.active).toBeTrue();
			setContainerContent('ba-tool-draw-content');

			expect(store.getState().measurement.active).toBeTrue();
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_prevent_switching_tool');
			expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.WARN);
			expect(element.shadowRoot.querySelector(MeasureToolContent.tag)).toBeTruthy();
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
