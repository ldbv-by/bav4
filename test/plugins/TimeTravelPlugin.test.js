import { TimeTravelPlugin } from '../../src/plugins/TimeTravelPlugin.js';
import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { setCurrentTimestamp } from '../../src/store/timeTravel/timeTravel.action.js';
import { initialState as initialTimeTravelState, timeTravelReducer } from '../../src/store/timeTravel/timeTravel.reducer.js';
import { initialState as initialLayersState } from '../../src/store/layers/layers.reducer.js';
import {
	bottomSheetReducer,
	DEFAULT_BOTTOM_SHEET_ID,
	initialState as initialBottomSheetState
} from '../../src/store/bottomSheet/bottomSheet.reducer.js';
import { removeAndSetLayers } from '../../src/store/layers/layers.action.js';

describe('TimeTravelPlugin', () => {
	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			timeTravel: timeTravelReducer,
			bottomSheet: bottomSheetReducer
		});
		return store;
	};

	describe('when layers "active" property changes', () => {
		describe('and we have an unique timestamp', () => {
			it('displays the time travel slider', async () => {
				const store = setup({ layers: initialLayersState, timeTravel: initialTimeTravelState, bottomSheet: initialBottomSheetState });
				const instanceUnderTest = new TimeTravelPlugin();
				await instanceUnderTest.register(store);
				const geoResourceId = 'geoResourceId';
				const timestamp = 1900;

				removeAndSetLayers([
					{ id: 'id0', timestamp, geoResourceId },
					{ id: 'id1', timestamp, geoResourceId }
				]);

				const expectedTag = 'ba-time-travel-slider';
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data[0].content);
				expect(wrapperElement.querySelectorAll(expectedTag)).toHaveSize(1);
				expect(wrapperElement.querySelector(expectedTag).geoResourceId).toBe(geoResourceId);
				expect(wrapperElement.querySelector(expectedTag).timestamp).toBe(timestamp);
			});
		});

		describe('and we have different timestamps', () => {
			it('hides the time travel slider', async () => {
				const store = setup({
					layers: initialLayersState,
					timeTravel: initialTimeTravelState,
					bottomSheet: { ...initialBottomSheetState, active: DEFAULT_BOTTOM_SHEET_ID }
				});
				const instanceUnderTest = new TimeTravelPlugin();
				await instanceUnderTest.register(store);
				const geoResourceId = 'geoResourceId';

				removeAndSetLayers([
					{ id: 'id0', timestamp: '1900', geoResourceId },
					{ id: 'id1', timestamp: '2000', geoResourceId }
				]);

				expect(store.getState().bottomSheet.active).toBeNull();
			});
		});
		describe('and we have different GeoResource ids', () => {
			it('hides the time travel slider', async () => {
				const store = setup({
					layers: initialLayersState,
					timeTravel: initialTimeTravelState,
					bottomSheet: { ...initialBottomSheetState, active: DEFAULT_BOTTOM_SHEET_ID }
				});
				const instanceUnderTest = new TimeTravelPlugin();
				await instanceUnderTest.register(store);
				const timestamp = 1900;

				removeAndSetLayers([
					{ id: 'id0', timestamp, geoResourceId: 'geoResourceId0' },
					{ id: 'id1', timestamp, geoResourceId: 'geoResourceId1' }
				]);

				expect(store.getState().bottomSheet.active).toBeNull();
			});
		});
	});

	describe('when timeTravel "timestamp" property changes', () => {
		it('updates the timestamp property of all suitable layers', async () => {
			const store = setup({ layers: initialLayersState, timeTravel: initialTimeTravelState, bottomSheet: initialBottomSheetState });
			const instanceUnderTest = new TimeTravelPlugin();
			await instanceUnderTest.register(store);
			const timestamp = 1900;
			const newTimestamp = 2000;
			removeAndSetLayers([
				{ id: 'id0', timestamp, geoResourceId: 'geoResourceId0' },
				{ id: 'id1', timestamp, geoResourceId: 'geoResourceId1', visible: false }
			]);

			setCurrentTimestamp(newTimestamp);

			expect(store.getState().layers.active[0].timestamp).toBe(newTimestamp);
			expect(store.getState().layers.active[1].timestamp).toBe(timestamp);
		});

		describe('and we have no suitable layers', () => {
			it('does nothing', async () => {
				const store = setup({ layers: initialLayersState, timeTravel: initialTimeTravelState, bottomSheet: initialBottomSheetState });
				const instanceUnderTest = new TimeTravelPlugin();
				await instanceUnderTest.register(store);
				const timestamp = 1900;
				const newTimestamp = 2000;
				removeAndSetLayers([
					{ id: 'id0', timestamp, geoResourceId: 'geoResourceId0' },
					{ id: 'id1', timestamp, geoResourceId: 'geoResourceId1' }
				]);

				setCurrentTimestamp(newTimestamp);

				expect(store.getState().layers.active[0].timestamp).toBe(timestamp);
				expect(store.getState().layers.active[1].timestamp).toBe(timestamp);
			});
		});
	});
});
