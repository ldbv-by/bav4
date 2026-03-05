import { TopicsContentPanelIndex } from '../../../src/store/topicsContentPanel/topicsContentPanel.action';

describe('topicsContentPanelAction', () => {
	it('exports enum TopicsContentPanelIndex', () => {
		expect(Object.entries(TopicsContentPanelIndex).length).toBe(3);
		expect(Object.isFrozen(TopicsContentPanelIndex)).toBeTrue();
		expect(TopicsContentPanelIndex.TOPICS).toBe(0);
		expect(TopicsContentPanelIndex.CATALOG_0).toBe(1);
		expect(TopicsContentPanelIndex.CATALOG_1).toBe(2);
	});
});
