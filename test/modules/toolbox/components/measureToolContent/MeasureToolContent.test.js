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

		const { embed = false } = config;


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

		store = TestUtils.setupStoreAndDi(state, { measurement: measurementReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.register('UnitsService', MockClass);
		return TestUtils.render(MeasureToolContent.tag);
	};

	describe('when initialized', () => {

		it('builds the tool', async () => {
			const element = await setup();

			expect(element._tool).toBeTruthy();
			// expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('#remove').length).toBe(1);
			expect(element.shadowRoot.querySelectorAll('#startnew').length).toBe(1);
		});

		it('resets the measurement', async () => {
			const state = {
				measurement: {
					active: true,
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
	});
});