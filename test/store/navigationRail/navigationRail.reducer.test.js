import { navigationRailReducer } from '../../../src/store/navigationRail/navigationRail.reducer.js';
import { open, close, toggle, addTabId } from '../../../src/store/navigationRail/navigationRail.action';
import { TestUtils } from '../../test-utils.js';
import { TabIds } from '../../../src/domain/mainMenu';

describe('navigationRailReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			navigationRail: navigationRailReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().navigationRail.open).toBeFalse();
		expect(store.getState().navigationRail.visitedTabIds).toEqual([]);
	});

	describe("changes the 'open' property", () => {
		it('sets true', () => {
			const store = setup();

			open();

			expect(store.getState().navigationRail.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup({ navigationRail: { open: true } });

			expect(store.getState().navigationRail.open).toBeTrue();

			close();

			expect(store.getState().navigationRail.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup({ navigationRail: { open: true } });

			expect(store.getState().navigationRail.open).toBeTrue();

			toggle();

			expect(store.getState().navigationRail.open).toBeFalse();

			toggle();

			expect(store.getState().navigationRail.open).toBeTrue();
		});
	});

	describe("changes the 'visitedTabIds' property", () => {
		it('sets a TabId', () => {
			const store = setup();

			addTabId(TabIds.ROUTING);

			expect(store.getState().navigationRail.visitedTabIds).toEqual([TabIds.ROUTING]);
		});

		it('sets redundant TabIds', () => {
			const store = setup();

			addTabId(TabIds.FEATUREINFO);
			addTabId(TabIds.ROUTING);
			addTabId(TabIds.ROUTING);
			addTabId(TabIds.ROUTING);
			addTabId(TabIds.FEATUREINFO);
			addTabId(TabIds.MAPS);

			expect(store.getState().navigationRail.visitedTabIds).toEqual([TabIds.FEATUREINFO, TabIds.ROUTING, TabIds.MAPS]);
		});
	});
});
