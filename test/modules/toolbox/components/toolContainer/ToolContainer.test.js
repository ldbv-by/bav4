/* eslint-disable no-undef */

import { ToolContainer } from '../../../../../src/modules/toolbox/components/toolContainer/ToolContainer';
import { toolContainerReducer } from '../../../../../src/modules/toolbox/store/toolContainer.reducer';
import { toggleToolContainer } from '../../../../../src/modules/toolbox/store/toolContainer.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ToolContainer.tag, ToolContainer);


describe('ToolContainer', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = async (config = {}) => {

		const { embed = false } = config;

		const state = {
			toolBox: {
				open: true
			}
		};

		TestUtils.setupStoreAndDi(state, { toolContainer: toolContainerReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})			
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });
		return TestUtils.render(ToolContainer.tag);
	};


	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('adds a div which holds the container', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.container')).toBeTruthy();			
		});

		it('opens the toolcontainer', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('.content.is-open')).toBeFalsy();
			toggleToolContainer();
			expect(element.shadowRoot.querySelector('.content.is-open')).toBeTruthy();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('responsive layout ', () => {

		it('layouts for landscape desktop', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();			
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for landscape tablet', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();			
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait desktop', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();			
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait tablet', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content')).toBeTruthy();			
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});
});
