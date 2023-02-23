/* eslint-disable no-undef */

import { DevInfo } from '../../../../../src/modules/utils/components/devInfo/DevInfo';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';

window.customElements.define(DevInfo.tag, DevInfo);

describe('DevInfo', () => {
	let store;

	const setup = (config) => {
		const { softwareInfo, runtimeMode } = config;

		store = TestUtils.setupStoreAndDi(
			{},
			{
				modal: modalReducer
			}
		);
		$injector.registerSingleton('ConfigService', {
			getValue: (key) => {
				switch (key) {
					case 'RUNTIME_MODE':
						return runtimeMode;
					case 'SOFTWARE_INFO':
						return softwareInfo;
				}
			}
		});
		return TestUtils.render(DevInfo.tag);
	};

	describe('when initialized', () => {
		it('adds dev-info elements and css classes', async () => {
			const element = await setup({ softwareInfo: '42', runtimeMode: 'development' });

			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.container>ba-button')).toHaveSize(1);
		});

		it('adds nothing when SOFTWARE_INFO property is missing', async () => {
			const element = await setup({ softwareInfo: undefined, runtimeMode: 'development' });

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when button is clicked', () => {
		it('shows a modal window containing the showcase', async () => {
			const element = await setup({ softwareInfo: '42', runtimeMode: 'development' });

			element.shadowRoot.querySelector('ba-button').click();

			expect(store.getState().modal.data.title).toBe('Showcase');
			//we expect a lit-html TemplateResult as content
			expect(store.getState().modal.data.content.strings[0]).toBe('<ba-showcase></ba-showcase>');
		});
	});
});
