/* eslint-disable no-undef */
import { TimeTravel } from '../../../../src/modules/timeTravel/components/TimeTravel.js';
import { $injector } from '../../../../src/injection/index.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(TimeTravel.tag, TimeTravel);

describe('TimeTravel', () => {
	const Initial_Value = 1900;
	const Min = 1900;
	const Max = 1951;

	const extent = [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462];
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {},
		getDefaultMapExtent: () => {
			return extent;
		}
	};

	const geoResourceServiceMock = {
		byId: () => {
			return { hasTimestamps: () => true, timestamps: [1900, 1902, 1903, 1921, 1923, 1924, 1927, 1937, 1939, 1940, 1949, 1951] };
		}
	};
	const Time_Interval = 1000;

	const setup = (state = {}, config = {}, properties = {}) => {
		const { embed = false } = config;
		// state of store
		const initialState = {
			media: {
				portrait: true
			},
			...state
		};
		const props = { ...properties, geoResourceId: properties.geoResourceId ?? 'fooId' };
		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.renderAndLogLifecycle(TimeTravel.tag, props);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new TimeTravel();

			expect(element.getModel()).toEqual({
				timestamps: [],
				activeTimestamp: null,
				isPortrait: false
			});
		});
	});

	describe('when instantiated', () => {
		it('have accessible properties', async () => {
			const element = await setup({}, {}, { timestamp: 1950 });

			expect(element.getModel().activeTimestamp).toEqual(1950);
			expect(element.timestamp).toEqual(1950);

			element.timestamp = 1949;

			expect(element.getModel().activeTimestamp).toEqual(1949);
		});

		it('renders nothing without received timestamps', async () => {
			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('invalidId')
				.and.returnValue({ hasTimestamps: () => false });
			const element = await setup({}, {}, { timestamp: 1940, geoResourceId: 'invalidId' });

			expect(element.shadowRoot.children.length).toBe(0);
		});

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

			expect(element.shadowRoot.querySelectorAll('.base')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.actions')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-year-input')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-year-input .bar')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('#yearInput')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('type')).toBe('number');
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('max')).toBe(Max.toString());

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

			expect(element.shadowRoot.querySelectorAll('#yearInput')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('type')).toBe('number');
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#yearInput').getAttribute('max')).toBe(Max.toString());

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

			expect(element.getModel().activeTimestamp).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().activeTimestamp).toBe(Initial_Value);
		});

		it('decrease Year', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, {}, { timestamp: 1950 });

			expect(element.getModel().activeTimestamp).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().activeTimestamp).toBe(1949);
		});

		it('do not increase Year because max value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {}, { timestamp: Max });

			expect(element.getModel().activeTimestamp).toBe(Max);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().activeTimestamp).toBe(Max);
		});

		it('increase Year', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().activeTimestamp).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().activeTimestamp).toBe(Initial_Value + 1);
		});

		it('start', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, {}, { timestamp: Max - 2 });

			expect(element.getModel().activeTimestamp).toBe(Max - 2);
			const buttonElement = element.shadowRoot.querySelector('#start');
			const stop = element.shadowRoot.getElementById('stop');

			buttonElement.click();
			expect(stop.classList.contains('hide')).toBeFalse();
			expect(buttonElement.classList.contains('hide')).toBeTrue();
			expect(element.getModel().activeTimestamp).toBe(Max - 2);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Max - 1);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Max);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Min);
		});

		it('stop', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().activeTimestamp).toBe(Initial_Value);
			const stop = element.shadowRoot.querySelector('#stop');
			const start = element.shadowRoot.getElementById('start');

			start.click();
			expect(stop.classList.contains('hide')).toBeFalse();
			expect(start.classList.contains('hide')).toBeTrue();

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Initial_Value + 1);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Initial_Value + 2);

			stop.click();
			expect(stop.classList.contains('hide')).toBeTrue();
			expect(start.classList.contains('hide')).toBeFalse();

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Initial_Value + 2);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().activeTimestamp).toBe(Initial_Value + 2);
		});

		it('reset', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, {}, { timestamp: 1950 });

			expect(element.getModel().activeTimestamp).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#reset');
			const start = element.shadowRoot.getElementById('start');
			const stop = element.shadowRoot.getElementById('stop');

			buttonElement.click();

			expect(element.getModel().activeTimestamp).toBe(Min);

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

			expect(element.getModel().activeTimestamp).toBe(Initial_Value);

			const sliderElement = element.shadowRoot.querySelector('#rangeSlider');
			sliderElement.value = newValue;
			sliderElement.dispatchEvent(new Event('input'));

			expect(element.getModel().activeTimestamp).toBe(newValue);
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

			expect(element.getModel().activeTimestamp).toBe(Initial_Value);

			const inputElement = element.shadowRoot.querySelector('#yearInput');
			inputElement.value = newValue;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().activeTimestamp).toBe(newValue);
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
