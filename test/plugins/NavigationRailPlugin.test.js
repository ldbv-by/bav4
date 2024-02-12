import { NavigationRailPlugin } from '../../src/plugins/NavigationRailPlugin.js';
import { TestUtils } from '../test-utils.js';
import { navigationRailReducer } from '../../src/store/navigationRail/navigationRail.reducer';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../src/store/media/media.reducer';
import { setTab } from '../../src/store/mainMenu/mainMenu.action';
import { TabIds } from '../../src/domain/mainMenu';

describe('NavigationRailPlugin', () => {
	const setup = (state) => {
		const initialState = {
			navigationRail: {
				open: false,
				visitedTabIds: []
			},
			media: {},
			mainMenu: {
				open: true,
				tab: null
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			navigationRail: navigationRailReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer()
		});
		return store;
	};

	describe('when tabId changes', () => {
		it('opens the FeatureInfoTab in landscape orientation', async () => {
			const store = setup();
			const instanceUnderTest = new NavigationRailPlugin();
			await instanceUnderTest.register(store);
			expect(store.getState().navigationRail.open).toBeFalse();

			setTab(TabIds.FEATUREINFO);

			expect(store.getState().navigationRail.open).toBeTrue();
		});

		it('opens the RoutingTab in landscape orientation', async () => {
			const store = setup();
			const instanceUnderTest = new NavigationRailPlugin();
			await instanceUnderTest.register(store);
			expect(store.getState().navigationRail.open).toBeFalse();

			setTab(TabIds.ROUTING);

			expect(store.getState().navigationRail.open).toBeTrue();
		});

		it('does not opens a supported tab in portrait orientation', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const store = setup(state);
			const instanceUnderTest = new NavigationRailPlugin();
			await instanceUnderTest.register(store);
			expect(store.getState().navigationRail.open).toBeFalse();

			setTab(TabIds.SEARCH);

			expect(store.getState().navigationRail.open).toBeFalse();
		});

		it('does nothing when a tab is not supported', async () => {
			const store = setup();
			const instanceUnderTest = new NavigationRailPlugin();
			await instanceUnderTest.register(store);
			expect(store.getState().navigationRail.open).toBeFalse();

			setTab(TabIds.MAPS);

			expect(store.getState().navigationRail.open).toBeFalse();
		});
	});
});
