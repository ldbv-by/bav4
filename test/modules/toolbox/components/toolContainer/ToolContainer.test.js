/* eslint-disable no-undef */

import { ToolContainer } from '../../../../../src/modules/toolbox/components/toolContainer/ToolContainer';
import { toolContainerReducer } from '../../../../../src/modules/toolbox/store/toolContainer.reducer';
import { measurementReducer } from '../../../../../src/modules/map/store/measurement.reducer';
import { setContainerContent, toggleToolContainer } from '../../../../../src/modules/toolbox/store/toolContainer.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';

window.customElements.define(ToolContainer.tag, ToolContainer);
window.customElements.define(DrawToolContent.tag, DrawToolContent);
window.customElements.define(MeasureToolContent.tag, MeasureToolContent);

describe('ToolContainer', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const setup = async (config = {}) => {

		const { embed = false,
			measurement = {
				active: false,
				mode: 'active',
				statistic: { length: 0, area: 0 },
				reset: null,
				finish: null,
				remove: null
			},
			toolContainer = {
				open: false,
				contentId: false
			} } = config;

		const state = {
			toolContainer: toolContainer,
			measurement: measurement
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

		store = TestUtils.setupStoreAndDi(state, { toolContainer: toolContainerReducer, measurement: measurementReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => false
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } })
			.register('UnitsService', MockClass);
		return TestUtils.render(ToolContainer.tag);
	};


	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

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

		it('activates measurement, only when contentTool is open', async () => {
			const config = {
				toolContainer: {
					open: false,
					contentId: 'ba-tool-measure-content'
				}
			};
			await setup(config);

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
			const element = await setup({ embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});


	});

	describe('responsive layout ', () => {

		it('layouts for landscape desktop', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for landscape tablet', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait desktop', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait tablet', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			setContainerContent('ba-tool-draw-content');
			toggleToolContainer();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__content')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});
});
