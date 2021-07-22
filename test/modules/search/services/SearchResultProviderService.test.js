/* eslint-disable no-undef */
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults } from '../../../../src/modules/search/services/provider/searchResult.provider';
import { SearchResultProviderService } from '../../../../src/modules/search/services/SearchResultProviderService';
describe('SearchResultProviderService', () => {

	it('provides provider functions for location and georesource search results', () => {

		const locationSearchResultProvider = jasmine.createSpy();
		const georesourceSearchResultProvider = jasmine.createSpy();
		const instanceUnderTest = new SearchResultProviderService(locationSearchResultProvider, georesourceSearchResultProvider);

		instanceUnderTest.getLocationSearchResultProvider()('location');
		instanceUnderTest.getGeoresourceSearchResultProvider()('georesource');

		expect(locationSearchResultProvider).toHaveBeenCalledWith('location');
		expect(georesourceSearchResultProvider).toHaveBeenCalledWith('georesource');
	});

	it('provides the default provider functions for location and georesource search results', () => {
		const instanceUnderTest = new SearchResultProviderService();

		expect(instanceUnderTest.getLocationSearchResultProvider()).toEqual(loadBvvLocationSearchResults);
		expect(instanceUnderTest.getGeoresourceSearchResultProvider()).toEqual(loadBvvGeoResourceSearchResults);
	});
});