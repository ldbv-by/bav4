import { TestUtils } from '../../../test-utils.js';
import { topicsContentPanelReducer } from '../../../../src/modules/topics/store/topicsContentPanel.reducer.js';
import { setIndex } from '../../../../src/modules/topics/store/topicsContentPanel.action.js';
import { TopicsContentPanelIndex } from '../../../../src/modules/topics/components/menu/TopicsContentPanel.js';


describe('topicsContentPanelReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			topicsPanel: topicsContentPanelReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().topicsPanel.index).toBe(TopicsContentPanelIndex.TOPICS);
	});

	describe('changes the \'catalogLevel\' property', () => {

		it('sets a new Level', () => {
			const store = setup();

			setIndex(TopicsContentPanelIndex.CATALOG_1);

			expect(store.getState().topicsPanel.index).toBe(TopicsContentPanelIndex.CATALOG_1);
		});

	});
});


