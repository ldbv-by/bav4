import { ViewMode } from '@src/domain/view';
import { viewReducer } from '@src/store/view/view.reducer';
import { setViewMode } from '@src/store/view/view.action';
import { TestUtils } from '@test/test-utils.js';

describe('viewReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			view: viewReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().view.mode).toEqual(ViewMode.D2);
	});

	it("changes the 'mode' property", () => {
		const store = setup();

		setViewMode(ViewMode.D2);
		expect(store.getState().view.mode).toEqual(ViewMode.D2);
		setViewMode(ViewMode.D3);
		expect(store.getState().view.mode).toEqual(ViewMode.D3);
		setViewMode(ViewMode.D2);
		expect(store.getState().view.mode).toEqual(ViewMode.D2);
	});
});
