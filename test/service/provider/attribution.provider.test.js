import { GeoResource } from '../../../src/services/domain/geoResources';
import { getBvvAttribution, getDefaultAttribution, getMinimalAttribution } from '../../../src/services/provider/attributionProvider';

describe('Attribution provider', () => {

	class GeoResourceImpl extends GeoResource {
		constructor(attribution) {
			super('id');
			this._attribution = attribution;
		}
	}

	describe('helper functions', () => {

		it('provides a minimal attribution object', () => {

			const { copyright: { label } } = getMinimalAttribution('foo');

			expect(label).toBe('foo');
		});
	});

	describe('Bvv GeoResource provider', () => {
		
		it('provides an arribution for a GeoResources', () => {

			const fooAttribution = getMinimalAttribution('foo');
			const barAttribution = getMinimalAttribution('bar');

			expect(getBvvAttribution(new GeoResourceImpl(null))).toBeNull;
			expect(getBvvAttribution(new GeoResourceImpl(undefined))).toBeNull;
			expect(getBvvAttribution(new GeoResourceImpl(fooAttribution))).toEqual(fooAttribution);
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]))).toEqual(fooAttribution);
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), 1)).toEqual(barAttribution);
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), 2)).toBeNull();
			expect(getBvvAttribution(new GeoResourceImpl([fooAttribution, barAttribution]), 0.49)).toEqual(fooAttribution);
		});
	});

	describe('default GeoResource provider', () => {

		it('provides an attribution for a GeoResources', () => {

			expect(getDefaultAttribution(new GeoResourceImpl(null))).toEqual(getMinimalAttribution(''));
			expect(getDefaultAttribution(new GeoResourceImpl(undefined))).toEqual(getMinimalAttribution(''));
			expect(getDefaultAttribution(new GeoResourceImpl('foo'))).toEqual(getMinimalAttribution('foo'));
		});
	});
});
