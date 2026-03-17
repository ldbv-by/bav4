import { $injector } from '@src/injection';
import { indicateChange } from '@src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer } from '@src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '@test/test-utils';
import profileSvg from '@src/modules/chips/components/assistChips/assets/profile.svg';
import { ElevationProfileChip } from '@src/modules/chips/components/assistChips/ElevationProfileChip';

window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);

describe('ElevationProfileChip', () => {
	const elevationService = {
		requestProfile() {}
	};

	const defaultState = {
		elevationProfile: {
			active: false,
			id: null
		}
	};

	let store;

	const setup = async (state = defaultState, attributes = {}) => {
		store = TestUtils.setupStoreAndDi(state, { elevationProfile: elevationProfileReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('ElevationService', elevationService);

		const element = await TestUtils.render(ElevationProfileChip.tag, attributes);

		return element;
	};

	const id = 'profileReferenceId';

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new ElevationProfileChip().getModel();

			expect(model).toEqual({ profileCoordinates: null, id: null, title: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('chips_assist_chip_elevation_profile');
			expect(element.getIcon()).toBe(profileSvg);
		});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();

			const { profileCoordinates, id } = element.getModel();

			expect(profileCoordinates).toBeNull();
			expect(id).toBeNull();
		});

		it('renders the view for profile id', async () => {
			const state = { elevationProfile: { active: false, id } };
			const element = await setup(state);

			expect(element.isVisible()).toBe(true);
		});

		it('renders the view with local coordinates', async () => {
			const coordinates = [
				[2, 0],
				[1, 0]
			];
			const element = await setup(defaultState);
			const unsubscribeSpy = vi.spyOn(element, '_unsubscribeFromStore');

			element.coordinates = coordinates;

			expect(element.isVisible()).toBe(true);
			expect(unsubscribeSpy).toHaveBeenCalled();
		});

		it('renders the view only with local coordinates, the store does not interfere with changes', async () => {
			const element = await setup(defaultState);
			const unsubscribeSpy = vi.spyOn(element, '_unsubscribeFromStore');

			// case 1: the store-observer is set before property changes
			element.coordinates = [
				[2, 0],
				[1, 0]
			];
			indicateChange(id);

			expect(element.isVisible()).toBe(true);
			expect(unsubscribeSpy).toHaveBeenCalled();
			unsubscribeSpy.mockReset();

			element.coordinates = [];
			indicateChange(id);

			expect(element.isVisible()).toBe(false);
		});

		it('renders nothing when no coordinates for elevationProfile exists at all', async () => {
			const element = await setup();

			expect(element.isVisible()).toBe(false);
		});

		it('renders the view with given title ', async () => {
			const state = { elevationProfile: { active: false, id } };
			const element = await setup(state);

			expect(element.shadowRoot.querySelector('button').title).toBe('chips_assist_chip_elevation_profile_title');
			expect(element.shadowRoot.querySelector('button').ariaLabel).toBe('chips_assist_chip_elevation_profile_title');
		});
	});

	describe('when observed slice-of-state changes', () => {
		it('changes visibility according to changes in store', async () => {
			const element = await setup();

			expect(element.isVisible()).toBe(false);

			indicateChange(id);

			expect(element.isVisible()).toBe(true);

			indicateChange(null);

			expect(element.isVisible()).toBe(false);
		});
	});

	describe('when chip is clicked', () => {
		it('opens the elevation profile', async () => {
			const state = { elevationProfile: { active: false, id } };
			const element = await setup(state);
			const button = element.shadowRoot.querySelector('button');

			expect(store.getState().elevationProfile.active).toBe(false);

			button.click();

			expect(store.getState().elevationProfile.active).toBe(true);
		});

		describe('and it has own coordinates', () => {
			it('requests a profile and opens the elevation profile', async () => {
				const coordinates = [
					[2, 0],
					[1, 0]
				];
				const elevationServiceSpy = vi.spyOn(elevationService, 'requestProfile').mockResolvedValue(undefined);
				const state = { elevationProfile: { active: false } };
				const element = await setup(state);

				expect(store.getState().elevationProfile.active).toBe(false);

				element.coordinates = coordinates;
				const button = element.shadowRoot.querySelector('button');
				button.click();

				expect(elevationServiceSpy).toHaveBeenCalledWith(coordinates);
				expect(store.getState().elevationProfile.active).toBe(true);
				expect(elevationServiceSpy).toHaveBeenCalled();
			});
		});
	});
});
