import { createNoInitialStateNavigationRailReducer, createNavigationRailReducer } from '@src/store/navigationRail/navigationRail.reducer.js';
import { open, close, toggle, addTabId } from '@src/store/navigationRail/navigationRail.action';
import { TestUtils } from '@test/test-utils.js';
import { TabIds } from '@src/domain/mainMenu';

describe('navigationRailReducer', () => {
	const initialState = {
		open: false,
		visitedTabIds: [TabIds.FEATUREINFO, TabIds.ROUTING]
	};

	const windowMock = {
		matchMedia() {}
	};

	const setup = (navigationRailReducer, state) => {
		return TestUtils.setupStoreAndDi(state, {
			navigationRail: navigationRailReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: initialState });
		expect(store.getState().navigationRail.open).toBe(false);
		expect(store.getState().navigationRail.visitedTabIds).toEqual([TabIds.FEATUREINFO, TabIds.ROUTING]);
	});

	describe('createNavigationRailReducer', () => {
		describe('returns a reducer function', () => {
			it("initializes the store by media query for ORIENTATION 'landscape'", () => {
				const matchMediaSpy = vi.spyOn(windowMock, 'matchMedia').mockReturnValue(TestUtils.newMediaQueryList(true));
				const store = setup(createNavigationRailReducer(windowMock));

				expect(matchMediaSpy).toHaveBeenCalledExactlyOnceWith('(orientation: landscape)');
				expect(store.getState().navigationRail.open).toBe(true);
			});

			it("initializes the store by media query for ORIENTATION 'landscape'", () => {
				const matchMediaSpy = vi.spyOn(windowMock, 'matchMedia').mockReturnValue(TestUtils.newMediaQueryList(false));
				const store = setup(createNavigationRailReducer(windowMock));

				expect(matchMediaSpy).toHaveBeenCalledExactlyOnceWith('(orientation: landscape)');
				expect(store.getState().navigationRail.open).toBe(false);
			});

			it('uses the real window as default argument', () => {
				const store = setup(createNavigationRailReducer());

				expect(store.getState().navigationRail.open).toBeTypeOf('boolean');
			});
		});
	});

	describe("changes the 'open' property", () => {
		it('sets true', () => {
			const store = setup(createNoInitialStateNavigationRailReducer());

			open();

			expect(store.getState().navigationRail.open).toBe(true);
		});

		it('sets false', () => {
			const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: { open: true } });

			expect(store.getState().navigationRail.open).toBe(true);

			close();

			expect(store.getState().navigationRail.open).toBe(false);
		});

		it('toggles current value', () => {
			const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: { open: true } });

			expect(store.getState().navigationRail.open).toBe(true);

			toggle();

			expect(store.getState().navigationRail.open).toBe(false);

			toggle();

			expect(store.getState().navigationRail.open).toBe(true);
		});
	});

	describe("changes the 'visitedTabIds' property", () => {
		it('sets a TabId', () => {
			const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: { open: false, visitedTabIds: [] } });

			addTabId(TabIds.ROUTING);

			expect(store.getState().navigationRail.visitedTabIds).toEqual([TabIds.ROUTING]);
		});

		it('sets redundant TabIds', () => {
			const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: { open: false, visitedTabIds: [] } });

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
