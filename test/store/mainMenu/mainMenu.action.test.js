import { TabIndex } from '../../../src/store/mainMenu/mainMenu.action';

describe('mainMenuAction', () => {

	it('exports a TabIndex enum', () => {
		expect(Object.keys(TabIndex).length).toBe(6);
		expect(Object.isFrozen(TabIndex)).toBeTrue();

		expect(TabIndex.TOPICS).toBe(0);
		expect(TabIndex.MAPS).toBe(1);
		expect(TabIndex.MORE).toBe(2);
		expect(TabIndex.ROUTING).toBe(3);
		expect(TabIndex.SEARCH).toBe(4);
		expect(TabIndex.FEATUREINFO).toBe(5);
	});
});
