import { setIndex, TopicsContentPanelIndex } from '@src/store/topicsContentPanel/topicsContentPanel.action.js';
import { topicsContentPanelReducer } from '@src/store/topicsContentPanel/topicsContentPanel.reducer.js';
import { TestUtils } from '@test/test-utils.js';

describe('topicsContentPanelReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			topicsPanel: topicsContentPanelReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().topicsPanel.index).toBe(TopicsContentPanelIndex.TOPICS);
	});

	describe("changes the 'catalogLevel' property", () => {
		it('sets a new Level', () => {
			const store = setup();

			setIndex(TopicsContentPanelIndex.CATALOG_1);

			expect(store.getState().topicsPanel.index).toBe(TopicsContentPanelIndex.CATALOG_1);
		});
	});
});
