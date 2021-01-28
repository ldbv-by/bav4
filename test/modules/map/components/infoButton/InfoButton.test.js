/* eslint-disable no-undef */

import { InfoButton } from '../../../../../src/modules/map/components/infoButton/InfoButton';
import { mapReducer } from '../../../../../src/modules/map/store/olMap.reducer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { Popup } from '../../../../../src/modules/commons/components/popup/Popup';

window.customElements.define(InfoButton.tag, InfoButton);
window.customElements.define(Popup.tag, Popup);


describe('InfoButton', () => {
	let element;

	beforeEach(async () => {

		const state = {
			map: {
			}
		};

		TestUtils.setupStoreAndDi(state, { map: mapReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		element = await TestUtils.render(InfoButton.tag);
	});

	describe('when initialized', () => {
		it('adds a div which shows an info button', async () => {
			expect(element.shadowRoot.querySelector('.info-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.button').title).toBe('map_info_button');						
		});

		it('provides popup content', async () => {
			expect(element.shadowRoot.querySelector('.info-popup-link').getAttribute('href')).toBeDefined();
			expect(element.shadowRoot.querySelectorAll('.info-popup-link').length).toBe(3);
			expect(element.shadowRoot.querySelectorAll('.info-popup-link')[0].getAttribute('href')).toEqual('http://www.ldbv.bayern.de/hilfe.html');
		} );
	});

	describe('when clicked', () => {

		it('opens info popup', () => {
			expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('hide');
			expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeFalse();

			element.shadowRoot.querySelector('.button').click();

			expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('show');
			expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeTrue();
		});
	});

	describe('popup methods', () => {

		it('opens popup with method', () => {
			expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('hide');
			expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeFalse();

			element.shadowRoot.getElementById('info-popup').openPopup();

			expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('show');
			expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeTrue();
		});

		it('closes popup with method', () => {
			element.shadowRoot.getElementById('info-popup').openPopup();

			expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('show');
			expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeTrue();

			element.shadowRoot.getElementById('info-popup').closePopup();

			expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('hide');
			expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeFalse();
		});
	});
});
