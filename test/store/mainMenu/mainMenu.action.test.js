import { TabId } from '../../../src/store/mainMenu/mainMenu.action';

describe('mainMenuAction', () => {
	it('exports a TabId enum', () => {
		expect(Object.keys(TabId).length).toBe(7);
		expect(Object.isFrozen(TabId)).toBeTrue();

		expect(TabId.TOPICS).toBe('topics');
		expect(TabId.MAPS).toBe('maps');
		expect(TabId.MISC).toBe('misc');
		expect(TabId.ROUTING).toBe('routing');
		expect(TabId.SEARCH).toBe('search');
		expect(TabId.FEATUREINFO).toBe('featureinfo');

		expect(TabId.valueOf(0)).toEqual(TabId.TOPICS);
		expect(TabId.valueOf(1)).toEqual(TabId.MAPS);
		expect(TabId.valueOf(2)).toEqual(TabId.SEARCH);
		expect(TabId.valueOf(3)).toEqual(TabId.ROUTING);
		expect(TabId.valueOf(4)).toEqual(TabId.MISC);
		expect(TabId.valueOf(5)).toEqual(TabId.FEATUREINFO);
		expect(TabId.valueOf(6)).toBeNull();
	});
});
