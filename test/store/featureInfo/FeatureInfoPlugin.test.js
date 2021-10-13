import { TestUtils } from '../../test-utils.js';
import { createNoInitialStateMainMenuReducer } from '../../../src/modules/menu/store/mainMenu.reducer';
import { featureInfoReducer } from '../../../src/store/featureInfo/featureInfo.reducer';
import { pointerReducer } from '../../../src/modules/map/store/pointer.reducer';
import { FeatureInfoPlugin } from '../../../src/store/featureInfo/FeatureInfoPlugin';
import { setClick } from '../../../src/modules/map/store/pointer.action';
import { TabIndex } from '../../../src/modules/menu/store/mainMenu.action';
import { clear } from '../../../src/store/featureInfo/featureInfo.action.js';


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

	describe('mainMenu initially opened', () => {

		it('adds a FeatureInfo item and changes the mainMenu state', async () => {
			const store = setup();
			const instanceUnderTest = new FeatureInfoPlugin();
			await instanceUnderTest.register(store);

			setClick({ coordinate: [11, 22], screenCoordinate: [33, 44] });

			expect(store.getState().featureInfo.current.length).toBe(1);
			expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
			expect(store.getState().mainMenu.open).toBeTrue();

			clear();

			expect(store.getState().mainMenu.tabIndex).toBe(2);
			expect(store.getState().mainMenu.open).toBeTrue();
		});
	});

	describe('mainMenu initially closed', () => {

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
			expect(store.getState().mainMenu.tabIndex).toBe(TabIndex.FEATUREINFO);
			expect(store.getState().mainMenu.open).toBeTrue();

			clear();

			expect(store.getState().mainMenu.tabIndex).toBe(2);
			expect(store.getState().mainMenu.open).toBeFalse();
		});
	});
});
