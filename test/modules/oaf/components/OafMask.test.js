import { OafMask } from '../../../../src/modules/oaf/components/OafMask';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(OafMask.tag, OafMask);

describe('OafMask', () => {
	let store = {};

	const importOafServiceMock = {
		getFilterCapabilities: async () => []
	};

	const geoResourceServiceMock = {
		byId: () => {}
	};

	const setup = async (state = {}) => {
		store = TestUtils.setupStoreAndDi(state);
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock).registerSingleton('ImportOafService', importOafServiceMock);

		return TestUtils.render(OafMask.tag);
	};

	describe('when initialized', () => {
		it('renders the ui', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('#queryable-select option')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-oaf-row')).toHaveSize(0);
		});

		it('renders the ui with filters', async () => {
			spyOn(importOafServiceMock, 'getFilterCapabilities').and.returnValue([
				{
					name: 'foo',
					type: 'integer',
					values: [],
					finalList: false
				},
				{
					name: 'bar',
					type: 'string',
					values: ['A'],
					finalList: true
				}
			]);

			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('#queryable-select option')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('ba-oaf-row')).toHaveSize(0);
		});
	});
});
