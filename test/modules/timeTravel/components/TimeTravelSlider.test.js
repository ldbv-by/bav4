/* eslint-disable no-undef */
import { TimeTravelSlider } from '../../../../src/modules/timeTravel/components/TimeTravelSlider.js';
import { $injector } from '../../../../src/injection/index.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';
import { TestUtils } from '../../../test-utils.js';
import { timeTravelReducer } from '../../../../src/store/timeTravel/timeTravel.reducer.js';
import { setCurrentTimestamp } from '../../../../src/store/timeTravel/timeTravel.action.js';

window.customElements.define(TimeTravelSlider.tag, TimeTravelSlider);

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
			media: createNoInitialStateMediaReducer(),
			timeTravel: timeTravelReducer
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(TimeTravelSlider.tag, props);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new TimeTravelSlider();

			expect(element.getModel()).toEqual({
				timestamps: [],
				timestamp: null,
				isPortrait: false
			});
		});
	});

	describe('when instantiated', () => {
		it('have accessible properties', async () => {
			const element = await setup({}, {}, { timestamp: 1950 });

			expect(element.getModel().timestamp).toEqual(1950);
			expect(element.timestamp).toEqual(1950);

			element.timestamp = 1949;

			expect(element.getModel().timestamp).toEqual(1949);
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
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-timestamp-input')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-form-element.active-timestamp-input .bar')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('#timestampInput')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('type')).toBe('number');
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('max')).toBe(Max.toString());

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

		it('renders a time travel component with custom decadeFunction', async () => {
			const element = await setup({}, {}, { timestamp: 1950 });

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(6); // 1900[1]-10[2]-20[3]-30[4]-40[5]-50[6]-1951
			expect(element.getModel().timestamp).toEqual(1950);

			element.decadeFunction = () => false;
			element.timestamp = 1949;

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(0);
		});

		it('accepts only functions as custom decadeFunction', async () => {
			const element = await setup({}, {}, { timestamp: 1950 });

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(6); // 1900[1]-10[2]-20[3]-30[4]-40[5]-50[6]-1951
			expect(element.getModel().timestamp).toEqual(1950);

			element.decadeFunction = 'foo';
			element.timestamp = 1949;

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(6);
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

			expect(element.shadowRoot.querySelectorAll('#timestampInput')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('type')).toBe('number');
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('min')).toBe(Min.toString());
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('max')).toBe(Max.toString());

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

		it('observes timestamp from s-o-s timeTravel', async () => {
			const element = await setup({}, {}, { timestamp: 1950 });

			expect(element.getModel().timestamp).toEqual(1950);
			expect(element.timestamp).toEqual(1950);

			setCurrentTimestamp(1949);

			expect(element.getModel().timestamp).toEqual(1949);
		});
	});

	describe('when actions buttons are clicked', () => {
		it('do not decrease Timestamp because min value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().timestamp).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(Initial_Value);
		});

		it('decrease Timestamp', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, {}, { timestamp: 1950 });

			expect(element.getModel().timestamp).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(1949);
		});

		it('do not increase Timestamp because max value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {}, { timestamp: Max });

			expect(element.getModel().timestamp).toBe(Max);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(Max);
		});

		it('increase Timestamp', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().timestamp).toBe(Initial_Value);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(Initial_Value + 1);
		});

		it('start', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, {}, { timestamp: Max - 2 });

			expect(element.getModel().timestamp).toBe(Max - 2);
			const buttonElement = element.shadowRoot.querySelector('#start');
			const stop = element.shadowRoot.getElementById('stop');

			buttonElement.click();
			expect(stop.classList.contains('hide')).toBeFalse();
			expect(buttonElement.classList.contains('hide')).toBeTrue();
			expect(element.getModel().timestamp).toBe(Max - 2);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Max - 1);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Max);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Min);
		});

		it('stop', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().timestamp).toBe(Initial_Value);
			const stop = element.shadowRoot.querySelector('#stop');
			const start = element.shadowRoot.getElementById('start');

			start.click();
			expect(stop.classList.contains('hide')).toBeFalse();
			expect(start.classList.contains('hide')).toBeTrue();

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Initial_Value + 1);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Initial_Value + 2);

			stop.click();
			expect(stop.classList.contains('hide')).toBeTrue();
			expect(start.classList.contains('hide')).toBeFalse();

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Initial_Value + 2);

			await TestUtils.timeout(Time_Interval);

			expect(element.getModel().timestamp).toBe(Initial_Value + 2);
		});

		it('reset', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, {}, { timestamp: 1950 });

			expect(element.getModel().timestamp).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#reset');
			const start = element.shadowRoot.getElementById('start');
			const stop = element.shadowRoot.getElementById('stop');

			buttonElement.click();

			expect(element.getModel().timestamp).toBe(Min);

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

			expect(element.getModel().timestamp).toBe(Initial_Value);

			const sliderElement = element.shadowRoot.querySelector('#rangeSlider');
			sliderElement.value = newValue;
			sliderElement.dispatchEvent(new Event('input'));

			expect(element.getModel().timestamp).toBe(newValue);
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

			expect(element.getModel().timestamp).toBe(Initial_Value);

			const inputElement = element.shadowRoot.querySelector('#timestampInput');
			inputElement.value = newValue;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().timestamp).toBe(newValue);
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
