/* eslint-disable no-undef */

import { SidePanelElement } from '../../../src/components/sidePanel/SidePanelElement';
import uiReducer from '../../../src/store/ui/reducer';
import { TestUtils } from '../../test-utils';
window.customElements.define(SidePanelElement.tag, SidePanelElement);


describe('SidePanelElement', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = SidePanelElement.name;
	});

	afterAll(() => {
		window.classUnderTest = undefined;
	});


	beforeEach(async () => {

		const state = {
			ui: {
				sidePanel: {
					open: true
				}
			}
		};
		TestUtils.setupStoreAndDi(state, { ui: uiReducer });
		element = await TestUtils.render(SidePanelElement.tag);
	});


	describe('when initialized', () => {
		it('adds a div which holds the sidepanel content and a close icon', async () => {
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
