import { ElevationProfilePlugin } from '../../src/plugins/ElevationProfilePlugin';
import { closeProfile, openProfile } from '../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer, initialState as elevationProfileInitialState } from '../../src/store/elevationProfile/elevationProfile.reducer';
import { bottomSheetReducer, initialState as bottomSheetInitialState } from '../../src/store/bottomSheet/bottomSheet.reducer';
import { TestUtils } from '../test-utils';
import { closeBottomSheet } from '../../src/store/bottomSheet/bottomSheet.action';
import { drawReducer, initialState as drawInitialState } from '../../src/store/draw/draw.reducer';
import { measurementReducer, initialState as measurementInitialState } from '../../src/store/measurement/measurement.reducer';
import { deactivate as deactivateDraw } from '../../src/store/draw/draw.action';
import { deactivate as deactivateMeasurement } from '../../src/store/measurement/measurement.action';

describe('ElevationProfilePlugin', () => {

	const setup = (state) => {
		const initialState = {
			elevationProfile: elevationProfileInitialState,
			bottomSheet: bottomSheetInitialState,
			draw: drawInitialState,
			measurement: measurementInitialState,
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			elevationProfile: elevationProfileReducer,
			bottomSheet: bottomSheetReducer,
			draw: drawReducer,
			measurement: measurementReducer
		});
		return store;
	};

	describe('when property `active` of slice-of-state `elevationProfile` changes', () => {

		it('opens/closes the BottomSheet component', async () => {
			const store = setup();
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);

			openProfile([[0, 1], [2, 3]]);

			const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data);
			expect(wrapperElement.querySelectorAll('ba-elevation-profile')).toHaveSize(1);

			closeProfile();

			expect(store.getState().bottomSheet.data).toBeNull();
		});
	});

	describe('when property `active` of slice-of-state `bottomSheet` changes', () => {

		it('closes the ElevationProfile component and unsubscribes the bottomSheet observer', async () => {
			const store = setup({
				elevationProfile: {
					active: true
				},
				bottomSheet: {
					active: true
				}
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');

			closeBottomSheet();

			expect(store.getState().elevationProfile.active).toBeFalse();
			expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();
		});
	});

	describe('when property `active` of slice-of-state `draw` changes', () => {

		it('closes the ElevationProfile component and unsubscribes the bottomSheet observer', async () => {
			const store = setup({
				elevationProfile: {
					active: true
				},
				draw: {
					active: true
				}
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');

			deactivateDraw();

			expect(store.getState().elevationProfile.active).toBeFalse();
			expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();
		});
	});

	describe('when property `active` of slice-of-state `measurement` changes', () => {

		it('closes the ElevationProfile component and unsubscribes the bottomSheet observer', async () => {
			const store = setup({
				elevationProfile: {
					active: true
				},
				measurement: {
					active: true
				}
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');

			deactivateMeasurement();

			expect(store.getState().elevationProfile.active).toBeFalse();
			expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();
		});
	});
});
