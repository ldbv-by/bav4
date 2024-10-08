import { ELEVATION_PROFILE_BOTTOM_SHEET_ID, ElevationProfilePlugin } from '../../src/plugins/ElevationProfilePlugin';
import { openProfile } from '../../src/store/elevationProfile/elevationProfile.action';
import { elevationProfileReducer, initialState as elevationProfileInitialState } from '../../src/store/elevationProfile/elevationProfile.reducer';
import { bottomSheetReducer, initialState as bottomSheetInitialState } from '../../src/store/bottomSheet/bottomSheet.reducer';
import { featureInfoReducer, initialState as featureInfoInitialState } from '../../src/store/featureInfo/featureInfo.reducer';
import { TestUtils } from '../test-utils';
import { closeBottomSheet } from '../../src/store/bottomSheet/bottomSheet.action';
import { addFeatureInfoItems } from '../../src/store/featureInfo/featureInfo.action';
import { drawReducer, initialState as drawInitialState } from '../../src/store/draw/draw.reducer';
import { measurementReducer, initialState as measurementInitialState } from '../../src/store/measurement/measurement.reducer';
import { activate as activateDraw, deactivate as deactivateDraw } from '../../src/store/draw/draw.action';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../src/store/measurement/measurement.action';
import { LazyLoadWrapper } from '../../src/modules/commons/components/lazy/LazyLoadWrapper';
import { ElevationProfile } from '../../src/modules/elevationProfile/components/panel/ElevationProfile';

describe('ElevationProfilePlugin', () => {
	const setup = (state) => {
		const initialState = {
			elevationProfile: elevationProfileInitialState,
			bottomSheet: bottomSheetInitialState,
			draw: drawInitialState,
			measurement: measurementInitialState,
			featureInfo: featureInfoInitialState,
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			elevationProfile: elevationProfileReducer,
			bottomSheet: bottomSheetReducer,
			draw: drawReducer,
			measurement: measurementReducer,
			featureInfo: featureInfoReducer
		});
		return store;
	};

	describe('when property `active` of slice-of-state `elevationProfile` changes', () => {
		it('opens/closes the BottomSheet component', async () => {
			const store = setup();
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);

			openProfile([
				[0, 1],
				[2, 3]
			]);

			const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data[0].content);
			expect(wrapperElement.querySelectorAll(LazyLoadWrapper.tag)).toHaveSize(1);
			expect(wrapperElement.querySelectorAll(LazyLoadWrapper.tag)[0].chunkName).toBe('elevation-profile');
			const wrapperElementForContent = TestUtils.renderTemplateResult(wrapperElement.querySelectorAll(LazyLoadWrapper.tag)[0].content);
			expect(wrapperElementForContent.querySelectorAll(ElevationProfile.tag)).toHaveSize(1);
		});
	});

	describe('when property `active` of slice-of-state `bottomSheet` changes', () => {
		it('unsubscribes an previously registered bottomSheet observer', async () => {
			const store = setup({
				elevationProfile: {
					active: true,
					coordinates: []
				},
				bottomSheet: { data: [], active: [ELEVATION_PROFILE_BOTTOM_SHEET_ID] }
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');
			await instanceUnderTest.register(store);

			expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();
		});

		it('closes the ElevationProfile component when BottomSheet was closed', async () => {
			const store = setup({
				elevationProfile: {
					active: true,
					coordinates: []
				},
				bottomSheet: { data: [], active: true }
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');

			closeBottomSheet('elevationProfile');

			expect(store.getState().elevationProfile.active).toBeFalse();
			expect(bottomSheetUnsubscribeFnSpy).toHaveBeenCalled();
		});
	});

	describe('when property `active` of slice-of-state `draw` changes', () => {
		it('closes the ElevationProfile component and unsubscribes the bottomSheet observer when changed to `false`', async () => {
			const store = setup({
				elevationProfile: {
					active: true,
					coordinates: []
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

		it('does nothing when changed to `true`', async () => {
			const store = setup({
				elevationProfile: {
					active: true,
					coordinates: []
				},
				draw: {
					active: false
				}
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');

			activateDraw();

			expect(store.getState().elevationProfile.active).toBeTrue();
			expect(bottomSheetUnsubscribeFnSpy).not.toHaveBeenCalled();
		});
	});

	describe('when property `active` of slice-of-state `measurement` changes', () => {
		it('closes the ElevationProfile component and unsubscribes the bottomSheet observer when changed to `false`', async () => {
			const store = setup({
				elevationProfile: {
					active: true,
					coordinates: []
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

		it('does nothing when changed to `true`', async () => {
			const store = setup({
				elevationProfile: {
					active: true,
					coordinates: []
				},
				measurement: {
					active: false
				}
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);
			const bottomSheetUnsubscribeFnSpy = spyOn(instanceUnderTest, '_bottomSheetUnsubscribeFn');

			activateMeasurement();

			expect(store.getState().elevationProfile.active).toBeTrue();
			expect(bottomSheetUnsubscribeFnSpy).not.toHaveBeenCalled();
		});
	});

	describe('when property `current` of slice-of-state `featureInfo` changes', () => {
		it('resets the profile id', async () => {
			const store = setup({
				elevationProfile: {
					active: false,
					id: 'profielId'
				}
			});
			const instanceUnderTest = new ElevationProfilePlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().elevationProfile.id).not.toBeNull();

			addFeatureInfoItems({});

			expect(store.getState().elevationProfile.id).toBeNull();
		});
	});
});
