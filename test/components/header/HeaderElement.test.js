/* eslint-disable no-undef */

import { HeaderElement } from '../../../src/components/header/HeaderElement';
// import { createMockStore } from 'redux-test-utils';
import { createStore } from 'redux';


import { $injector } from '../../../src/injection';


import { TestUtils } from '../../test-utils.js';
window.customElements.define(HeaderElement.tag, HeaderElement);

let mockedStore;

const setupStoreAndDi = () => {

	mockedStore = createStore(() => { }, {});

	const storeService = {
		getStore: function () {
			return mockedStore;
		}
	};


	$injector
		.reset()
		.registerSingleton('StoreService', storeService);
};


describe('HeaderElement', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = HeaderElement.name;

	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	beforeEach(async () => {

		setupStoreAndDi();

		element = await TestUtils.render(HeaderElement.tag);
	});


	describe('when initialized', () => {
		it('adds header css class', () => {

			expect(element.querySelector('.header')).toBeTruthy();

		});

	});

});
