import { $injector } from '../../../../src/injection';
import { updateCoordinates } from '../../../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer } from '../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../test-utils';
import profileSvg from '../../../../src/modules/chips/components/assistChips/assets/profile.svg';
import { ElevationProfileChip } from '../../../../src/modules/chips/components/assistChips/ElevationProfileChip';

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

	const coordinates = [
		[42, 21],
		[0, 0]
	];

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new ElevationProfileChip().getModel();

			expect(model).toEqual({ profileCoordinates: [] });
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

			const { profileCoordinates } = element.getModel();

			expect(profileCoordinates).toEqual([]);
		});

		it('renders the view', async () => {
			const state = { elevationProfile: { active: false, coordinates: coordinates } };
			const element = await setup(state);

			expect(element.isVisible()).toBeTrue();
		});

		it('renders the view with local coordinates', async () => {
			const element = await setup(defaultState);

			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();
			element.coordinates = [
				[2, 0],
				[1, 0]
			];

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
			updateCoordinates([]);

			expect(element.isVisible()).toBeTrue();
			expect(unsubscribeSpy).toHaveBeenCalled();
			unsubscribeSpy.calls.reset();

			element.coordinates = [];
			updateCoordinates([
				[2, 0],
				[1, 0]
			]);

			expect(element.isVisible()).toBeFalse();
		});

		it('renders nothing when no coordinates for elevationProfile exists', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when observed slice-of-state changes', () => {
		it('changes visibility according to changes in store', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();

			updateCoordinates(coordinates);

			expect(element.isVisible()).toBeTrue();

			updateCoordinates([]);

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
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

			element.coordinates = [
				[2, 0],
				[1, 0]
			];
			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(store.getState().elevationProfile.active).toBeTrue();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[2, 0],
				[1, 0]
			]);
		});
	});
});
