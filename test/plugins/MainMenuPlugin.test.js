import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { close, setTab } from '../../src/store/mainMenu/mainMenu.action';
import { TabIds } from '../../src/domain/mainMenu';
import { abortOrReset, registerQuery, resolveQuery } from '../../src/store/featureInfo/featureInfo.action.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { MainMenuPlugin } from '../../src/plugins/MainMenuPlugin.js';
import { $injector } from '../../src/injection/index.js';
import { QueryParameters } from '../../src/domain/queryParameters.js';
import { EventLike } from '../../src/utils/storeUtils.js';
import { searchReducer } from '../../src/store/search/search.reducer.js';
import { setQuery } from '../../src/store/search/search.action.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { Tools } from '../../src/domain/tools.js';
import { createNoInitialStateMediaReducer } from '../../src/store/media/media.reducer';
import { setIsPortrait } from '../../src/store/media/media.action';
import { catalogReducer } from '../../src/store/catalog/catalog.reducer.js';

describe('MainMenuPlugin', () => {
	const environmentServiceMock = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: false,
				tab: null,
				focusSearchField: new EventLike()
			},
			search: {
				query: new EventLike(null)
			},
			media: {
				portrait: false,
				minWidth: true,
				observeResponsiveParameter: true
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			featureInfo: featureInfoReducer,
			search: searchReducer,
			tools: toolsReducer,
			catalog: catalogReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentServiceMock);
		return store;
	};

	describe('static properties', () => {
		it('provides a default tab id', () => {
			expect(MainMenuPlugin.DEFAULT_TAB_ID).toBe(TabIds.MAPS);
			expect(MainMenuPlugin.FOCUS_SEARCHFIELD_DELAY_MS).toBe(0);
		});
	});

	describe('constructor', () => {
		it('setups local state', () => {
			setup();
			const instanceUnderTest = new MainMenuPlugin();

			expect(instanceUnderTest._previousTab).toBeNull();
			expect(instanceUnderTest._open).toBeNull();
		});
	});

	describe('_init', () => {
		describe('`MENU_ID` query parameter available', () => {
			it('sets the requested tab id', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.MENU_ID}=4`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();

				instanceUnderTest._init();

				expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
			});

			it('sets the default tab id when param is not parsable', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.MENU_ID}=foo`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();

				instanceUnderTest._init();

				expect(store.getState().mainMenu.tab).toEqual(MainMenuPlugin.DEFAULT_TAB_ID);
			});

			it('sets the default tab id when param denoted the ROUTING tab', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.MENU_ID}=3`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();

				instanceUnderTest._init();

				expect(store.getState().mainMenu.tab).toEqual(MainMenuPlugin.DEFAULT_TAB_ID);
			});

			describe('prepare UI', () => {
				it('sets the focus on the search field of the MainMenu', async () => {
					const store = setup();
					const instanceUnderTest = new MainMenuPlugin();
					const initialValue = store.getState().mainMenu.focusSearchField;
					instanceUnderTest._init();

					await TestUtils.timeout();

					expect(initialValue).not.toEqual(store.getState().mainMenu.focusSearchField);
				});
			});
		});

		describe('`MENU_ID` query parameter is NOT available', () => {
			it('sets the default tab id', async () => {
				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();

				instanceUnderTest._init();

				expect(store.getState().mainMenu.tab).toEqual(MainMenuPlugin.DEFAULT_TAB_ID);
			});
		});

		describe('`CATALOG_NODE_IDS` query parameter available', () => {
			it('sets the catalog node ids', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.CATALOG_NODE_IDS}=node0,node1`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();

				instanceUnderTest._init();

				expect(store.getState().catalog.openNodes).toEqual(['node0', 'node1']);
			});
		});

		describe('`CATALOG_NODE_IDS` query parameter is NOT available', () => {
			it('does nothing', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.CATALOG_NODE_IDS}=`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();

				instanceUnderTest._init();

				expect(store.getState().catalog.openNodes).toEqual([]);
			});
		});
	});

	describe('register', () => {
		it('updates necessary local fields', async () => {
			const store = setup({
				mainMenu: {
					open: true
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			const initSpy = spyOn(instanceUnderTest, '_init').and.callThrough();

			await instanceUnderTest.register(store);

			expect(instanceUnderTest._open).toBeTrue();
			expect(instanceUnderTest._previousTab).toBe(MainMenuPlugin.DEFAULT_TAB_ID);
			expect(initSpy).toHaveBeenCalled();
		});

		it('opens the search panel when query is available', async () => {
			const store = setup({
				search: {
					query: new EventLike('foo')
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().mainMenu.tab).toBe(TabIds.SEARCH);
			expect(store.getState().mainMenu.open).toBeTrue();
		});
	});

	describe('when featureInfo.querying property changes', () => {
		it('does nothing when query is running', async () => {
			const queryId = 'foo';
			const store = setup({
				featureInfo: {
					queries: [],
					querying: false,
					current: [{ title: 'title', content: 'content' }]
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			registerQuery(queryId);

			expect(store.getState().featureInfo.current).toHaveSize(1);
			expect(store.getState().mainMenu.tab).toBe(MainMenuPlugin.DEFAULT_TAB_ID);
			expect(store.getState().mainMenu.open).toBeFalse();
		});

		describe('and we have FeatureInfo items', () => {
			describe('and MainMenu is initially closed', () => {
				it('opens the FeatureInfo panel', async () => {
					const queryId = 'foo';
					const store = setup({
						featureInfo: {
							queries: [queryId],
							querying: true,
							current: [{ title: 'title', content: 'content' }]
						}
					});
					const instanceUnderTest = new MainMenuPlugin();
					await instanceUnderTest.register(store);

					resolveQuery(queryId);

					expect(store.getState().featureInfo.current).toHaveSize(1);
					expect(store.getState().mainMenu.tab).toBe(TabIds.FEATUREINFO);
					expect(store.getState().mainMenu.open).toBeTrue();
				});
			});
		});

		describe('and we have NO FeatureInfo items', () => {
			describe('and MainMenu is initially closed', () => {
				it('does nothing', async () => {
					const queryId = 'foo';
					const store = setup({
						featureInfo: {
							queries: [queryId],
							querying: true,
							current: []
						}
					});
					const instanceUnderTest = new MainMenuPlugin();
					await instanceUnderTest.register(store);

					resolveQuery(queryId);

					expect(store.getState().mainMenu.tab).toBe(MainMenuPlugin.DEFAULT_TAB_ID);
					expect(store.getState().mainMenu.open).toBeFalse();
				});
			});
		});
	});

	describe('when featureInfo.aborted property changes', () => {
		describe('current tab is not the FeatureInfo tab', () => {
			it('does nothing', async () => {
				const store = setup({
					mainMenu: {
						open: false
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);
				setTab(TabIds.MAPS);

				abortOrReset();

				expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
				expect(store.getState().mainMenu.open).toBeFalse();
			});

			describe('and MainMenu is initially closed', () => {
				it('restores the previous panel', async () => {
					const store = setup({
						mainMenu: {
							open: false
						}
					});
					const instanceUnderTest = new MainMenuPlugin();
					await instanceUnderTest.register(store);
					setTab(TabIds.FEATUREINFO);
					close();

					abortOrReset();

					expect(store.getState().mainMenu.tab).toBe(MainMenuPlugin.DEFAULT_TAB_ID);
					expect(store.getState().mainMenu.open).toBeFalse();
				});
			});

			describe('and MainMenu is initially open', () => {
				it('restores the previous panel', async () => {
					const store = setup({
						mainMenu: {
							open: true
						}
					});
					const instanceUnderTest = new MainMenuPlugin();
					await instanceUnderTest.register(store);
					setTab(TabIds.FEATUREINFO);

					abortOrReset();

					expect(store.getState().mainMenu.tab).toBe(MainMenuPlugin.DEFAULT_TAB_ID);
					expect(store.getState().mainMenu.open).toBeTrue();
				});
			});
		});

		describe('current tab is the FeatureInfo tab', () => {
			describe('and the previous tab is also the FeatureInfo', () => {
				it('sets the default tab', async () => {
					const store = setup({
						mainMenu: {
							tab: TabIds.FEATUREINFO,
							open: true
						}
					});
					const instanceUnderTest = new MainMenuPlugin();
					spyOn(instanceUnderTest, '_init');
					await instanceUnderTest.register(store);

					abortOrReset();

					expect(store.getState().mainMenu.tab).toBe(MainMenuPlugin.DEFAULT_TAB_ID);
				});
			});
		});
	});

	describe('when mainMenu.tabIndex changes', () => {
		it('stores some properties', async () => {
			const store = setup({
				mainMenu: {
					open: true
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			setTab(TabIds.MISC);

			expect(instanceUnderTest._previousTab).toBe(TabIds.MISC);

			setTab(TabIds.FEATUREINFO);

			expect(instanceUnderTest._open).toBeTrue();
		});
	});

	describe('when search.query property changes', () => {
		it('opens the search panel', async () => {
			const store = setup({
				mainMenu: {
					open: false
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			setQuery('foo');

			expect(store.getState().mainMenu.tab).toBe(TabIds.SEARCH);
			expect(store.getState().mainMenu.open).toBeTrue();
		});

		it('does NOT open the search panel when query is not available', async () => {
			const store = setup({
				mainMenu: {
					open: false
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			setQuery(null);

			expect(store.getState().mainMenu.open).toBeFalse();
			expect(store.getState().mainMenu.tab).not.toBe(TabIds.SEARCH);
		});
	});

	describe('when toolId changes', () => {
		describe('on landscape layout', () => {
			it('opens and closes the routing panel and restores the previous panel', async () => {
				const store = setup({
					mainMenu: {
						open: false
					},
					media: {
						portrait: false
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);

				setCurrentTool(Tools.ROUTING);

				expect(store.getState().mainMenu.tab).toBe(TabIds.ROUTING);
				expect(store.getState().mainMenu.open).toBeTrue();

				setCurrentTool(null);

				expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
				expect(store.getState().mainMenu.open).toBeTrue();
			});
		});

		describe('on portrait layout', () => {
			it('restores the previous panel', async () => {
				const store = setup({
					mainMenu: {
						open: true,
						tab: TabIds.MAPS
					},
					media: {
						portrait: true
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);

				setCurrentTool(Tools.ROUTING);
				setTab(TabIds.ROUTING);

				expect(store.getState().mainMenu.tab).toBe(TabIds.ROUTING);
				expect(store.getState().mainMenu.open).toBeTrue();

				setCurrentTool(null);

				expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});

	describe('when orientation changes', () => {
		it('opens the mainMenu width routing tab', async () => {
			const store = setup({
				mainMenu: {
					open: false
				},
				media: {
					portrait: true,
					observeResponsiveParameter: true
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			setTab(TabIds.ROUTING);

			expect(store.getState().mainMenu.open).toBeFalse();

			setIsPortrait(false);

			expect(store.getState().mainMenu.open).toBeTrue();
		});

		it('opens the mainMenu width featureInfo tab', async () => {
			const store = setup({
				mainMenu: {
					open: false
				},
				media: {
					portrait: true,
					observeResponsiveParameter: true
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			setTab(TabIds.FEATUREINFO);

			expect(store.getState().mainMenu.open).toBeFalse();

			setIsPortrait(false);

			expect(store.getState().mainMenu.open).toBeTrue();
		});
	});
});
