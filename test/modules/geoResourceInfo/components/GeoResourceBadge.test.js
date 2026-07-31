import { GeoResourceBadge } from '@src/modules/geoResourceInfo/components/GeoResourceBadge';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { GeoResourceBadgeType, WmsGeoResource, GeoResourceFuture, GeoResourceTypes } from '@src/domain/geoResources';

import { expect } from 'vitest';

window.customElements.define(GeoResourceBadge.tag, GeoResourceBadge);

describe('GeoResourceBadge', () => {
	const geoResourceServiceMock = {
		byId: () => {},
		getKeywords: () => []
	};

	const setup = () => {
		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock);
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(GeoResourceBadge.tag);
	};

	describe('properties', () => {
		it('provides getters', async () => {
			await setup();
			const element = new GeoResourceBadge();
			element.geoResourceId = '12345';
			element.geoResourceBadgeTypes = [GeoResourceBadgeType.MapType];

			expect(element.geoResourceId).toBe('12345');
			expect(element.geoResourceBadgeTypes).toEqual([GeoResourceBadgeType.MapType]);
			expect(element.clickAction).toBe(null);
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new GeoResourceBadge();

			expect(element.getModel()).toEqual({
				geoResourceId: null,
				geoResourceBadgeTypes: []
			});
		});
	});

	describe('when initialized', () => {
		it('should render nothing when geoResourceId is null', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when geoResource Id and badgeType is set (via property)', () => {
		it('updates th UI', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			const element = await setup();
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceServiceMock, 'byId')
				.mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layers', 'format'));
			const keywordSpy = vi.spyOn(geoResourceServiceMock, 'getKeywords').mockReturnValue([{ name: 'key', description: 'word' }]);

			element.geoResourceId = geoResourceId;
			element.geoResourceBadgeTypes = [GeoResourceBadgeType.MapType];

			let badges = element.shadowRoot.querySelectorAll('ba-badge');
			expect(badges).toHaveLength(1);
			expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_wms');
			expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_wms');
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);

			element.geoResourceBadgeTypes = [GeoResourceBadgeType.Keyword];
			badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges[0].label).toBe('key');
			expect(badges[0].title).toBe('word');
			expect(keywordSpy).toHaveBeenCalledWith(geoResourceId);

			element.geoResourceBadgeTypes = [GeoResourceBadgeType.MapType, GeoResourceBadgeType.Keyword];
			badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges).toHaveLength(2);
			expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_wms');
			expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_wms');
			expect(badges[1].label).toBe('key');
			expect(badges[1].title).toBe('word');

			element.geoResourceBadgeTypes = ['unknown type'];
			badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges).toHaveLength(0);
		});

		it('calls a function when badge is clicked', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			const element = await setup();
			vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layers', 'format'));
			const mockClickAction = vi.fn();

			element.geoResourceId = geoResourceId;
			element.geoResourceBadgeTypes = [GeoResourceBadgeType.MapType];
			const badge = element.shadowRoot.querySelector('ba-badge');

			badge.click();
			expect(element.clickAction).toBe(null);

			element.clickAction = mockClickAction;
			badge.click();
			expect(mockClickAction).toHaveBeenCalledWith(element, 'geoResourceInfo_typeBadge_label_wms', 'geoResourceInfo_typeBadge_desc_wms');
		});

		describe('GeoResourceFuture that does NOT hold its expected type', () => {
			it('updates th UI', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const element = await setup();
				const geoResourceServiceSpy = vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(new GeoResourceFuture(geoResourceId, () => {}));

				element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				element.geoResourceBadgeTypes = [GeoResourceBadgeType.MapType];

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
				element.geoResourceBadgeTypes = [GeoResourceBadgeType.MapType];

				const badges = element.shadowRoot.querySelectorAll('ba-badge');
				expect(badges).toHaveLength(1);
				expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_vector');
				expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_vector');
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			});
		});
	});
});
