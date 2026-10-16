import { LazyLoadWrapper } from '@src/modules/commons/components/lazy/LazyLoadWrapper';
import { ElevationProfile } from '@src/modules/elevationProfile/components/panel/ElevationProfile';
import { ELEVATION_PROFILE_BOTTOM_SHEET_ID, ElevationProfilePlugin } from '@src/plugins/ElevationProfilePlugin';
import { closeBottomSheet } from '@src/store/bottomSheet/bottomSheet.action';
import { initialState as bottomSheetInitialState, bottomSheetReducer } from '@src/store/bottomSheet/bottomSheet.reducer';
import { activate as activateDraw, deactivate as deactivateDraw } from '@src/store/draw/draw.action';
import { initialState as drawInitialState, drawReducer } from '@src/store/draw/draw.reducer';
import { openProfile } from '@src/store/elevationProfile/elevationProfile.action';
import { initialState as elevationProfileInitialState, elevationProfileReducer } from '@src/store/elevationProfile/elevationProfile.reducer';
import { addFeatureInfoItems } from '@src/store/featureInfo/featureInfo.action';
import { initialState as featureInfoInitialState, featureInfoReducer } from '@src/store/featureInfo/featureInfo.reducer';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '@src/store/measurement/measurement.action';
import { initialState as measurementInitialState, measurementReducer } from '@src/store/measurement/measurement.reducer';
import { TestUtils } from '@test/test-utils';

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
			expect(wrapperElement.querySelectorAll(LazyLoadWrapper.tag)).toHaveLength(1);
			expect(wrapperElement.querySelectorAll(LazyLoadWrapper.tag)[0].chunkName).toBe('elevation-profile');
			const wrapperElementForContent = TestUtils.renderTemplateResult(wrapperElement.querySelectorAll(LazyLoadWrapper.tag)[0].content);
			expect(wrapperElementForContent.querySelectorAll(ElevationProfile.tag)).toHaveLength(1);
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
			const bottomSheetUnsubscribeFnSpy = vi.spyOn(instanceUnderTest, '_bottomSheetUnsubscribe').mockImplementation(() => {});
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
			const bottomSheetUnsubscribeFnSpy = vi.spyOn(instanceUnderTest, '_bottomSheetUnsubscribe').mockImplementation(() => {});

			closeBottomSheet('elevationProfile');

			expect(store.getState().elevationProfile.active).toBe(false);
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

			const bottomSheetUnsubscribeFnSpy = vi.spyOn(instanceUnderTest, '_bottomSheetUnsubscribe').mockImplementation(() => {});

			deactivateDraw();

			expect(store.getState().elevationProfile.active).toBe(false);
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
			const bottomSheetUnsubscribeFnSpy = vi.spyOn(instanceUnderTest, '_bottomSheetUnsubscribe').mockImplementation(() => {});

			activateDraw();

			expect(store.getState().elevationProfile.active).toBe(true);
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
			const bottomSheetUnsubscribeFnSpy = vi.spyOn(instanceUnderTest, '_bottomSheetUnsubscribe').mockImplementation(() => {});

			deactivateMeasurement();

			expect(store.getState().elevationProfile.active).toBe(false);
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
			const bottomSheetUnsubscribeFnSpy = vi.spyOn(instanceUnderTest, '_bottomSheetUnsubscribe').mockImplementation(() => {});

			activateMeasurement();

			expect(store.getState().elevationProfile.active).toBe(true);
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
