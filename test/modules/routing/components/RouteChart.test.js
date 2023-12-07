import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RouteChart } from '../../../../src/modules/routing/components/routeDetails/RouteChart';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(RouteChart.tag, RouteChart);
describe('RoutingChart', () => {
	const environmentServiceMock = {
		isTouch: () => false
	};
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
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('EnvironmentService', environmentServiceMock);

		return TestUtils.render(RouteChart.tag, properties);
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
			const model = new RouteChart().getModel();

			expect(model).toEqual({
				items: [],
				label: null,
				collapsedChart: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders element collapsed default', async () => {
			const element = await setup();

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelectorAll('.chart-selector')).toHaveSize(1);
			expect(containerElement.querySelectorAll('.iscollapsed')).toHaveSize(1);
		});

		it('renders element with defined label property', async () => {
			const properties = { label: 'foo' };
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelector('.title').innerText).toBe('foo');
		});

		it('renders element with chart section', async () => {
			const properties = {
				label: 'foo',
				items: [
					{
						id: 300,
						color: 'rgb(190,190,190)',
						label: 'baz',
						data: {
							absolute: 18,
							relative: 24,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						name: 'baz_name'
					},
					{
						id: 201,
						color: 'rgb(238,213,183)',
						label: 'bar',
						data: {
							absolute: 57,
							relative: 76,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						name: 'bar_name'
					}
				]
			};
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelectorAll('.chart_section')).toHaveSize(1);
			expect(containerElement.querySelectorAll('.highlight')).toHaveSize(2);
			expect(containerElement.querySelectorAll('.highlight')[0].innerText.replace(/\s/g, '')).toBe('baz:18m');
			expect(containerElement.querySelectorAll('.highlight')[1].innerText.replace(/\s/g, '')).toBe('bar:57m');
			expect(containerElement.querySelector('.title').innerText).toBe('foo');
		});

		it('renders legend with image style', async () => {
			const properties = {
				label: 'foo',
				items: [
					{
						id: 300,
						color: 'transparent',
						image: 'repeating-linear-gradient(45deg,#eee 0px,#eee 7px, #999 8px, #999 10px, #eee 11px)',
						label: 'bar',
						data: {
							absolute: 18,
							relative: 24,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						name: 'bar_name'
					}
				]
			};
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelectorAll('.legend_item')).toHaveSize(1);
			expect(getComputedStyle(containerElement.querySelectorAll('.legend_item')[0]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
			expect(getComputedStyle(containerElement.querySelectorAll('.legend_item')[0]).backgroundImage).toBe(
				'repeating-linear-gradient(45deg, rgb(238, 238, 238) 0px, rgb(238, 238, 238) 7px, rgb(153, 153, 153) 8px, rgb(153, 153, 153) 10px, rgb(238, 238, 238) 11px)'
			);
		});

		it('formats distance values properly', async () => {
			const properties = {
				label: 'foo',
				items: [
					{
						id: 300,
						color: 'red',
						label: 'bar',
						data: {
							absolute: 18,
							relative: 0.4,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						name: 'bar_name'
					},
					{
						id: 300,
						color: 'red',
						label: 'foo',
						data: {
							absolute: 1234,
							relative: 34,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						name: 'foo_name'
					},
					{
						id: 300,
						color: 'blue',
						label: 'baz',
						data: {
							absolute: 5678,
							relative: 56,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						name: 'baz_name'
					}
				]
			};
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');

			expect(containerElement).toBeTruthy();
			expect(containerElement.querySelectorAll('.highlight')[0].innerText.replace(/\s/g, '')).toBe('bar:18m');
			expect(containerElement.querySelectorAll('.highlight')[1].innerText.replace(/\s/g, '')).toBe('foo:1.23km');
			expect(containerElement.querySelectorAll('.highlight')[2].innerText.replace(/\s/g, '')).toBe('baz:6km');
		});
	});

	describe('when collapsed element is clicked', () => {
		it('expands to complete view', async () => {
			const element = await setup();

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.chart-selector');
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
				label: null,
				collapsedChart: false
			});

			element.items = 'foo';

			expect(element.getModel()).toEqual({
				items: [],
				label: null,
				collapsedChart: false
			});

			element.items = [
				{
					id: 300,
					color: 'red',
					label: 'bar',
					data: {
						absolute: 18,
						relative: 0.4,
						segments: [
							[0, 1],
							[3, 4]
						]
					},
					name: 'bar_name'
				}
			];
			expect(element.getModel()).toEqual({
				items: [jasmine.any(Object)],
				label: null,
				collapsedChart: false
			});
		});

		it('accepts only non null label values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({
				items: [],
				label: null,
				collapsedChart: false
			});

			element.label = null;

			expect(element.getModel()).toEqual({
				items: [],
				label: '',
				collapsedChart: false
			});

			element.label = 'foo';
			expect(element.getModel()).toEqual({
				items: [],
				label: 'foo',
				collapsedChart: false
			});
		});
	});

	describe('when mouse moves over legend item', () => {
		const properties = {
			label: 'foo',
			items: [
				{
					id: 300,
					color: 'red',
					label: 'bar',
					data: {
						absolute: 18,
						relative: 0.4,
						segments: [
							[0, 1],
							[3, 4]
						]
					},
					name: 'bar_name'
				},
				{
					id: 300,
					color: 'red',
					label: 'foo',
					data: {
						absolute: 1234,
						relative: 34,
						segments: [
							[0, 1],
							[3, 4]
						]
					},
					name: 'foo_name'
				},
				{
					id: 300,
					color: 'blue',
					label: 'baz',
					data: {
						absolute: 5678,
						relative: 56,
						segments: [
							[0, 1],
							[3, 4]
						]
					},
					name: 'baz_name'
				}
			]
		};
		it('highlights the related segments in the map', async () => {
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.chart-selector');

			selectorElement.click();

			const progressBarElement = containerElement.querySelector('.highlight');

			progressBarElement.dispatchEvent(new Event('mouseover'));
			expect(store.getState().routing.highlightedSegments.payload).toEqual(
				jasmine.objectContaining({
					segments: [
						[0, 1],
						[3, 4]
					],
					zoomToExtent: false
				})
			);
		});

		it('removes the highlighted segments from the map', async () => {
			const element = await setup({}, properties);

			const containerElement = element.shadowRoot.querySelector('.container');
			const selectorElement = containerElement.querySelector('.chart-selector');

			selectorElement.click();
			const progressBarElements = containerElement.querySelectorAll('.highlight');

			progressBarElements[0].dispatchEvent(new Event('mouseover'));
			expect(store.getState().routing.highlightedSegments.payload).toEqual(
				jasmine.objectContaining({
					segments: [
						[0, 1],
						[3, 4]
					],
					zoomToExtent: false
				})
			);

			progressBarElements[0].dispatchEvent(new Event('mouseout'));

			expect(store.getState().routing.highlightedSegments.payload).toBeNull();
		});
	});

	describe('when configure chartjs chart', () => {
		describe('with _getChartConfig', () => {
			const routingChartItems = [
				{ id: 'foo', label: 'Label Foo', data: { absolute: 8200, relative: 84, segments: [] }, color: 'rgb(238,213,183)' },
				{ id: 'bar', label: 'Label Bar', data: { absolute: 4200, relative: 0, segments: [] }, color: 'rgb(123,213,183)' },
				{
					id: 'baz',
					label: 'Label Baz',
					data: { absolute: 21, relative: 0.1, segments: [[4, 5]] },
					image: 'repeating-linear-gradient(45deg,gray 25%, transparent 25%,transparent 50%, gray 50%, gray 55%, transparent 55%, transparent)',
					color: 'rgb(123,321,42)'
				}
			];
			it('creates a chartConfig', async () => {
				const element = await setup({});
				const title = 'FooBar';
				const actualChartConfig = element._getChartConfig(routingChartItems, title);

				expect(actualChartConfig).toEqual(
					jasmine.objectContaining({
						type: 'doughnut',
						data: {
							labels: ['Label Foo', 'Label Bar', 'Label Baz'],
							datasets: [
								{
									label: title,
									data: [84, 0, 1],
									backgroundColor: ['rgb(238,213,183)', 'rgb(123,213,183)', 'rgb(123,321,42)'],
									hoverBorderWidth: 2,
									hoverOffset: 4
								}
							]
						},
						options: {
							onHover: jasmine.any(Function),
							plugins: {
								legend: { display: false },
								tooltip: {
									enabled: true,
									mode: 'nearest',
									callbacks: { label: jasmine.any(Function) }
								}
							},
							borderWidth: 0,
							borderAlign: 'inner',
							cutout: '80%'
						}
					})
				);
			});

			it('creates a chartConfig with a toolTip function', async () => {
				const element = await setup({});
				const title = 'FooBar';
				const actualChartConfig = element._getChartConfig(routingChartItems, title);

				expect(actualChartConfig.options.plugins.tooltip.callbacks.label({ dataIndex: 0 })).toBe('8 km');
				expect(actualChartConfig.options.plugins.tooltip.callbacks.label({ dataIndex: 1 })).toBe('4.20 km');
				expect(actualChartConfig.options.plugins.tooltip.callbacks.label({ dataIndex: 2 })).toBe('21 m');
				expect(store.getState().routing.highlightedSegments.payload.segments).toEqual([[4, 5]]);
			});

			it('creates a chartConfig with a onHover function', async () => {
				const element = await setup({});
				const title = 'FooBar';
				const actualChartConfig = element._getChartConfig(routingChartItems, title);

				expect(actualChartConfig.options.plugins.tooltip.callbacks.label({ dataIndex: 2 })).toBe('21 m');
				expect(store.getState().routing.highlightedSegments.payload.segments).toEqual([[4, 5]]);

				actualChartConfig.options.onHover(new Event('foo'), ['something']);
				expect(store.getState().routing.highlightedSegments.payload.segments).toEqual([[4, 5]]);

				actualChartConfig.options.onHover(new Event('foo'), []);
				expect(store.getState().routing.highlightedSegments.payload).toBeNull();
			});
		});
	});
});
