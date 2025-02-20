import { TabIds } from '../../src/domain/mainMenu';

describe('mainMenuAction', () => {
	it('exports a TabId enum', () => {
		expect(Object.keys(TabIds).length).toBe(7);
		expect(Object.isFrozen(TabIds)).toBeTrue();

		expect(TabIds.TOPICS).toBe(0);
		expect(TabIds.MAPS).toBe(1);
		expect(TabIds.SEARCH).toBe(2);
		expect(TabIds.ROUTING).toBe(3);
		expect(TabIds.MISC).toBe(4);
		expect(TabIds.FEATUREINFO).toBe(5);
		expect(TabIds.LEGEND).toBe(6);
	});
});
