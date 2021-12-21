import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { setTab, TabKey } from '../../src/store/mainMenu/mainMenu.action';
import { abortOrReset, resolveQuery } from '../../src/store/featureInfo/featureInfo.action.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { MainMenuPlugin } from '../../src/plugins/MainMenuPlugin.js';


describe('MainMenuPlugin', () => {

	const setup = (state) => {

		const initialState = {
			mainMenu: {
				open: false,
				tab: TabKey.MAPS
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			featureInfo: featureInfoReducer
		});
		return store;
	};

	describe('constructor', () => {

		it('setups local state', () => {
			setup();
			const instanceUnderTest = new MainMenuPlugin();

			expect(instanceUnderTest._previousTab).toBeNull();
			expect(instanceUnderTest._open).toBeNull();
		});
	});

	describe('register', () => {

		it('updates necessary fields', async () => {
			const store = setup({
				mainMenu: {
					open: true,
					tab: TabKey.MAPS
				}
			});
			const instanceUnderTest = new MainMenuPlugin();

			await instanceUnderTest.register(store);

			expect(instanceUnderTest._open).toBeTrue();
			expect(instanceUnderTest._previousTab).toBe(TabKey.MAPS);
		});
	});

	describe('when featureInfo.querying property changes', () => {

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
					expect(store.getState().mainMenu.tab).toBe(TabKey.FEATUREINFO);
					expect(store.getState().mainMenu.open).toBeTrue();
				});
			});

			describe('and we have NO FeatureInfo items', () => {

				describe('and MainMenu is initially closed', () => {

					it('restores the previous panel and closes the menu', async () => {
						const tabIndex = TabKey.MAPS;
						const queryId = 'foo';
						const store = setup({
							mainMenu: {
								tab: tabIndex,
								open: false
							},
							featureInfo: {
								queries: [queryId],
								querying: true,
								current: [{ title: 'title', content: 'content' }]
							}
						});
						const instanceUnderTest = new MainMenuPlugin();
						await instanceUnderTest.register(store);

						abortOrReset();

						expect(store.getState().mainMenu.tab).toBe(tabIndex);
						expect(store.getState().mainMenu.open).toBeFalse();
					});
				});

				describe('and MainMenu is initially open', () => {

					it('restores the previous panel', async () => {
						const tabIndex = TabKey.MAPS;
						const queryId = 'foo';
						const store = setup({
							mainMenu: {
								tab: tabIndex,
								open: true
							},
							featureInfo: {
								queries: [queryId],
								querying: true,
								current: [{ title: 'title', content: 'content' }]
							}
						});
						const instanceUnderTest = new MainMenuPlugin();
						await instanceUnderTest.register(store);

						abortOrReset();

						expect(store.getState().mainMenu.tab).toBe(tabIndex);
						expect(store.getState().mainMenu.open).toBeTrue();
					});
				});
			});
		});
	});

	describe('when featureInfo.aborted property changes', () => {

		describe('and MainMenu is initially closed', () => {

			it('restores the previous panel', async () => {
				const tabIndex = TabKey.MAPS;
				const queryId = 'foo';
				const store = setup({
					mainMenu: {
						tab: tabIndex,
						open: false
					},
					featureInfo: {
						queries: [queryId],
						querying: true,
						current: [{ title: 'title', content: 'content' }]
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);

				abortOrReset();

				expect(store.getState().mainMenu.tab).toBe(tabIndex);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});

		describe('and MainMenu is initially open', () => {

			it('restores the previous panel', async () => {
				const tabIndex = TabKey.MAPS;
				const queryId = 'foo';
				const store = setup({
					mainMenu: {
						tab: tabIndex,
						open: true
					},
					featureInfo: {
						queries: [queryId],
						querying: true,
						current: [{ title: 'title', content: 'content' }]
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);

				abortOrReset();

				expect(store.getState().mainMenu.tab).toBe(tabIndex);
				expect(store.getState().mainMenu.open).toBeTrue();
			});
		});
	});

	describe('when mainMenu.tabIndex changes', () => {

		it('stores some properties', async () => {
			const tabIndex = TabKey.MAPS;
			const store = setup({
				mainMenu: {
					tab: tabIndex,
					open: true
				}
			});
			const instanceUnderTest = new MainMenuPlugin();
			await instanceUnderTest.register(store);

			setTab(TabKey.MORE);

			expect(instanceUnderTest._previousTab).toBe(TabKey.MORE);

			setTab(TabKey.FEATUREINFO);

			expect(instanceUnderTest._open).toBeTrue();
		});
	});
});
