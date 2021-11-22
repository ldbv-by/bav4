import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { TabIndex } from '../../src/store/mainMenu/mainMenu.action';
import { abortOrReset, registerQueryFor, unregisterQueryFor } from '../../src/store/featureInfo/featureInfo.action.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { MainMenuPlugin } from '../../src/plugins/MainMenuPlugin.js';


describe('MainMenuPlugin', () => {

	const setup = (state) => {

		const initialState = {
			mainMenu: {
				open: false,
				tabIndex: TabIndex.MAPS
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			featureInfo: featureInfoReducer
		});
		return store;
	};

	describe('when featureInfo.pending property changes', () => {

		describe('and we have FeatureInfo items', () => {

			describe('and MainMenu is initially closed', () => {

				it('opens the FeatureInfo panel', async () => {
					const geoResourceId = 'foo';
					const store = setup({
						featureInfo: {
							pending: [geoResourceId],
							current: [{ title: 'title', content: 'content' }]
						}
					});
					const instanceUnderTest = new MainMenuPlugin();
					await instanceUnderTest.register(store);

					unregisterQueryFor(geoResourceId);

					expect(store.getState().featureInfo.current).toHaveSize(1);
					expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
					expect(store.getState().mainMenu.open).toBeTrue();
				});
			});

			describe('and we have NO FeatureInfo items', () => {

				describe('and MainMenu is initially closed', () => {

					it('restores the previous panel and closes the menu', async () => {
						const tabIndex = TabIndex.MAPS;
						const geoResourceId = 'foo';
						const store = setup({
							mainMenu: {
								tabIndex: tabIndex,
								open: false
							},
							featureInfo: {
								pending: [geoResourceId],
								current: [{ title: 'title', content: 'content' }]
							}
						});
						const instanceUnderTest = new MainMenuPlugin();
						await instanceUnderTest.register(store);
						//the following is also needed to arrange the correct setup
						unregisterQueryFor(geoResourceId);
						expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
						expect(store.getState().mainMenu.open).toBeTrue();

						// our actual test starts here:
						//first we have to register a geoResource to change the pending field
						registerQueryFor(geoResourceId);
						//then we reset the both the pending and actual field
						abortOrReset();

						expect(store.getState().mainMenu.tabIndex).toBe(tabIndex);
						expect(store.getState().mainMenu.open).toBeFalse();
					});
				});

				describe('and MainMenu is initially open', () => {

					it('restores the previous panel', async () => {
						const tabIndex = TabIndex.MAPS;
						const geoResourceId = 'foo';
						const store = setup({
							mainMenu: {
								tabIndex: tabIndex,
								open: true
							},
							featureInfo: {
								pending: [geoResourceId],
								current: [{ title: 'title', content: 'content' }]
							}
						});
						const instanceUnderTest = new MainMenuPlugin();
						await instanceUnderTest.register(store);
						//the following is also needed to arrange the correct setup
						unregisterQueryFor(geoResourceId);
						expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
						expect(store.getState().mainMenu.open).toBeTrue();

						// our actual test starts here:
						//first we have to register a geoResource to change the pending field
						registerQueryFor(geoResourceId);
						//then we reset the both the pending and actual field
						abortOrReset();

						expect(store.getState().mainMenu.tabIndex).toBe(tabIndex);
						expect(store.getState().mainMenu.open).toBeTrue();
					});
				});
			});
		});
	});

	describe('when featureInfo.aborted property changes', () => {

		describe('and MainMenu is initially closed', () => {

			it('restores the previous panel', async () => {
				const tabIndex = TabIndex.MAPS;
				const geoResourceId = 'foo';
				const store = setup({
					mainMenu: {
						tabIndex: tabIndex,
						open: false
					},
					featureInfo: {
						pending: [geoResourceId],
						current: [{ title: 'title', content: 'content' }]
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);
				//the following is also needed to arrange the correct setup
				unregisterQueryFor(geoResourceId);
				expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
				expect(store.getState().mainMenu.open).toBeTrue();

				abortOrReset();

				expect(store.getState().mainMenu.tabIndex).toBe(tabIndex);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});

		describe('and MainMenu is initially open', () => {

			it('restores the previous panel', async () => {
				const tabIndex = TabIndex.MAPS;
				const geoResourceId = 'foo';
				const store = setup({
					mainMenu: {
						tabIndex: tabIndex,
						open: true
					},
					featureInfo: {
						pending: [geoResourceId],
						current: [{ title: 'title', content: 'content' }]
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);
				//the following is also needed to arrange the correct setup
				unregisterQueryFor(geoResourceId);
				expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
				expect(store.getState().mainMenu.open).toBeTrue();

				abortOrReset();

				expect(store.getState().mainMenu.tabIndex).toBe(tabIndex);
				expect(store.getState().mainMenu.open).toBeTrue();
			});
		});
	});
});
