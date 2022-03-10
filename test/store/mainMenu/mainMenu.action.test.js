import { TabId } from '../../../src/store/mainMenu/mainMenu.action';

describe('mainMenuAction', () => {

	it('exports a TabId enum', () => {
		expect(Object.keys(TabId).length).toBe(6);
		expect(Object.isFrozen(TabId)).toBeTrue();

		expect(TabId.TOPICS).toBe('topics');
		expect(TabId.MAPS).toBe('maps');
		expect(TabId.MISC).toBe('misc');
		expect(TabId.ROUTING).toBe('routing');
		expect(TabId.SEARCH).toBe('search');
		expect(TabId.FEATUREINFO).toBe('featureinfo');
	});
});
