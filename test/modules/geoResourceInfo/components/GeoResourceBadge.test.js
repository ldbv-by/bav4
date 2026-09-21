import { GeoResourceBadgeType, GeoResourceBadge } from '@src/modules/geoResourceInfo/components/GeoResourceBadge';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { WmsGeoResource, GeoResourceFuture, GeoResourceTypes } from '@src/domain/geoResources';

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
			element.geoResourceBadgeTypes = [GeoResourceBadgeType.Type];
			element.size = 42;
			element.color = 'orange';
			element.background = 'green';

			expect(element.geoResourceId).toBe('12345');
			expect(element.geoResourceBadgeTypes).toEqual([GeoResourceBadgeType.Type]);
			expect(element.size).toBe(42);
			expect(element.color).toBe('orange');
			expect(element.background).toBe('green');
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new GeoResourceBadge();

			expect(element.getModel()).toEqual({
				geoResourceId: null,
				geoResourceBadgeTypes: [],
				size: 0.75,
				color: null,
				background: null
			});
		});
	});

	describe('when initialized', () => {
		it('should render nothing when geoResourceId is null', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('has default values when UI is rendered', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			const element = await setup();
			vi.spyOn(geoResourceServiceMock, 'getKeywords').mockReturnValue([{ name: 'FoO' }]);
			vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layers', 'format'));

			element.geoResourceId = geoResourceId;
			element.geoResourceBadgeTypes = [GeoResourceBadgeType.Type, GeoResourceBadgeType.Keywords];
			const badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges).toHaveLength(2);
			// GeoResourceBadgeType.Type Default
			expect(badges[0].size).toBe(0.75);
			expect(badges[0].color).toBe('var(--text-5)');
			expect(badges[0].background).toBe('var(--secondary-bg-color)');

			// GeoResourceBadgeType.Keywords Default
			expect(badges[1].title).toBe('');
			expect(badges[1].size).toBe(0.75);
			expect(badges[1].color).toBe('var(--text-5)');
			expect(badges[1].background).toBe('var(--roles-foo, var(--secondary-color))');
		});
	});

	describe('GeoResourceBadgeTypes', () => {
		it('provides an enum of all available types', () => {
			expect(Object.entries(GeoResourceBadgeType).length).toBe(2);
			expect(Object.isFrozen(GeoResourceBadgeType)).toBe(true);
			expect(GeoResourceBadgeType.Type).toBe('type');
			expect(GeoResourceBadgeType.Keywords).toBe('keywords');
		});
	});

	describe('when geoResource Id and badgeType is set (via property)', () => {
		it('updates the UI', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			const element = await setup();
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceServiceMock, 'byId')
				.mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layers', 'format'));
			const keywordSpy = vi.spyOn(geoResourceServiceMock, 'getKeywords').mockReturnValue([{ name: 'key', description: 'word' }]);

			element.geoResourceId = geoResourceId;
			element.geoResourceBadgeTypes = [GeoResourceBadgeType.Type];
			element.size = 21;
			element.color = 'green';
			element.background = 'black';

			let badges = element.shadowRoot.querySelectorAll('ba-badge');
			expect(badges).toHaveLength(1);
			expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_wms');
			expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_wms');
			expect(badges[0].size).toBe(21);
			expect(badges[0].color).toBe('green');
			expect(badges[0].background).toBe('black');

			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);

			element.geoResourceBadgeTypes = [GeoResourceBadgeType.Keywords];
			badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges[0].label).toBe('key');
			expect(badges[0].title).toBe('word');
			expect(keywordSpy).toHaveBeenCalledWith(geoResourceId);

			element.geoResourceBadgeTypes = [GeoResourceBadgeType.Type, GeoResourceBadgeType.Keywords];
			element.size = 30;
			element.color = 'black';
			element.background = 'green';

			badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges).toHaveLength(2);
			expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_wms');
			expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_wms');
			expect(badges[1].label).toBe('key');
			expect(badges[1].title).toBe('word');

			for (const badge of badges) {
				expect(badge.size).toBe(30);
				expect(badge.color).toBe('black');
				expect(badge.background).toBe('green');
			}

			element.geoResourceBadgeTypes = ['unknown type'];
			badges = element.shadowRoot.querySelectorAll('ba-badge');

			expect(badges).toHaveLength(0);
		});

		describe('GeoResourceFuture that does NOT hold its expected type', () => {
			it('updates th UI', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const element = await setup();
				const geoResourceServiceSpy = vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(new GeoResourceFuture(geoResourceId, () => {}));

				element.geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				element.geoResourceBadgeTypes = [GeoResourceBadgeType.Type];

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
				element.geoResourceBadgeTypes = [GeoResourceBadgeType.Type];

				const badges = element.shadowRoot.querySelectorAll('ba-badge');
				expect(badges).toHaveLength(1);
				expect(badges[0].label).toBe('geoResourceInfo_typeBadge_label_vector');
				expect(badges[0].title).toBe('geoResourceInfo_typeBadge_desc_vector');
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			});
		});
	});
});
