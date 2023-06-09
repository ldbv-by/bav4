import { TabIds } from '../../src/domain/mainMenu';

describe('mainMenuAction', () => {
	it('exports a TabId enum', () => {
		expect(Object.keys(TabIds).length).toBe(7);
		expect(Object.isFrozen(TabIds)).toBeTrue();

		expect(TabIds.TOPICS).toBe('topics');
		expect(TabIds.MAPS).toBe('maps');
		expect(TabIds.MISC).toBe('misc');
		expect(TabIds.ROUTING).toBe('routing');
		expect(TabIds.SEARCH).toBe('search');
		expect(TabIds.FEATUREINFO).toBe('featureinfo');

		expect(TabIds.valueOf(0)).toEqual(TabIds.TOPICS);
		expect(TabIds.valueOf(1)).toEqual(TabIds.MAPS);
		expect(TabIds.valueOf(2)).toEqual(TabIds.SEARCH);
		expect(TabIds.valueOf(3)).toEqual(TabIds.ROUTING);
		expect(TabIds.valueOf(4)).toEqual(TabIds.MISC);
		expect(TabIds.valueOf(5)).toEqual(TabIds.FEATUREINFO);
		expect(TabIds.valueOf(6)).toBeNull();
	});
});
