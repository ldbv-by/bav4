import { $injector } from '../../../../src/injection';
import { ElevationProfileChip } from '../../../../src/modules/chips/components/assistChips/ElevationProfileChip';
import { updateCoordinates } from '../../../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer } from '../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../test-utils';

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

			const buttonText = element.shadowRoot.querySelector('.chips__button-text');
			expect(buttonText.innerText).toBe('chips_assist_chip_elevation_profile');
		});

		it('renders the view with local coordinates', async () => {
			const element = await setup(defaultState);
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();
			element.coordinates = [[2, 0], [1, 0]];

			const buttonText = element.shadowRoot.querySelector('.chips__button-text');
			expect(buttonText.innerText).toBe('chips_assist_chip_elevation_profile');
			expect(unsubscribeSpy).toHaveBeenCalled();
		});


		it('renders the view only with local coordinates', async () => {
			const element = await setup(defaultState);
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();
			element.coordinates = [[2, 0], [1, 0]];

			updateCoordinates([]);

			const buttonText = element.shadowRoot.querySelector('.chips__button-text');
			expect(buttonText.innerText).toBe('chips_assist_chip_elevation_profile');
			expect(unsubscribeSpy).toHaveBeenCalled();
			unsubscribeSpy.calls.reset();

			element.coordinates = [];
			updateCoordinates([[2, 0], [1, 0]]);

			expect(element.shadowRoot.childElementCount).toBe(0);
			expect(unsubscribeSpy).not.toHaveBeenCalled();
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
	});
});
