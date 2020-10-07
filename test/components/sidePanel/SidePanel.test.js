/* eslint-disable no-undef */

import { SidePanel } from '../../../src/components/sidePanel/SidePanel';
import sidePanelReducer from '../../../src/components/sidePanel/store/sidePanel.reducer';
import { TestUtils } from '../../test-utils';
window.customElements.define(SidePanel.tag, SidePanel);


describe('SidePanelElement', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = SidePanel.name;
	});

	afterAll(() => {
		window.classUnderTest = undefined;
	});


	beforeEach(async () => {

		const state = {
			sidePanel: {
				open: true
			}
		};
		TestUtils.setupStoreAndDi(state, { sidePanel: sidePanelReducer });
		element = await TestUtils.render(SidePanel.tag);
	});


	describe('when initialized', () => {
		it('adds a div which holds the sidepanel content and a close icon', () => {
			expect(element.querySelector('.sidePanel').style.width).toBe('410px');
			expect(element.querySelector('.close')).toBeTruthy();
		});

	});
	describe('when close icon clicked', () => {
		it('it closes the sidepanel', () => {
			element.querySelector('.close').click();
			expect(element.querySelector('.sidePanel').style.width).toBe('0px');
		});
	});
});
