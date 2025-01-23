/* eslint-disable no-undef */

import { $injector } from '../../../../src/injection/index.js';
import { CoordinateInfo } from '../../../../src/modules/commons/components/coordinateInfo/CoordinateInfo.js';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(CoordinateInfo.tag, CoordinateInfo);

describe('CoordinateInfo', () => {
	const mapServiceMock = {
		getCoordinateRepresentations() {},
		getSrid() {}
	};
	const coordinateServiceMock = {
		stringify() {}
	};
	const shareServiceMock = {
		copyToClipboard() {}
	};
	const translationServiceMock = {
		translate: (key) => key
	};
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', translationServiceMock);
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(CoordinateInfo.tag);

			//model
			expect(element.coordinate).toBeNull();
		});
	});
});
