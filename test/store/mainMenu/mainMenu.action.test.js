import { TabKey } from '../../../src/store/mainMenu/mainMenu.action';

describe('mainMenuAction', () => {

	it('exports a TabKey enum', () => {
		expect(Object.keys(TabKey).length).toBe(6);
		expect(Object.isFrozen(TabKey)).toBeTrue();

		expect(TabKey.TOPICS).toBe('topics');
		expect(TabKey.MAPS).toBe('maps');
		expect(TabKey.MORE).toBe('more');
		expect(TabKey.ROUTING).toBe('routing');
		expect(TabKey.SEARCH).toBe('search');
		expect(TabKey.FEATUREINFO).toBe('featureinfo');
	});
});
