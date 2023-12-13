import { $injector } from '../../../src/injection';
import { AggregateGeoResource, GeoResource, GeoResourceTypes } from '../../../src/domain/geoResources';
import {
	getAttributionForLocallyImportedOrCreatedGeoResource,
	getAttributionProviderForGeoResourceImportedByUrl,
	getBvvAttribution,
	getBvvAttributionForRoutingResult,
	getDefaultAttribution,
	getMinimalAttribution
} from '../../../src/services/provider/attribution.provider';

describe('Attribution provider', () => {
	class GeoResourceImpl extends GeoResource {
		constructor(attribution, id = 'id', label) {
			super(id, label);
			this._attribution = attribution;
		}

		getType() {
			return GeoResourceTypes.VECTOR;
		}
	}

	describe('helper functions', () => {
		it('provides a minimal attribution object', () => {
			const {
				copyright: { label }
			} = getMinimalAttribution('foo');

			expect(label).toBe('foo');
		});
	});

	describe('Bvv GeoResource provider', () => {
		const geoResourceServiceMock = {
			byId: () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('GeoResourceService', geoResourceServiceMock);
		});

		it('provides an attribution for a GeoResource', () => {
			const fooAttribution = getMinimalAttribution('foo');
			const barAttribution = getMinimalAttribution('bar');

			expect(getBvvAttribution(new GeoResourceImpl(null))).toBeNull;
			expect(getBvvAttribution(new GeoResourceImpl(undefined))).toBeNull;
			expect(getBvvAttribution(new GeoResourceImpl(fooAttribution))).toEqual(fooAttribution);
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]))).toEqual(fooAttribution);
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), 1)).toEqual(barAttribution);
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), 0.49)).toEqual(fooAttribution);
			//index higher than attribution length
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), 4)).toBe(barAttribution);
			//index lower than attribution length
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), -1)).toBeNull();
		});

		it('provides an distinct attribution for an AggregatedGeoResource', () => {
			const fooAttribution = getMinimalAttribution('foo');
			const barAttribution = getMinimalAttribution('bar');
			const gr0 = new GeoResourceImpl(fooAttribution, 'gr0').setAttributionProvider(getBvvAttribution);
			const gr1 = new GeoResourceImpl(barAttribution, 'gr1').setAttributionProvider(getBvvAttribution);
			//holds redundant attribution
			const gr2 = new GeoResourceImpl(barAttribution, 'gr2').setAttributionProvider(getBvvAttribution);
			spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
				switch (id) {
					case gr0.id:
						return gr0;
					case gr1.id:
						return gr1;
					case gr2.id:
						return gr2;
					default:
						return null;
				}
			});
			const agr = new AggregateGeoResource('id', 'label', ['gr0', 'gr1', 'gr2', 'unknown']);

			expect(getBvvAttribution(agr)).toEqual([fooAttribution, barAttribution]);
		});
	});

	describe('default GeoResource provider', () => {
		it('provides an attribution for a GeoResource', () => {
			expect(getDefaultAttribution(new GeoResourceImpl(null))).toEqual(getMinimalAttribution(''));
			expect(getDefaultAttribution(new GeoResourceImpl(undefined))).toEqual(getMinimalAttribution(''));
			expect(getDefaultAttribution(new GeoResourceImpl('foo'))).toEqual(getMinimalAttribution('foo'));
			expect(getDefaultAttribution(new GeoResourceImpl(getMinimalAttribution('foo')))).toEqual(getMinimalAttribution('foo'));
		});
	});

	describe('getAttributionForLocallyImportedOrCreatedGeoResource', () => {
		beforeAll(() => {
			$injector.registerSingleton('TranslationService', { translate: (key) => key });
		});

		it('provides an attribution for locally imported dataset', () => {
			const label = 'label';

			expect(getAttributionForLocallyImportedOrCreatedGeoResource(new GeoResourceImpl(undefined, 'id', label))).toEqual({
				description: label,
				copyright: { label: 'global_locally_imported_dataset_copyright_label' }
			});
		});
	});

	describe('getBvvAttributionForRoutingResult', () => {
		it('provides an BVV specific attribution for a routing result', () => {
			const label = 'label';

			expect(getBvvAttributionForRoutingResult(new GeoResourceImpl(undefined, 'id', label))).toEqual({
				description: label,
				copyright: [{ label: 'Bayerische Vermessungsverwaltung' }, { label: 'Powered by Graphhopper', url: 'https://www.graphhopper.com/' }]
			});
		});
	});

	describe('getAttributionProviderForGeoResourceImportedByUrl', () => {
		it('Returns a function returning the actual provider for an URL based dataset imported by the user', () => {
			const label = 'label';
			const url = 'https://foo.bar/some?k=v';

			expect(getAttributionProviderForGeoResourceImportedByUrl(url)(new GeoResourceImpl(undefined, 'id', label))).toEqual({
				description: label,
				copyright: { label: 'foo.bar', url: 'https://foo.bar' }
			});
		});
	});
});
