/**
 * @module services/provider/oaf_provider
 */
/**
 * BVV specific implementation of {@link module:services/ImportOafService~oafFilterCapabilitiesProvider}
 * @function
 * @type {module:services/ImportOafService~oafFilterCapabilitiesProvider}
 */

import { GeoResourceAuthenticationType, OafGeoResource } from '../../domain/geoResources';
import { MediaType } from '../../domain/mediaTypes';
import { $injector } from '../../injection/index';

// eslint-disable-next-line no-unused-vars
export const bvvOafFilterCapabilitiesProvider = async (oafGeoResource) => {
	return {
		totalNumberOfItems: 1000,
		crs: [
			'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
			'http://www.opengis.net/def/crs/EPSG/0/3857',
			'http://www.opengis.net/def/crs/EPSG/0/25832',
			'http://www.opengis.net/def/crs/EPSG/0/4258',
			'http://www.opengis.net/def/crs/EPSG/0/4326'
		],
		sampled: true,
		queryables: [
			{
				name: 'node_id',
				type: 'integer',
				values: [],
				finalized: false
			},
			{
				name: 'id',
				type: 'integer',
				values: [],
				finalized: false
			},
			{
				name: 'name',
				type: 'string',
				values: [
					'Gasthof Pension Strohmaier',
					'Haller-Alm',
					'Am Guldensteig',
					'Racheldiensthütte',
					'Baggerloch',
					'Gasthof zur Post',
					'Dorfbiergarten Stark',
					'Waldheim',
					'Lutzgarten',
					'Zur Schnecke',
					'Innbräu-Biergarten',
					'Seehaus Schreyegg',
					'Alter Wirt Krailling',
					'Altenmarkter Hof',
					'Wodans Biergarten',
					'Biergarten zur alten Münzpräge',
					'Biergarten Zum Schiffmeister',
					'Biergarten Cafe Waldstein',
					'Albrechtsgarten',
					'Wirts Kathi'
				],
				finalized: false
			},
			{
				name: 'strasse',
				type: 'string',
				values: [
					'Nebelhornstraße 16',
					'Jamnitzerstraße 5',
					'Lusenstraße 48',
					'Nawiaskystraße 18',
					'Tegernseer Platz 12',
					'Abacostraße 11',
					'Dorfstraße 22',
					'Tegelbergstraße 2',
					'Aberlestraße 15',
					'Jakob-Klar-Straße 1',
					'Abensbergstraße 6',
					'Abacostraße 5',
					'Naupliastraße 17',
					'Aaröstraße 14',
					'Nawiaskystraße 9',
					'Jochensteiner Straße 5',
					'Seestraße 34',
					'Nederlinger Platz 20',
					'Teisendorfer Straße 14',
					'Jasminstraße 9'
				],
				finalized: false
			},
			{
				name: 'plz',
				type: 'integer',
				values: [81247, 94556, 94160, 94130, 83471],
				finalized: false,
				minValue: 81247,
				maxValue: 94556
			},
			{
				name: 'ort',
				type: 'string',
				values: ['München', 'Neuschönau', 'Ringelai', 'Obernzell', 'Schönau am Königssee'],
				finalized: false
			},
			{
				name: 'outdoor_seating',
				type: 'boolean',
				values: [false, true],
				finalized: false
			},
			{
				name: 'open',
				type: 'string',
				values: ['11:30:00', '09:30:00', '10:30:00', '10:00:00', '09:00:00', '11:00:00'],
				finalized: false
			},
			{
				name: 'close',
				type: 'string',
				values: ['21:30:00', '22:00:00', '22:30:00', '20:00:00', '23:00:00', '23:30:00'],
				finalized: false
			},
			{
				name: 'geom',
				type: 'geometry-point',
				values: [],
				finalized: false
			}
		]
	};
};

/**
 * BVV specific implementation of {@link module:services/ImportOafService~oafGeoResourceProvider}
 * @function
 * @type {module:services/ImportOafService~oafGeoResourceProvider}
 */
export const bvvOafGeoResourceProvider = async (url, options) => {
	const { isAuthenticated } = options;
	const {
		HttpService: httpService,
		ConfigService: configService,
		ProjectionService: projectionService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'ProjectionService', 'BaaCredentialService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'oaf/getCollections';

	const getAuthenticationType = (isBaaAuthenticated) => {
		return isBaaAuthenticated ? GeoResourceAuthenticationType.BAA : null;
	};

	const toOafGeoResource = (oafCollection, index) => {
		// we need the base URL of the OAF service
		const oafUrl = oafCollection.url.split('collections')[0];
		return new OafGeoResource(
			options.ids[index] ?? `${oafUrl}||${oafCollection.id}`,
			oafCollection.title,
			oafUrl,
			oafCollection.id,
			oafCollection.crs
		)
			.setLimit(oafCollection.totalNumberOfItems)
			.setAuthenticationType(getAuthenticationType(options.isAuthenticated));
	};

	const readCollections = (oafCollections) => {
		return (
			oafCollections
				.filter((collection) => projectionService.getProjections().includes(collection.crs))
				// we filter unwanted layers (if defined by OafImportOptions)
				.filter((collection) => (options.collections.length ? options.collections.includes(collection.id) : true))
				.map((collection, index) => toOafGeoResource(collection, index))
		);
	};

	const getCredentialOrFail = (url) => {
		const failed = () => {
			throw new Error(`Import of OAF service failed. Credential for '${url}' not found`);
		};

		const credential = baaCredentialService.get(url);
		return credential ? { username: credential.username, password: credential.password } : failed();
	};

	const data = isAuthenticated ? { url, ...getCredentialOrFail(url) } : { url };
	const result = await httpService.post(endpointUrl, JSON.stringify(data), MediaType.JSON);
	switch (result.status) {
		case 200:
			return readCollections(await result.json());
		case 404:
			return [];
		default:
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	}
};
