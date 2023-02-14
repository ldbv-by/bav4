import { $injector } from '../../../../src/injection';
import { ElevationProfileChip } from '../../../../src/modules/chips/components/assistChips/ElevationProfileChip';
import { updateCoordinates } from '../../../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer } from '../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../test-utils';
import profileSvg from '../../../../src/modules/chips/components/assistChips/assets/profile.svg';


window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);

describe('ElevationProfileChip', () => {
	const defaultState = {
		elevationProfile: {
			active: false,
			coordinates: []
		}
	};

	let store;

	const setup = async (state = defaultState, attributes = {}) => {
		store = TestUtils.setupStoreAndDi(state, { elevationProfile: elevationProfileReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		const element = await TestUtils.render(ElevationProfileChip.tag, attributes);

		return element;
	};

	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new ElevationProfileChip().getModel();

			expect(model).toEqual({ profileCoordinates: [] });
		});

		it('properly implements abstract methods', async () => {
			await setup();
			const instanceUnderTest = new ElevationProfileChip();

			expect(instanceUnderTest.getLabel()).toBe('chips_assist_chip_elevation_profile');
			expect(instanceUnderTest.getIcon()).toBe(profileSvg);
		});
	});

	describe('when initialized', () => {
		const coordinates = [[42, 21], [0, 0]];
		it('contains default values in the model', async () => {
			const element = await setup();

			const { profileCoordinates } = element.getModel();

			expect(profileCoordinates).toEqual([]);
		});

		it('renders the view', async () => {
			const state = { elevationProfile: { active: false, coordinates: coordinates } };
			const element = await setup(state);

			expect(element.shadowRoot.childElementCount).toBeGreaterThan(0);
		});

		it('renders the view with local coordinates', async () => {
			const element = await setup(defaultState);

			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();
			element.coordinates = [[2, 0], [1, 0]];

			const buttonText = element.shadowRoot.querySelector('.chips__button-text');
			expect(buttonText.innerText).toBe('chips_assist_chip_elevation_profile');
			expect(unsubscribeSpy).toHaveBeenCalled();
		});


		it('renders the view only with local coordinates, the store does not interfere with changes', async () => {
			const element = await setup(defaultState);
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();

			// case 1: the store-observer is set before property changes
			element.coordinates = [[2, 0], [1, 0]];
			updateCoordinates([]);

			const buttonText = element.shadowRoot.querySelector('.chips__button-text');
			expect(buttonText.innerText).toBe('chips_assist_chip_elevation_profile');
			expect(unsubscribeSpy).toHaveBeenCalled();
			unsubscribeSpy.calls.reset();

			element.coordinates = [];
			updateCoordinates([[2, 0], [1, 0]]);

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('renders nothing when no coordinates for elevationProfile exists', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('changes rendering on changes in store', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);

			updateCoordinates(coordinates);

			expect(element.shadowRoot.childElementCount).toBe(3);

			updateCoordinates([]);

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('changes store on click', async () => {
			const state = { elevationProfile: { active: false, coordinates: coordinates } };
			const element = await setup(state);
			const button = element.shadowRoot.querySelector('button');

			expect(store.getState().elevationProfile.active).toBeFalse();

			button.click();

			expect(store.getState().elevationProfile.active).toBeTrue();
		});

		it('changes store on click with local coordinates', async () => {
			const state = { elevationProfile: { active: false, coordinates: [] } };
			const element = await setup(state);

			expect(store.getState().elevationProfile.active).toBeFalse();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);

			element.coordinates = [[2, 0], [1, 0]];
			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(store.getState().elevationProfile.active).toBeTrue();
			expect(store.getState().elevationProfile.coordinates).toEqual([[2, 0], [1, 0]]);
		});

		it('changes store on click with local coordinates without z-value', async () => {
			const state = { elevationProfile: { active: false, coordinates: [] } };
			const element = await setup(state);

			expect(store.getState().elevationProfile.active).toBeFalse();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);

			element.coordinates = [[2, 0, 3], [1, 0, 1]];
			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(store.getState().elevationProfile.active).toBeTrue();
			expect(store.getState().elevationProfile.coordinates).toEqual([[2, 0], [1, 0]]);
		});
	});

	describe('when disconnected', () => {

		it('removes all observers', async () => {
			const element = await setup();
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();

			element.onDisconnect(); // we call onDisconnect manually

			expect(unsubscribeSpy).toHaveBeenCalled();
		});
	});
});
