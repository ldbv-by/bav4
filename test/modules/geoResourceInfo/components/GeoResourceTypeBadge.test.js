import { GeoResourceTypeBadge } from '@src/modules/geoResourceInfo/components/GeoResourceTypeBadge';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { WmsGeoResource, GeoResourceFuture, GeoResourceTypes } from '@src/domain/geoResources';
import { expect } from 'vitest';

window.customElements.define(GeoResourceTypeBadge.tag, GeoResourceTypeBadge);

describe('GeoResourceTypeBadge', () => {
	const geoResourceServiceMock = {
		byId() {}
	};

	const setup = () => {
		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock);
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(GeoResourceTypeBadge.tag);
	};

	describe('properties', () => {
		it('provides getters', async () => {
			await setup();
			const element = new GeoResourceTypeBadge();
			element.geoResourceId = '12345';

			expect(element.geoResourceId).toBe('12345');
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new GeoResourceTypeBadge();

			expect(element.getModel()).toEqual({
				geoResourceId: null
			});
		});
	});

	describe('when initialized', () => {
		it('should render nothing when geoResourceId is null', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when geoResource Id is set (via property)', () => {
		it('updates th UI', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			const element = await setup();
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceServiceMock, 'byId')
				.mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layers', 'format'));

			element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

			const badges = element.shadowRoot.querySelectorAll('ba-badge');
			expect(badges).toHaveLength(1);
			expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_wms');
			expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_wms');
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
		});

		describe('GeoResourceFuture that does NOT hold its expected type', () => {
			it('updates th UI', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const element = await setup();
				const geoResourceServiceSpy = vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(new GeoResourceFuture(geoResourceId, () => {}));

				element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

				const badges = element.shadowRoot.querySelectorAll('ba-badge');
				expect(badges).toHaveLength(1);
				expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_future');
				expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_future');
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			});
		});

		describe('for GeoResourceFuture that holds its expected type', () => {
			it('updates th UI', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const element = await setup();
				const geoResourceServiceSpy = vi
					.spyOn(geoResourceServiceMock, 'byId')
					.mockReturnValue(new GeoResourceFuture(geoResourceId, () => {}, GeoResourceTypes.VECTOR));

				element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

				const badges = element.shadowRoot.querySelectorAll('ba-badge');
				expect(badges).toHaveLength(1);
				expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_vector');
				expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_vector');
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			});
		});
	});
});
