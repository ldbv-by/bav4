/* eslint-disable no-undef */
import { TIMESPAN_DEBOUNCE_DELAY, TimeTravelSlider } from '../../../../src/modules/timeTravel/components/TimeTravelSlider.js';
import { $injector } from '../../../../src/injection/index.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';
import { TestUtils } from '../../../test-utils.js';
import { timeTravelReducer } from '../../../../src/store/timeTravel/timeTravel.reducer.js';
import { setCurrentTimestamp } from '../../../../src/store/timeTravel/timeTravel.action.js';

window.customElements.define(TimeTravelSlider.tag, TimeTravelSlider);

describe('TimeTravel', () => {
	const Initial_Value = '1900';
	const Initial_Number = 1900;
	const Min_Number = 1900;
	const Min_Value = '1900';
	const Max_Number = 1951;
	const Max_Value = '1951';

	const extent = [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462];
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {},
		getDefaultMapExtent: () => {
			return extent;
		}
	};
	let store = null;
	const geoResourceServiceMock = {
		byId: () => {
			return {
				hasTimestamps: () => true,
				timestamps: ['1900', '1902', '1903', '1921', '1923', '1924', '1927', '1937', '1939', '1940', '1949', '1951']
			};
		}
	};

	const setup = (state = {}, properties = {}) => {
		// state of store
		const initialState = {
			media: {
				portrait: true
			},
			timeTravel: { timestamp: null, active: null },
			...state
		};
		const props = { ...properties, geoResourceId: properties.geoResourceId ?? 'fooId' };
		store = TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer(),
			timeTravel: timeTravelReducer
		});
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(TimeTravelSlider.tag, props);
	};

	describe('class', () => {
		it('static constants', async () => {
			expect(TimeTravelSlider.TIME_INTERVAL_MS).toBe(2000);
		});
	});
	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new TimeTravelSlider();

			expect(element.getModel()).toEqual({
				timestamps: [],
				timestamp: null,
				isPortrait: false,
				isPlaying: false
			});
		});
	});

	describe('when instantiated', () => {
		it('has accessible properties', async () => {
			const element = await setup({}, { timestamp: '1950' });

			expect(element.getModel().timestamp).toEqual(1950);
			expect(element.timestamp).toEqual(1950);

			element.timestamp = '1949';

			expect(element.getModel().timestamp).toEqual(1949);
		});

		it('renders nothing without received timestamps', async () => {
			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('invalidId')
				.and.returnValue({ hasTimestamps: () => false });
			const element = await setup({}, { timestamp: '1940', geoResourceId: 'invalidId' });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders a time travel slider', async () => {
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
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('min')).toBe(Min_Value);
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('max')).toBe(Max_Value);

			expect(element.shadowRoot.querySelectorAll('#increase')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#decrease')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#start')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#stop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#reset')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.slider')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#rangeSlider')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('type')).toBe('range');
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('min')).toBe(Min_Value);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('max')).toBe(Max_Value);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('step')).toBe('1');
			expect(element.shadowRoot.querySelectorAll('.range-background')).toHaveSize(1);
		});

		it('renders a time travel slider with custom decadeFunction', async () => {
			const element = await setup({}, { timestamp: '1950' });

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(6); // 1900[1]-10[2]-20[3]-30[4]-40[5]-50[6]-1951
			expect(element.getModel().timestamp).toEqual(1950);

			element.decadeFunction = () => false;
			element.timestamp = '1949';

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(0);
		});

		it('accepts only functions as custom decadeFunction', async () => {
			const element = await setup({}, { timestamp: '1950' });

			expect(element.shadowRoot.querySelectorAll('span.range-bg.border')).toHaveSize(6); // 1900[1]-10[2]-20[3]-30[4]-40[5]-50[6]-1951
			expect(element.getModel().timestamp).toEqual(1950);

			element.decadeFunction = 'foo';
			element.timestamp = '1949';

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
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('min')).toBe(Min_Value);
			expect(element.shadowRoot.querySelector('#timestampInput').getAttribute('max')).toBe(Max_Value);

			expect(element.shadowRoot.querySelectorAll('#increase')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#decrease')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#start')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#stop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#reset')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.slider')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#rangeSlider')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('type')).toBe('range');
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('min')).toBe(Min_Value);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('max')).toBe(Max_Value);
			expect(element.shadowRoot.querySelector('#rangeSlider').getAttribute('step')).toBe('1');
			expect(element.shadowRoot.querySelectorAll('.range-background')).toHaveSize(1);
		});

		it('observes the timestamp from the s-o-s timeTravel', async () => {
			const element = await setup({}, { timestamp: '1950' });

			expect(element.getModel().timestamp).toEqual(1950);
			expect(element.timestamp).toEqual(1950);

			setCurrentTimestamp('1949');

			expect(element.getModel().timestamp).toEqual(1949);
		});

		it('updates the timestamp value in the s-o-s timeTravel', async () => {
			const state = {
				media: {
					portrait: false
				},
				timeTravel: { timestamp: Initial_Value }
			};

			const element = await setup(state);
			const newValue = '1949';
			const newValueNumber = 1949;

			expect(element.getModel().timestamp).toBe(Initial_Number);
			expect(store.getState().timeTravel.timestamp).toBe(Initial_Value);

			const inputElement = element.shadowRoot.querySelector('#timestampInput');
			inputElement.value = newValue;
			inputElement.dispatchEvent(new Event('change'));

			await TestUtils.timeout(TIMESPAN_DEBOUNCE_DELAY + 100);

			expect(element.getModel().timestamp).toBe(newValueNumber);
			expect(store.getState().timeTravel.timestamp).toBe(newValue);
		});
	});

	describe('when disconnected', () => {
		it('clears the timer', async () => {
			const element = await setup({}, { timestamp: '1950' });
			const spy = spyOn(global, 'clearInterval').and.callThrough();

			element.onDisconnect(); // we have to call onDisconnect manually

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('when actions buttons are clicked', () => {
		it('does NOT decrease timestamp because min value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().timestamp).toBe(Initial_Number);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(Initial_Number);
		});

		it('decreases the timestamp', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state, { timestamp: '1950' });

			expect(element.getModel().timestamp).toBe(1950);
			const buttonElement = element.shadowRoot.querySelector('#decrease');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(1949);
		});

		it('does NOT increase the timestamp because max value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, { timestamp: Max_Value });

			expect(element.getModel().timestamp).toBe(Max_Number);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(Max_Number);
		});

		it('increases Timestamp', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.getModel().timestamp).toBe(Initial_Number);
			const buttonElement = element.shadowRoot.querySelector('#increase');
			buttonElement.click();
			expect(element.getModel().timestamp).toBe(Initial_Number + 1);
		});

		describe('and when slider animation is executing', () => {
			let clock;
			beforeEach(() => {
				clock = jasmine.clock().install();
			});

			afterEach(() => {
				clock.uninstall();
			});

			it('increases the timestamp on start', async () => {
				const state = {
					media: {
						portrait: false
					}
				};

				const element = await setup(state, { timestamp: `${Max_Number - 2}` });

				expect(element.getModel().timestamp).toBe(Max_Number - 2);
				expect(element.shadowRoot.querySelector('#timestampInput').disabled).toBeFalse();
				const buttonElement = element.shadowRoot.querySelector('#start');
				const stop = element.shadowRoot.getElementById('stop');

				buttonElement.click();
				expect(stop.classList.contains('hide')).toBeFalse();
				expect(buttonElement.classList.contains('hide')).toBeTrue();
				expect(element.shadowRoot.querySelector('#timestampInput').disabled).toBeTrue();
				expect(element.getModel().timestamp).toBe(Max_Number - 2);

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Max_Number - 1);

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Max_Number);

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Min_Number);
			});

			it('does NOT increase the timestamps on stop', async () => {
				const state = {
					media: {
						portrait: false
					}
				};

				const element = await setup(state);

				expect(element.getModel().timestamp).toBe(Initial_Number);
				expect(element.shadowRoot.querySelector('#timestampInput').disabled).toBeFalse();
				const stop = element.shadowRoot.querySelector('#stop');
				const start = element.shadowRoot.getElementById('start');

				start.click();
				expect(stop.classList.contains('hide')).toBeFalse();
				expect(start.classList.contains('hide')).toBeTrue();
				expect(element.shadowRoot.querySelector('#timestampInput').disabled).toBeTrue();

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Initial_Number + 1);

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Initial_Number + 2);

				stop.click();
				expect(stop.classList.contains('hide')).toBeTrue();
				expect(start.classList.contains('hide')).toBeFalse();
				expect(element.shadowRoot.querySelector('#timestampInput').disabled).toBeFalse();

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Initial_Number + 2);

				clock.tick(TimeTravelSlider.TIME_INTERVAL_MS);

				expect(element.getModel().timestamp).toBe(Initial_Number + 2);
			});
		});

		describe('reset button is clicked', () => {
			it('resets the slider', async () => {
				const state = {
					media: {
						portrait: false
					}
				};

				const element = await setup(state, { timestamp: '1950' });

				expect(element.getModel().timestamp).toBe(1950);
				const buttonElement = element.shadowRoot.querySelector('#reset');
				const start = element.shadowRoot.getElementById('start');
				const stop = element.shadowRoot.getElementById('stop');

				buttonElement.click();

				expect(element.getModel().timestamp).toBe(Min_Number);

				expect(start.classList.contains('hide')).toBeFalse();
				expect(stop.classList.contains('hide')).toBeTrue();
			});
		});
	});

	describe('when slider change', () => {
		it('sets the new value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const newValue = '1950';

			expect(element.getModel().timestamp).toBe(Initial_Number);

			const sliderElement = element.shadowRoot.querySelector('#rangeSlider');
			sliderElement.value = newValue;
			sliderElement.dispatchEvent(new Event('input'));

			expect(element.getModel().timestamp).toBe(parseInt(newValue));
		});

		it('sets the new value in the timetravel s-o-s in a debounced manner', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const timeTravelSpy = spyOn(element, '_setTimestamp').and.callFake(() => {});

			expect(element.getModel().timestamp).toBe(Initial_Number);

			const sliderElement = element.shadowRoot.querySelector('#rangeSlider');

			sliderElement.value = '1950';
			sliderElement.dispatchEvent(new Event('input'));
			sliderElement.dispatchEvent(new Event('input'));
			sliderElement.dispatchEvent(new Event('input'));
			sliderElement.dispatchEvent(new Event('input'));

			await TestUtils.timeout(TIMESPAN_DEBOUNCE_DELAY + 100);

			expect(timeTravelSpy).toHaveBeenCalledTimes(1);

			sliderElement.value = '1949';
			sliderElement.dispatchEvent(new Event('input'));
			sliderElement.dispatchEvent(new Event('input'));
			sliderElement.dispatchEvent(new Event('input'));
			sliderElement.dispatchEvent(new Event('input'));

			await TestUtils.timeout(TIMESPAN_DEBOUNCE_DELAY + 100);

			expect(timeTravelSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('when input change', () => {
		it('sets the new value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const newValue = '1949';

			expect(element.getModel().timestamp).toBe(Initial_Number);

			const inputElement = element.shadowRoot.querySelector('#timestampInput');
			inputElement.value = newValue;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().timestamp).toBe(parseInt(newValue));
		});

		it('does NOT set an invalid value', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const newValue = 'foo';

			expect(element.getModel().timestamp).toBe(Initial_Number);

			const inputElement = element.shadowRoot.querySelector('#timestampInput');
			inputElement.value = newValue;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().timestamp).toBe(Initial_Number);
		});

		it('does NOT set a value out of min/max range', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			const underMinValue = Min_Number - 100;
			const overMaxValue = Max_Number + 100;
			expect(element.getModel().timestamp).toBe(Initial_Number);

			const inputElement = element.shadowRoot.querySelector('#timestampInput');
			inputElement.value = `${underMinValue}`;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().timestamp).toBe(Min_Number);

			inputElement.value = `${overMaxValue}`;
			inputElement.dispatchEvent(new Event('change'));

			expect(element.getModel().timestamp).toBe(Max_Number);
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
