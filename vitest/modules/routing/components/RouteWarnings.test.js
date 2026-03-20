import { RouteWarningCriticality } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RouteWarnings } from '../../../../src/modules/routing/components/routeDetails/RouteWarnings';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(RouteWarnings.tag, RouteWarnings);

describe('RouteWarnings', () => {
	let store;
	const setup = (state, properties) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer(),
			routing: routingReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(RouteWarnings.tag, properties);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RouteWarnings().getModel();

			expect(model).toEqual({
				items: [],
				collapsedWarnings: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders element collapsed default', async () => {
			const element = await setup();

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelectorAll('.warnings-selector')).toHaveSize(1);
			expect(containerElement.querySelectorAll('.iscollapsed')).toHaveSize(1);
		});

		it('renders element with warning items', async () => {
			const properties = {
				items: [
					{
						name: 42,
						message: 'foo bar',
						criticality: RouteWarningCriticality.HINT,
						segments: [
							[0, 1],
							[3, 5]
						]
					},
					{
						name: 21,
						message: 'bar baz',
						criticality: RouteWarningCriticality.WARNING,
						segments: [
							[0, 1],
							[3, 5]
						]
					}
				]
			};
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelectorAll('.item')).toHaveSize(2);
			expect(containerElement.querySelectorAll('.highlight')).toHaveSize(2);
			expect(containerElement.querySelectorAll('.geolocation-icon')).toHaveSize(2);
			expect(containerElement.querySelectorAll('.item')[0].innerText.trim()).toBe('foo bar');
			expect(containerElement.querySelectorAll('.item')[1].innerText.trim()).toBe('bar baz');
		});
	});

	describe('when collapsed element is clicked', () => {
		it('expands to complete view', async () => {
			const element = await setup();

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.warnings-selector');
			expect(containerElement.querySelectorAll('.iscollapsed')).toHaveSize(1);
			expect(containerElement.querySelectorAll('.iconexpand')).toHaveSize(0);

			selectorElement.click();

			expect(containerElement.querySelectorAll('.iscollapsed')).toHaveSize(0);
			expect(containerElement.querySelectorAll('.iconexpand')).toHaveSize(1);
		});
	});

	describe('when properties are set', () => {
		it('accepts only item arrays', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({
				items: [],
				collapsedWarnings: false
			});

			element.items = 'foo';

			expect(element.getModel()).toEqual({
				items: [],
				collapsedWarnings: false
			});

			element.items = [
				{
					name: 42,
					message: 'foo bar',
					criticality: RouteWarningCriticality.HINT,
					segments: [
						[0, 1],
						[3, 5]
					]
				},
				{
					name: 21,
					message: 'bar baz',
					criticality: RouteWarningCriticality.WARNING,
					segments: [
						[0, 1],
						[3, 5]
					]
				}
			];
			expect(element.getModel()).toEqual({
				items: [jasmine.any(Object), jasmine.any(Object)],
				collapsedWarnings: false
			});
		});
	});

	describe('when mouse moves over warning item', () => {
		const properties = {
			items: [
				{
					name: 42,
					message: 'foo bar',
					criticality: RouteWarningCriticality.HINT,
					segments: [
						[0, 1],
						[3, 5]
					]
				},
				{
					name: 21,
					message: 'bar baz',
					criticality: RouteWarningCriticality.WARNING,
					segments: [
						[0, 1],
						[3, 5]
					]
				}
			]
		};
		it('highlights the related segments in the map', async () => {
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.warnings-selector');

			selectorElement.click();

			const warningItemElement = containerElement.querySelector('.highlight');

			warningItemElement.dispatchEvent(new Event('mouseover'));
			expect(store.getState().routing.highlightedSegments.payload).toEqual(
				jasmine.objectContaining({
					segments: [
						[0, 1],
						[3, 5]
					],
					zoomToExtent: false
				})
			);
		});

		it('removes the highlighted segments from the map', async () => {
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.warnings-selector');

			selectorElement.click();
			const warningItemElements = containerElement.querySelectorAll('.highlight');

			warningItemElements[0].dispatchEvent(new Event('mouseover'));
			expect(store.getState().routing.highlightedSegments.payload).toEqual(
				jasmine.objectContaining({
					segments: [
						[0, 1],
						[3, 5]
					],
					zoomToExtent: false
				})
			);

			warningItemElements[0].dispatchEvent(new Event('mouseout'));

			expect(store.getState().routing.highlightedSegments.payload).toBeNull();
		});
	});

	describe('when pointerdown occurs on warning item', () => {
		const properties = {
			items: [
				{
					name: 42,
					message: 'foo bar',
					criticality: RouteWarningCriticality.HINT,
					segments: [
						[0, 1],
						[3, 5]
					]
				},
				{
					name: 21,
					message: 'bar baz',
					criticality: RouteWarningCriticality.WARNING,
					segments: [
						[0, 1],
						[3, 5]
					]
				}
			]
		};
		it('highlights the related segments in the map', async () => {
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.warnings-selector');

			selectorElement.click();

			const warningItemElement = containerElement.querySelector('.highlight');

			warningItemElement.dispatchEvent(new PointerEvent('pointerdown'));
			expect(store.getState().routing.highlightedSegments.payload).toEqual(
				jasmine.objectContaining({
					segments: [
						[0, 1],
						[3, 5]
					],
					zoomToExtent: false
				})
			);
		});
	});

	describe('when mouse clicks the geolocation-icon', () => {
		const properties = {
			items: [
				{
					name: 42,
					message: 'foo bar',
					criticality: RouteWarningCriticality.HINT,
					segments: [
						[0, 1],
						[3, 5]
					]
				},
				{
					name: 21,
					message: 'bar baz',
					criticality: RouteWarningCriticality.WARNING,
					segments: [
						[0, 1],
						[3, 5]
					]
				}
			]
		};
		it('highlights the related segments in the map and zooms in', async () => {
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.warnings-selector');

			selectorElement.click();

			const geolocationIconElements = containerElement.querySelectorAll('.geolocation-icon');

			geolocationIconElements[0].click();

			expect(store.getState().routing.highlightedSegments.payload).toEqual(
				jasmine.objectContaining({
					segments: [
						[0, 1],
						[3, 5]
					],
					zoomToExtent: true
				})
			);
		});
	});
});
