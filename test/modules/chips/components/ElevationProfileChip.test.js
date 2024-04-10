import { $injector } from '../../../../src/injection';
import { indicateChange } from '../../../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer } from '../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../test-utils';
import profileSvg from '../../../../src/modules/chips/components/assistChips/assets/profile.svg';
import { ElevationProfileChip } from '../../../../src/modules/chips/components/assistChips/ElevationProfileChip';

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

			expect(model).toEqual({ profileCoordinates: [], id: null });
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

			expect(profileCoordinates).toEqual([]);
			expect(id).toBeNull();
		});

		it('renders the view for profile id', async () => {
			const state = { elevationProfile: { active: false, id } };
			const element = await setup(state);

			expect(element.isVisible()).toBeTrue();
		});

		it('renders the view with local coordinates', async () => {
			const coordinates = [
				[2, 0],
				[1, 0]
			];
			const element = await setup(defaultState);
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();

			element.coordinates = coordinates;

			expect(element.isVisible()).toBeTrue();
			expect(unsubscribeSpy).toHaveBeenCalled();
		});

		it('renders the view only with local coordinates, the store does not interfere with changes', async () => {
			const element = await setup(defaultState);
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();

			// case 1: the store-observer is set before property changes
			element.coordinates = [
				[2, 0],
				[1, 0]
			];
			indicateChange(id);

			expect(element.isVisible()).toBeTrue();
			expect(unsubscribeSpy).toHaveBeenCalled();
			unsubscribeSpy.calls.reset();

			element.coordinates = [];
			indicateChange(id);

			expect(element.isVisible()).toBeFalse();
		});

		it('renders nothing when no coordinates for elevationProfile exists at all', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when observed slice-of-state changes', () => {
		it('changes visibility according to changes in store', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();

			indicateChange(id);

			expect(element.isVisible()).toBeTrue();

			indicateChange(null);

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
		it('opens the elevation profile', async () => {
			const state = { elevationProfile: { active: false, id } };
			const element = await setup(state);
			const button = element.shadowRoot.querySelector('button');

			expect(store.getState().elevationProfile.active).toBeFalse();

			button.click();

			expect(store.getState().elevationProfile.active).toBeTrue();
		});

		describe('and it has own coordinates', () => {
			it('requests a profile and opens the elevation profile', async () => {
				const coordinates = [
					[2, 0],
					[1, 0]
				];
				const elevationServiceSpy = spyOn(elevationService, 'requestProfile').withArgs(coordinates).and.resolveTo();
				const state = { elevationProfile: { active: false } };
				const element = await setup(state);

				expect(store.getState().elevationProfile.active).toBeFalse();

				element.coordinates = coordinates;
				const button = element.shadowRoot.querySelector('button');
				button.click();

				expect(store.getState().elevationProfile.active).toBeTrue();
				expect(elevationServiceSpy).toHaveBeenCalled();
			});
		});
	});
});
