import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { setClick } from '../../src/store/pointer/pointer.action';
import { setTabIndex, TabIndex } from '../../src/store/mainMenu/mainMenu.action';
import { addFeatureInfoItems, clearFeatureInfoItems } from '../../src/store/featureInfo/featureInfo.action.js';
import { FeatureInfoPlugin } from '../../src/plugins/FeatureInfoPlugin.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer.js';


describe('FeatureInfoPlugin', () => {

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
			featureInfo: featureInfoReducer,
			pointer: pointerReducer
		});
		return store;
	};

	describe('when pointer.click property changes', () => {

		it('clears all previous existing featureInfo items and updates the coordinate property', async () => {
			const coordinate = [11, 22];
			const store = setup();
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);
			addFeatureInfoItems({ title: 'title', content: 'content' });

			setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

			expect(store.getState().featureInfo.current).toHaveSize(0);
			expect(store.getState().featureInfo.coordinate.payload).toBe(coordinate);
		});
	});

	describe('when featureInfo.current property changes', () => {

		describe('and MainMenu is initially open', () => {

			it('opens the FeatureInfo panel state', async () => {
				const store = setup();
				const instanceUnderTest = new FeatureInfoPlugin();
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
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);
				addFeatureInfoItems({ title: 'title', content: 'content' });


				clearFeatureInfoItems();

				expect(store.getState().mainMenu.tabIndex).toBe(tabIndex);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});


	describe('when mainMenu.tabIndex changes', () => {

		it('clears all previous existing featureInfo items (also initially)', async () => {
			const store = setup({
				mainMenu: {
					tabIndex: TabIndex.MAPS,
					open: false
				},
				featureInfo: {
					current: [{ title: 'foo0', content: 'bar0' }, { title: 'foo1', content: 'bar1' }]
				}
			});
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);


			//should be cleared also initially
			expect(store.getState().featureInfo.current).toHaveSize(0);

			addFeatureInfoItems({ title: 'title', content: 'content' });

			setTabIndex(TabIndex.MAPS);

			expect(store.getState().featureInfo.current).toHaveSize(0);

			addFeatureInfoItems({ title: 'title', content: 'content' });

			setTabIndex(TabIndex.FEATUREINFO);

			expect(store.getState().featureInfo.current).toHaveSize(1);
		});
	});
});
