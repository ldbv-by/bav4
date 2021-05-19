import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { measurementReducer } from '../../../../../src/modules/map/store/measurement.reducer';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { EventLike } from '../../../../../src/utils/storeUtils';

window.customElements.define(MeasureToolContent.tag, MeasureToolContent);

describe('MeasureToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const defaultState = {
		measurement: {
			active: true,
			statistic: { length: 0, area: 0 },
			reset: null,
			remove: null,
		}
	};

	const setup = async (state = defaultState, config = {}) => {

		const { embed = false, isTouch = false } = config;


		class MockClass {
			constructor() {
				this.get = 'I\'m a UnitsService.';
			}

			formatDistance(distance, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(distance) + ' m';
			}

			formatArea(area, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(area) + ' m²';
			}
		}

		store = TestUtils.setupStoreAndDi(state, { measurement: measurementReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch:() => isTouch

			}).registerSingleton('TranslationService', { translate: (key) => key })
			.register('UnitsService', MockClass);
		return TestUtils.render(MeasureToolContent.tag);
	};

	describe('when initialized', () => {

		it('builds the tool', async () => {
			const element = await setup();
			expect(element._tool).toBeTruthy();
		});

		it('displays the finish-button', async () => {
			const state = {
				measurement: {
					active: true,
					mode:'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish:null
				}
			};
			const element = await setup(state);			

			expect(element._tool).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();						
		});

		it('finishes the measurement', async () => {
			const state = {
				measurement: {
					active: true,
					mode:'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish:null
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
					active: true,
					mode:'draw',
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const resetButton = element.shadowRoot.querySelector('#startnew');

			resetButton.click();

			expect(store.getState().measurement.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected measurement', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();

			expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
		});

		it('shows the measurement statistics', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const valueSpan = element.shadowRoot.querySelector('.prime-text-value');
			const unitSpan = element.shadowRoot.querySelector('.prime-text-unit');			

			expect(valueSpan).toBeTruthy();
			expect(unitSpan).toBeTruthy();
			expect(valueSpan.textContent).toBe('42');
			expect(unitSpan.textContent).toBe('m');
		});

		it('shows the measurement sub-text', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const subTextElement = element.shadowRoot.querySelector('.sub-text');
			

			expect(subTextElement).toBeTruthy();			
			expect(subTextElement.textContent).toBe('toolbox_drawTool_info');
		});

		describe('with touch-device', () => {
			const touchConfig = { embed:false,
				isTouch:true };
			const defaultMeasurementState = {
				active: true,
				mode:null,
				statistic: { length: 42, area: 0 },
				reset: null,
				remove: null,				
			};
			
			it('shows the measurement sub-text for mode:active', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode:'active' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');					
		
				expect(subTextElement).toBeTruthy();			
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_active');
			});

			it('shows the measurement sub-text for mode:draw', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode:'draw' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');					
		
				expect(subTextElement).toBeTruthy();			
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_draw');
			});

			it('shows the measurement sub-text for mode:modify', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode:'modify' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');					
		
				expect(subTextElement).toBeTruthy();			
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_modify');
			});

			it('shows the measurement sub-text for mode:select', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode:'select' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');					
		
				expect(subTextElement).toBeTruthy();			
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_select');
			});
		});
	});
});