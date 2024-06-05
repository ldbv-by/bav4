import { createNoInitialStateNavigationRailReducer, createNavigationRailReducer } from '../../../src/store/navigationRail/navigationRail.reducer.js';
import { open, close, toggle, addTabId } from '../../../src/store/navigationRail/navigationRail.action';
import { TestUtils } from '../../test-utils.js';
import { TabIds } from '../../../src/domain/mainMenu';

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
		expect(store.getState().navigationRail.open).toBeFalse();
		expect(store.getState().navigationRail.visitedTabIds).toEqual([TabIds.FEATUREINFO, TabIds.ROUTING]);
	});

	describe('createNavigationRailReducer', () => {
		describe('returns a reducer function', () => {
			it("initializes the store by media query for ORIENTATION 'landscape' and 'max-width: 80em'", () => {
				spyOn(windowMock, 'matchMedia').withArgs('(orientation: landscape) and (max-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
				const store = setup(createNavigationRailReducer(windowMock));

				expect(store.getState().navigationRail.open).toBeTrue();
			});

			it("initializes the store by media query for ORIENTATION 'landscape' and 'max-width: 80em'", () => {
				spyOn(windowMock, 'matchMedia')
					.withArgs('(orientation: landscape) and (max-width: 80em)')
					.and.returnValue(TestUtils.newMediaQueryList(false));
				const store = setup(createNavigationRailReducer(windowMock));

				expect(store.getState().navigationRail.open).toBeFalse();
			});

			it('uses the real window as default argument', () => {
				const store = setup(createNavigationRailReducer());

				expect(store.getState().navigationRail.open).toMatch(/true|false/);
			});
		});
	});

	describe("changes the 'open' property", () => {
		it('sets true', () => {
			const store = setup(createNoInitialStateNavigationRailReducer());

			open();

			expect(store.getState().navigationRail.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: { open: true } });

			expect(store.getState().navigationRail.open).toBeTrue();

			close();

			expect(store.getState().navigationRail.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup(createNoInitialStateNavigationRailReducer(), { navigationRail: { open: true } });

			expect(store.getState().navigationRail.open).toBeTrue();

			toggle();

			expect(store.getState().navigationRail.open).toBeFalse();

			toggle();

			expect(store.getState().navigationRail.open).toBeTrue();
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
