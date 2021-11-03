import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { TabIndex } from '../../src/store/mainMenu/mainMenu.action';
import { addFeatureInfoItems, clearFeatureInfoItems } from '../../src/store/featureInfo/featureInfo.action.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { MainMenuPlugin } from '../../src/plugins/MainMenuPlugin.js';


describe('MainMenuPlugin', () => {

	const setup = (state) => {

		const initialState = {
			mainMenu: {
				open: true,
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



	describe('when featureInfo.current property changes', () => {

		describe('and MainMenu is initially open', () => {

			it('opens the FeatureInfo panel state', async () => {
				const store = setup();
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });

				expect(store.getState().featureInfo.current).toHaveSize(1);
				expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
				expect(store.getState().mainMenu.open).toBeTrue();

				clearFeatureInfoItems();

				expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.MAPS);
				expect(store.getState().mainMenu.open).toBeTrue();
			});
		});

		describe('and MainMenu is initially closed', () => {

			it('restores the previous panel', async () => {
				const tabIndex = TabIndex.MAPS;
				const store = setup({
					mainMenu: {
						tabIndex: tabIndex,
						open: false
					}
				});
				const instanceUnderTest = new MainMenuPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });


				clearFeatureInfoItems();

				expect(store.getState().mainMenu.tabIndex).toBe(tabIndex);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});
});
