import { TestUtils } from '../../test-utils.js';
import { createMainMenuReducer, createNoInitialStateMainMenuReducer } from '../../../src/store/mainMenu/mainMenu.reducer';
import { open, close, toggle, setTab, focusSearchField } from '../../../src/store/mainMenu/mainMenu.action';
import { TabIds } from '../../../src/domain/mainMenu';

describe('mainMenuReducer', () => {
	const windowMock = {
		matchMedia() {}
	};

	const setup = (mainMenuReducer, state) => {
		return TestUtils.setupStoreAndDi(state, {
			mainMenu: mainMenuReducer
		});
	};

	describe('createMainMenuReducer', () => {
		describe('returns a reducer function', () => {
			it("initializes the store by media query for ORIENTATION 'portrait'", () => {
				spyOn(windowMock, 'matchMedia').withArgs('(max-width: 80em) or (orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true));
				const store = setup(createMainMenuReducer(windowMock));

				expect(store.getState().mainMenu.open).toBeFalse();
				expect(store.getState().mainMenu.tab).toBeNull();
				expect(store.getState().mainMenu.focusSearchField.payload).toBeNull();
			});

			it("initializes the store by media query for ORIENTATION 'landscape'", () => {
				spyOn(windowMock, 'matchMedia').withArgs('(max-width: 80em) or (orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false));
				const store = setup(createMainMenuReducer(windowMock));

				expect(store.getState().mainMenu.open).toBeTrue();
				expect(store.getState().mainMenu.tab).toBeNull();
				expect(store.getState().mainMenu.focusSearchField.payload).toBeNull();
			});

			it('uses the real window as default argument', () => {
				const store = setup(createMainMenuReducer());

				expect(store.getState().mainMenu.open).toMatch(/true|false/);
				expect(store.getState().mainMenu.tab).toBeNull();
				expect(store.getState().mainMenu.focusSearchField.payload).toBeNull();
			});
		});
	});

	describe('createNoInitialStateMediaReducer', () => {
		describe('returns a reducer function', () => {
			it('initializes the store by null', () => {
				const store = setup(createNoInitialStateMainMenuReducer());

				expect(store.getState().mainMenu).toBeNull();
			});
		});
	});

	describe("changes the 'open' property", () => {
		it('sets true', () => {
			const store = setup(createNoInitialStateMainMenuReducer());

			open();

			expect(store.getState().mainMenu.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup(createNoInitialStateMainMenuReducer(), { mainMenu: { open: true } });

			expect(store.getState().mainMenu.open).toBeTrue();

			close();

			expect(store.getState().mainMenu.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup(createNoInitialStateMainMenuReducer(), { mainMenu: { open: true } });

			expect(store.getState().mainMenu.open).toBeTrue();

			toggle();

			expect(store.getState().mainMenu.open).toBeFalse();

			toggle();

			expect(store.getState().mainMenu.open).toBeTrue();
		});
	});

	describe("changes the 'tab' property", () => {
		it('set the tab index', () => {
			const store = setup(createNoInitialStateMainMenuReducer());

			setTab(TabIds.MAPS);
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			setTab(TabIds.MISC);
			expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
		});
	});

	describe("changes the 'focusSearchField' property", () => {
		it('sets a ne EventLike', () => {
			const store = setup(createNoInitialStateMainMenuReducer());

			expect(store.getState().mainMenu).toBeNull();

			focusSearchField();

			expect(store.getState().mainMenu.focusSearchField).not.toBeNull();
		});
	});
});
