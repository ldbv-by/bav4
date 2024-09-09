/* eslint-disable no-undef */
import { TimeTravel } from '../../../../src/modules/timeTravel/components/TimeTravel.js';
import { $injector } from '../../../../src/injection/index.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(TimeTravel.tag, TimeTravel);

describe('TimeTravel', () => {
	const Initial_Value = 1900;
	const Min = 1900;
	const Max = 1999;
	const Time_Travel_Data = Object.freeze([
		{
			json_featuretype: 'metamap',
			bezeichnung: 'Karte des Deutschen Reiches 1:100000',
			years: '1900,1902,1903,1921',
			zoomlevel: 8
		},

		{
			json_featuretype: 'metamap',
			bezeichnung: 'Deutsche Karte 1:50000',
			years: '1921,1923,1924,1927,1937,1939,1940,1949,1951',
			zoomlevel: 9
		}
	]);
	const extent = [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462];
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {},
		getDefaultMapExtent: () => {
			return extent;
		}
	};
	const Time_Interval = 1000;

	const setup = (state = {}, config = {}) => {
		const { embed = false, min = Min, max = Max, initialValue = Initial_Value, timeTravelData = Time_Travel_Data } = config;
		// state of store
		const initialState = {
			media: {
				portrait: true
			},
			...state
		};
		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TimeTravelService', {
				all: () => timeTravelData,
				getInitialValue: () => initialValue,
				getMin: () => min,
				getMax: () => max
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.renderAndLogLifecycle(TimeTravel.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new TimeTravel();

			expect(element.getModel()).toEqual({
				data: null,
				activeYear: null,
				min: null,
				max: null,
				isPortrait: false
			});
		});
	});

	describe('when instantiated', () => {
		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders a time travel component', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header').textContent).toBe('timeTravel_title');
			expect(element.shadowRoot.querySelectorAll('.data.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.row')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.title')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.title')[0].title).toBe('timeTravel_map_series');
			expect(element.shadowRoot.querySelectorAll('.title')[0].textContent).toBe(Time_Travel_Data[0].bezeichnung);
			expect(element.shadowRoot.querySelectorAll('.item')).toHaveSize((Max + 1 - Min) * Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.item.active')).toHaveSize(
				Time_Travel_Data[0].years.split(',').length + Time_Travel_Data[1].years.split(',').length
			);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(Initial_Value.toString());
			// expect(element.shadowRoot.querySelectorAll('.activeItem')[0].title).toBe(Initial_Value.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(Initial_Value.toString());
			// expect(element.shadowRoot.querySelectorAll('.activeItem')[1].title).toBe(Initial_Value.toString());

			expect(element.shadowRoot.querySelectorAll('.item.border')).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('.item.border')[0].getAttribute('data-year')).toBe('1900');
			expect(element.shadowRoot.querySelectorAll('.item.border')[1].getAttribute('data-year')).toBe('1950');
			expect(element.shadowRoot.querySelectorAll('.item.border')[2].getAttribute('data-year')).toBe('1900');
			expect(element.shadowRoot.querySelectorAll('.item.border')[3].getAttribute('data-year')).toBe('1950');

			expect(element.shadowRoot.querySelectorAll('.base')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.actions')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-year-input')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-year-input .bar')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('#yearInput')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('type')).toBe('number');
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('max')).toBe(Max.toString());
			// expect(element.shadowRoot.querySelector('#yearInput').getAttribute('value')).toBe(Initial_Value.toString());

			expect(element.shadowRoot.querySelectorAll('#buttonData')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#increase')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#decrease')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#start')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#stop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#reset')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.slider')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#rangeSlider')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('type')).toBe('range');
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('max')).toBe(Max.toString());
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('step')).toBe('1');
			expect(element.shadowRoot.querySelectorAll('.range-background')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.range-bg')).toHaveSize(Max + 1 - Min);
			expect(element.shadowRoot.querySelectorAll('.range-bg.active')).toHaveSize(
				Time_Travel_Data[0].years.split(',').length + Time_Travel_Data[1].years.split(',').length - 1
			);
			expect(element.shadowRoot.querySelectorAll('.range-bg')[0].getAttribute('data-year')).toBe(Min.toString());
			expect(element.shadowRoot.querySelectorAll('.range-bg.border')).toHaveSize(10);
		});

		it('layouts for portrait mode', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header').textContent).toBe('timeTravel_title');
			expect(element.shadowRoot.querySelectorAll('.data.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.row')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.title')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.title')[0].title).toBe('timeTravel_map_series');
			expect(element.shadowRoot.querySelectorAll('.title')[0].textContent).toBe(Time_Travel_Data[0].bezeichnung);
			expect(element.shadowRoot.querySelectorAll('.item')).toHaveSize((Max + 1 - Min) * Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.item.active')).toHaveSize(
				Time_Travel_Data[0].years.split(',').length + Time_Travel_Data[1].years.split(',').length
			);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(Initial_Value.toString());
			// expect(element.shadowRoot.querySelectorAll('.activeItem')[0].title).toBe(Initial_Value.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(Initial_Value.toString());
			// expect(element.shadowRoot.querySelectorAll('.activeItem')[1].title).toBe(Initial_Value.toString());

			expect(element.shadowRoot.querySelectorAll('.item.border')).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('.item.border')[0].getAttribute('data-year')).toBe('1900');
			expect(element.shadowRoot.querySelectorAll('.item.border')[1].getAttribute('data-year')).toBe('1950');
			expect(element.shadowRoot.querySelectorAll('.item.border')[2].getAttribute('data-year')).toBe('1900');
			expect(element.shadowRoot.querySelectorAll('.item.border')[3].getAttribute('data-year')).toBe('1950');

			expect(element.shadowRoot.querySelectorAll('.base')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.actions')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-year-input')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-year-input .bar')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('#yearInput')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('type')).toBe('number');
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('max')).toBe(Max.toString());
			// expect(element.shadowRoot.querySelector('#yearInput').getAttribute('value')).toBe(Initial_Value.toString());

			expect(element.shadowRoot.querySelectorAll('#buttonData')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#increase')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#decrease')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#start')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#stop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#reset')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.slider')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#rangeSlider')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('type')).toBe('range');
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('max')).toBe(Max.toString());
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('step')).toBe('1');
			expect(element.shadowRoot.querySelectorAll('.range-background')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.range-bg')).toHaveSize(Max + 1 - Min);
			expect(element.shadowRoot.querySelectorAll('.range-bg.active')).toHaveSize(
				Time_Travel_Data[0].years.split(',').length + Time_Travel_Data[1].years.split(',').length - 1
			);
			expect(element.shadowRoot.querySelectorAll('.range-bg')[0].getAttribute('data-year')).toBe(Min.toString());
			expect(element.shadowRoot.querySelectorAll('.range-bg.border')).toHaveSize(10);
		});
	});

	describe('when data button are clicked', () => {
		it('toggle data view', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.data.hide')).toHaveSize(1);

			const buttonElement = element.shadowRoot.querySelector('#buttonData');
			buttonElement.click();

			expect(element.shadowRoot.querySelectorAll('.data.hide')).toHaveSize(0);

			buttonElement.click();

			expect(element.shadowRoot.querySelectorAll('.data.hide')).toHaveSize(1);
		});
	});

	describe('when actions buttons are clicked', () => {
		it('do not decrease Year because min value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().activeYear).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().activeYear).toBe(Initial_Value);
		});

		it('decrease Year', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, { initialValue: 1950 });

			expect(element.getModel().activeYear).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().activeYear).toBe(1949);
		});

		it('do not increase Year because max value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state);

			expect(element.getModel().activeYear).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().activeYear).toBe(Initial_Value);
		});

		it('increase Year', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().activeYear).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().activeYear).toBe(Initial_Value + 1);
		});

		it('start', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, { initialValue: Max - 2 });

			expect(element.getModel().activeYear).toBe(Max - 2);
			const buttonElement = element.shadowRoot.querySelector('#start');
			const stop = element.shadowRoot.getElementById('stop');

			buttonElement.click();
			expect(stop.classList.contains('hide')).toBeFalse();
			expect(buttonElement.classList.contains('hide')).toBeTrue();
			expect(element.getModel().activeYear).toBe(Max - 2);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Max - 1);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Max);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Min);
		});

		it('stop', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().activeYear).toBe(Initial_Value);
			const stop = element.shadowRoot.querySelector('#stop');
			const start = element.shadowRoot.getElementById('start');

			start.click();
			expect(stop.classList.contains('hide')).toBeFalse();
			expect(start.classList.contains('hide')).toBeTrue();

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Initial_Value + 1);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Initial_Value + 2);

			stop.click();
			expect(stop.classList.contains('hide')).toBeTrue();
			expect(start.classList.contains('hide')).toBeFalse();

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Initial_Value + 2);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeYear).toBe(Initial_Value + 2);
		});

		it('reset', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, { initialValue: 1950 });

			expect(element.getModel().activeYear).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#reset');
			const start = element.shadowRoot.getElementById('start');
			const stop = element.shadowRoot.getElementById('stop');

			buttonElement.click();

			expect(element.getModel().activeYear).toBe(Min);

			expect(start.classList.contains('hide')).toBeFalse();
			expect(stop.classList.contains('hide')).toBeTrue();
		});
	});

	describe('when slider change', () => {
		it('set new value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const newValue = 1950;

			expect(element.getModel().activeYear).toBe(Initial_Value);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(Initial_Value.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(Initial_Value.toString());

			const sliderElement = element.shadowRoot.querySelector('#rangeSlider');
			sliderElement.value = newValue;
			sliderElement.dispatchEvent(new Event('input'));

			expect(element.getModel().activeYear).toBe(newValue);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(newValue.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(newValue.toString());
		});
	});

	describe('when input change', () => {
		it('set new value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const newValue = 1985;

			expect(element.getModel().activeYear).toBe(Initial_Value);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(Initial_Value.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(Initial_Value.toString());

			const inputElement = element.shadowRoot.querySelector('#yearInput');
			inputElement.value = newValue;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().activeYear).toBe(newValue);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(newValue.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(newValue.toString());
		});
	});

	describe('when item clicked', () => {
		it('set new value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const newValue = 1923;

			expect(element.getModel().activeYear).toBe(Initial_Value);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(Initial_Value.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(Initial_Value.toString());

			const item = element.shadowRoot.querySelectorAll('.active[data-year="1923"]');
			expect(item).toHaveSize(2);
			item[0].click();

			expect(element.getModel().activeYear).toBe(newValue);
			expect(element.shadowRoot.querySelectorAll('.activeItem')).toHaveSize(Time_Travel_Data.length);
			expect(element.shadowRoot.querySelectorAll('.activeItem')[0].getAttribute('data-year')).toBe(newValue.toString());
			expect(element.shadowRoot.querySelectorAll('.activeItem')[1].getAttribute('data-year')).toBe(newValue.toString());
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
		});

		it('layouts for portrait ', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
		});
	});
});
