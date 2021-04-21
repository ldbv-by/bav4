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
	const setup = async (config = {}) => {

		const { embed = false } = config;

		const state = {
			toolContainer: {
				open: false,
				contentId:false
			}
		};
		
		class MockClass {
			constructor() {
				this.get = 'I\'m a UnitsService.';
			}

			formatDistance(distance) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 3 }).format(distance) + 'm';
			}

			formatArea(area) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 3 }).format(area) + 'm²';
			}
		}

		store = TestUtils.setupStoreAndDi(state, { measurement:measurementReducer } );
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

		it('builds the tool', async() => {
			const element = await setup();

			expect(element._tool).toBeTruthy();			
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('#measure').length).toBe(1);
		});

		it('activates the tool', async() => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#measure');

			toolButton.click();
			
			expect(element._tool.active).toBeTrue();
			expect(store.getState().measurement.active).toBeTrue();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
		});		

		it('deactivates the tool', async() => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#measure');

			toolButton.click();
			
			expect(element._tool.active).toBeTrue();
			expect(store.getState().measurement.active).toBeTrue();
			expect(toolButton.classList.contains('is-active')).toBeTrue();

			toolButton.click();
			expect(element._tool.active).toBeFalse();
			expect(store.getState().measurement.active).toBeFalse();
			expect(toolButton.classList.contains('is-active')).toBeFalse();
		});		

		it('resets the measurement', async() => {
			const element = await setup();
			const resetButton = element.shadowRoot.querySelector('#startnew');

			resetButton.click();

			expect(store.getState().measurement.reset).toBeInstanceOf(EventLike);			
		});
	});
});