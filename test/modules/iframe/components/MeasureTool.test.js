import { $injector } from '../../../../src/injection';
import { MeasureTool } from '../../../../src/modules/iframe/components/tools/MeasureTool';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';
import { toolsReducer } from '../../../../src/store/tools/tools.reducer';
import { TestUtils } from '../../../test-utils';
import { isString } from '../../../../src/utils/checks';
import { EventLike } from '../../../../src/utils/storeUtils';
import { activate, deactivate } from '../../../../src/store/measurement/measurement.action';

window.customElements.define(MeasureTool.tag, MeasureTool);

const Default_Statistic = { length: null, area: null };

describe('MeasureTool', () => {
	let store;

	const windowMock = {
		matchMedia() {}
	};

	const setup = async (state, config = {}) => {
		const { embed = false, isTouch = false } = config;

		const initialState = {
			measurement: {
				active: true,
				statistic: { length: null, area: null },
				displayRuler: true,
				mode: null,
				reset: null,
				remove: null
			},
			shared: {
				termsOfUseAcknowledged: false
			},
			...state
		};

		class MockClass {
			constructor() {
				this.get = "I'm a UnitsService.";
			}

			formatDistance(distance, decimals) {
				if (isString(distance)) {
					return { value: distance, localizedValue: `localized_${distance}`, unit: '?' };
				}
				return {
					value: distance,
					localizedValue: `localized_${new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(distance)}`,
					unit: 'm'
				};
			}

			formatArea(area, decimals) {
				return {
					value: area,
					localizedValue: `localized_${new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(area)}`,
					unit: 'm²'
				};
			}

			formatAngle(angle, decimals) {
				return {
					value: angle,
					localizedValue: `localized_${new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(angle)}`,
					unit: '°'
				};
			}
		}

		store = TestUtils.setupStoreAndDi(initialState, {
			measurement: measurementReducer,
			tools: toolsReducer
		});

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.register('UnitsService', MockClass);
		return TestUtils.render(MeasureTool.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new MeasureTool().getModel();

			expect(model).toEqual({
				active: false,
				mode: null,
				validGeometry: null,
				statistic: Default_Statistic
			});
		});
	});

	describe('when initialized', () => {
		it('displays the activate measure button', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.measure-tool__enable-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.measure-tool__enable-button').label).toBe('iframe_measureTool_enable');
			expect(element.shadowRoot.querySelector('.measure-tool__enable-button').title).toBe('iframe_measureTool_enable_title');
			expect(element.shadowRoot.querySelector('.measure-tool__enable-button').type).toBe('primary');
		});

		it('activate the measurement mode', async () => {
			const state = {
				measurement: {
					active: false
				}
			};

			const element = await setup(state);
			const activateMeasureButton = element.shadowRoot.querySelector('.measure-tool__enable-button');

			expect(store.getState().measurement.active).toBe(false);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable').length).toBe(1);

			activateMeasureButton.click();

			expect(store.getState().measurement.active).toBe(true);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable').length).toBe(1);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable').length).toBe(0);
		});

		it('displays the deactivate measure button', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#close-icon')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#close-icon').title).toBe('iframe_measureTool_disable');
			expect(element.shadowRoot.querySelector('#close-icon').size).toBe(1.6);
			expect(element.shadowRoot.querySelector('#close-icon').color_hover).toBe('var(--text2)');
		});

		it('deactivate the measurement mode', async () => {
			const element = await setup();
			const closeButton = element.shadowRoot.querySelector('#close-icon');

			expect(store.getState().measurement.active).toBe(true);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable').length).toBe(1);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable').length).toBe(0);

			closeButton.click();

			expect(store.getState().measurement.active).toBe(false);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable').length).toBe(1);
		});

		it('displays the finish-button', async () => {
			const state = {
				measurement: {
					active: true,
					mode: 'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish: null
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish').label).toBe('iframe_measureTool_finish');
			expect(element.shadowRoot.querySelector('#finish').title).toBe('iframe_measureTool_finish_title');
		});

		it('finishes the measurement', async () => {
			const state = {
				measurement: {
					active: true,
					mode: 'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish: null
				}
			};
			const element = await setup(state);
			const finishButton = element.shadowRoot.querySelector('#finish');

			finishButton.click();

			expect(store.getState().measurement.finish).toBeInstanceOf(EventLike);
		});

		it('finishes the measurement', async () => {
			const state = {
				measurement: {
					active: true,
					mode: 'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish: null
				}
			};
			const element = await setup(state);
			const finishButton = element.shadowRoot.querySelector('#finish');

			finishButton.click();

			expect(store.getState().measurement.finish).toBeInstanceOf(EventLike);
		});

		it('resets the measurement', async () => {
			const state = {
				measurement: {
					mode: 'draw',
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const resetButton = element.shadowRoot.querySelector('#startnew');

			resetButton.click();
			expect(resetButton.label).toBe('iframe_measureTool_start_new');
			expect(resetButton.title).toBe('iframe_measureTool_start_new_title');
			expect(store.getState().measurement.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected measurement', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
					mode: 'modify'
				}
			};
			const element = await setup(state);
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();
			expect(removeButton.label).toBe('iframe_measureTool_delete_measure');
			expect(removeButton.title).toBe('');
			expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
		});

		it('deletes the last drawn point of measurement', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 3 },
					mode: 'draw',
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();
			expect(removeButton.label).toBe('iframe_measureTool_delete_point');
			expect(removeButton.title).toBe('');
			expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
		});

		it('shows the measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const labelWithUnitSpans = element.shadowRoot.querySelectorAll('.prime-text-label');

			expect(valueSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('localized_42');
			expect(labelWithUnitSpans[0].textContent.trim()).toBe('iframe_measureTool_stats_length (m):');
			expect(valueSpans[1].textContent).toBe('localized_0');
			expect(labelWithUnitSpans[1].textContent.trim()).toBe('iframe_measureTool_stats_area (m²):');
		});

		it('shows the empty measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: null,
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const labelWithUnitSpans = element.shadowRoot.querySelectorAll('.prime-text-label');
			const areaElement = element.shadowRoot.querySelector('.is-area');

			expect(valueSpans.length).toBe(2);
			expect(labelWithUnitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('localized_0');
			expect(labelWithUnitSpans[0].textContent.trim()).toBe('iframe_measureTool_stats_length (m):');
			expect(valueSpans[1].textContent).toBe('localized_0');
			expect(labelWithUnitSpans[1].textContent.trim()).toBe('iframe_measureTool_stats_area (m²):');
			expect(areaElement).toBeFalsy();
		});

		it('shows selectable measurement values', async () => {
			// HINT: the existence of the behavior (user select text) is driven by css-classes specified in main.css and mvuElement.css.
			// All elements are not selectable by default, but can be activated with the 'selectable' class.
			const cssClass = 'selectable';
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');

			expect([...valueSpans].every((span) => span.classList.contains(cssClass))).toBeTrue();
		});

		it('shows only the length measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: null },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const labelWithUnitSpans = element.shadowRoot.querySelectorAll('.prime-text-label');
			const areaElement = element.shadowRoot.querySelector('.is-area');

			expect(valueSpans.length).toBe(2);
			expect(labelWithUnitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('localized_42');
			expect(labelWithUnitSpans[0].textContent.trim()).toBe('iframe_measureTool_stats_length (m):');
			expect(areaElement).toBeFalsy();
		});

		it('shows the measurement sub-text', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const subTextElement = element.shadowRoot.querySelector('.sub-text');

			expect(subTextElement).toBeTruthy();
			expect(subTextElement.textContent).toBe('');
		});

		describe('with touch-device', () => {
			const touchConfig = {
				embed: false,
				isTouch: true
			};
			const defaultMeasurementState = {
				mode: null,
				statistic: { length: 42, area: 0 },
				reset: null,
				remove: null
			};

			it('shows the measurement sub-text for mode:active', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'active' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('iframe_measureTool_measure_active');
			});

			it('shows the measurement sub-text for mode:draw', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'draw' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('iframe_measureTool_measure_draw');
			});

			it('shows the measurement sub-text for mode:modify', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'modify' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('iframe_measureTool_measure_modify');
			});

			it('shows the measurement sub-text for mode:select', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'select' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('iframe_measureTool_measure_select');
			});

			it('shows no measurement sub-text for mode:[null]', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: null }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('');
			});
		});
	});

	describe('events', () => {
		it('shows/hides the enable/disable buttons', async () => {
			const state = {
				measurement: {
					active: false
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable')).toHaveSize(1);

			activate();

			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable')).toHaveSize(0);

			deactivate();

			expect(element.shadowRoot.querySelectorAll('.measure-tool__enable')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.measure-tool__disable')).toHaveSize(1);
		});
	});
});
