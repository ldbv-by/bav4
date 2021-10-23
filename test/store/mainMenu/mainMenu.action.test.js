import { MainMenuTabIndex } from '../../../src/modules/menu/components/mainMenu/MainMenu';
import { TabIndex } from '../../../src/store/mainMenu/mainMenu.action';

describe('mainMenuAction', () => {

	it('exports a TabIndex enum', () => {
		expect(Object.keys(TabIndex).length).toBe(6);
		expect(Object.isFrozen(TabIndex)).toBeTrue();

		expect(TabIndex.TOPICS).toBe(MainMenuTabIndex.TOPICS.id);
		expect(TabIndex.MAPS).toBe(MainMenuTabIndex.MAPS.id);
		expect(TabIndex.MORE).toBe(MainMenuTabIndex.MORE.id);
		expect(TabIndex.ROUTING).toBe(MainMenuTabIndex.ROUTING.id);
		expect(TabIndex.SEARCH).toBe(MainMenuTabIndex.SEARCH.id);
		expect(TabIndex.FEATUREINFO).toBe(MainMenuTabIndex.FEATUREINFO.id);
	});
});
