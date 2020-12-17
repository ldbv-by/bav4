/* eslint-disable no-undef */

import { DevInfo } from '../../../../../src/components/utils/dev/devInfo/DevInfo';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(DevInfo.tag, DevInfo);


describe('DevInfo', () => {

	const setup = (config) => {
		const { portrait, softwareInfo, runtimeMode } = config;

		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('EnvironmentService', {
			getScreenOrientation: () => {
				return { portrait: portrait };
			}
		});
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
		it('adds dev-info elements and css classes for portrait', async () => {

			const element = await setup({ portrait: false, softwareInfo: '42', runtimeMode: 'development' });

			expect(element.shadowRoot.querySelector('.container.container-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.container').innerHTML.includes('42')).toBeTrue();
		});
		
		it('adds dev-info elements and css classes for landscape', async () => {

			const element = await setup({ portrait: true, softwareInfo: '42', runtimeMode: 'development' });

			expect(element.shadowRoot.querySelector('.container.container-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.container').innerHTML.includes('42')).toBeTrue();
		});

		it('adds nothing when SOFTWARE_INFO property is missing', async () => {

			const element = await setup({ portrait: true, softwareInfo: undefined, runtimeMode: 'development' });

			expect(element.shadowRoot.querySelector('.container')).toBeFalsy();
		});
	});

});