import { html } from 'lit-html';
import { $injector } from '../../../../src/injection';
import { AdminUI } from '../../../../src/modules/admin/components/AdminUI';
import { TestUtils } from '../../../test-utils';
window.customElements.define(AdminUI.tag, AdminUI);

describe('AdminUI', () => {
	const adminCatalogServiceMock = {
		// eslint-disable-next-line no-unused-vars
		getTopics: async () => {
			return [];
		},
		getGeoResources: async () => {
			return [];
		}
	};

	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector
			.registerSingleton('TranslationService', { translate: (key, params) => html`${key}${params[0] ?? ''}` })
			.registerSingleton('AdminCatalogService', adminCatalogServiceMock);
		return TestUtils.render(AdminUI.tag);
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminUI();

			expect(element.getModel()).toEqual({
				topics: [],
				geoResources: []
			});
		});
	});
});
