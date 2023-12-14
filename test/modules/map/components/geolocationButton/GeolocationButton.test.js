import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { MvuElement } from '../../../../../src/modules/MvuElement';
import { GeolocationButton } from '../../../../../src/modules/map/components/geolocationButton/GeolocationButton';
import { geolocationReducer } from '../../../../../src/store/geolocation/geolocation.reducer.js';
window.customElements.define(GeolocationButton.tag, GeolocationButton);

describe('GeolocationButton', () => {
	let store;
	const defaultState = {
		active: false,
		denied: false,
		tracking: false,
		accuracy: null,
		position: null
	};

	const setup = async (geolocationState = defaultState) => {
		const state = {
			geolocation: geolocationState
		};

		store = TestUtils.setupStoreAndDi(state, { geolocation: geolocationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return await TestUtils.render(GeolocationButton.tag);
	};

	describe('class', () => {
		it('inherits from AbstractMvuContentPanel', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({ active: false, denied: false });
		});
	});

	describe('when initialized', () => {
		it('shows geolocation button in inactive state', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.geolocation')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.geolocation-button').title).toBe('map_geolocationButton_title_activate');
			expect(element.shadowRoot.querySelector('.icon')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.inactive')).toBeTruthy();
		});

		it('shows geolocation button in active state', async () => {
			const element = await setup({ ...defaultState, active: true });

			expect(element.shadowRoot.querySelector('.geolocation')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.geolocation-button').title).toBe('map_geolocationButton_title_deactivate');
			expect(element.shadowRoot.querySelector('.icon')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.active')).toBeTruthy();
		});

		it('shows geolocation button in denied state', async () => {
			const element = await setup({ ...defaultState, denied: true });

			expect(element.shadowRoot.querySelector('.geolocation')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.geolocation-button').title).toBe('map_geolocationButton_title_denied');
			expect(element.shadowRoot.querySelector('.icon')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.denied')).toBeTruthy();
		});
	});

	describe('when clicked', () => {
		it('activates geolocation', async () => {
			const element = await setup();

			expect(store.getState().geolocation.active).toBe(false);
			element.shadowRoot.querySelector('button').click();

			expect(store.getState().geolocation.active).toBe(true);
		});

		it('deactivates geolocation', async () => {
			const element = await setup({ ...defaultState, active: true });

			expect(store.getState().geolocation.active).toBe(true);
			element.shadowRoot.querySelector('button').click();

			expect(store.getState().geolocation.active).toBe(false);
		});
	});
});
