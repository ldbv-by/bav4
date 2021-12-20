import { TabKey } from '../../../src/store/mainMenu/mainMenu.action';

describe('mainMenuAction', () => {

	it('exports a TabKey enum', () => {
		expect(Object.keys(TabKey).length).toBe(6);
		expect(Object.isFrozen(TabKey)).toBeTrue();

		expect(TabKey.TOPICS).toBe('0');
		expect(TabKey.MAPS).toBe('1');
		expect(TabKey.MORE).toBe('2');
		expect(TabKey.ROUTING).toBe('3');
		expect(TabKey.SEARCH).toBe('4');
		expect(TabKey.FEATUREINFO).toBe('5');
	});
});
