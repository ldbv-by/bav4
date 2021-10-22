import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { setClick } from '../../src/store/pointer/pointer.action';
import { setTabIndex, TabIndex } from '../../src/store/mainMenu/mainMenu.action';
import { clear } from '../../src/store/featureInfo/featureInfo.action.js';
import { FeatureInfoPlugin } from '../../src/plugins/FeatureInfoPlugin.js';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer.js';


describe('FeatureInfoPlugin', () => {

	const setup = (state) => {

		const initialState = {
			mainMenu: {
				open: true,
				tabIndex: 2
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

	describe('when pointer click property changes', () => {

		it('clears all previous existing featureInfo items', async () => {
			const store = setup({
				featureInfo: {
					current: [{ title: 'foo0', content: 'bar0' }, { title: 'foo1', content: 'bar1' }]
				}
			});
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);

			setClick({ coordinate: [11, 22], screenCoordinate: [33, 44] });

			expect(store.getState().featureInfo.current.length).toBe(1);
		});

		describe('and mainMenu is initially open', () => {

			it('adds a FeatureInfo item and changes the mainMenu state', async () => {
				const store = setup();
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);

				setClick({ coordinate: [11, 22], screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.current.length).toBe(1);
				expect(store.getState().featureInfo.coordinate.payload).toEqual([11, 22]);
				expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
				expect(store.getState().mainMenu.open).toBeTrue();

				clear();

				expect(store.getState().mainMenu.tabIndex).toBe(2);
				expect(store.getState().mainMenu.open).toBeTrue();
			});
		});

		describe('and mainMenu initially closed', () => {

			it('adds a FeatureInfo item and changes the mainMenu state', async () => {
				const store = setup({
					mainMenu: {
						tabIndex: 2,
						open: false
					}
				});
				const instanceUnderTest = new FeatureInfoPlugin();
				await instanceUnderTest.register(store);

				setClick({ coordinate: [11, 22], screenCoordinate: [33, 44] });

				expect(store.getState().featureInfo.current.length).toBe(1);
				expect(store.getState().featureInfo.coordinate.payload).toEqual([11, 22]);
				expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
				expect(store.getState().mainMenu.open).toBeTrue();

				clear();

				expect(store.getState().mainMenu.tabIndex).toBe(2);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});


	describe('when tabIndex changes', () => {

		it('adds a FeatureInfo item and changes the mainMenu state', async () => {
			const store = setup({
				mainMenu: {
					tabIndex: 2,
					open: false
				}
			});
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);

			setClick({ coordinate: [11, 22], screenCoordinate: [33, 44] });

			expect(store.getState().featureInfo.current.length).toBe(1);

			setTabIndex(TabIndex.MAPS);

			expect(store.getState().featureInfo.current.length).toBe(0);
		});
	});
});
