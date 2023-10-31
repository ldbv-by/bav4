/**
 * @module services/provider/routingCategories_provider
 */
import { $injector } from '../../injection/index';

/**
 * Bvv specific implementation of {@link module:services/RoutingService~routingCategoriesProvider}
 * @function
 * @type {module:services/RoutingService~routingCategoriesProvider}
 */
export const bvvRoutingCategoriesProvider = async () => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	const lang = configService.getValue('DEFAULT_LANG');
	const hike = {
		id: 'hike',
		label: lang === 'de' ? 'Wandern' : 'Hiking',
		description: lang === 'de' ? 'Wandern auf der gewöhnlich schnellsten Route' : 'Hike on the usually fastest route',
		color: 'gray',
		borderColor: 'red',
		subcategories: []
	};
	const bvv_hike = {
		id: 'bvv-hike',
		label: lang === 'de' ? 'Wandern (Freizeitwege)' : 'Hiking (BVV Freizeitwege)',
		description: lang === 'de' ? 'Wandern möglichst auf offiziellen Wanderwegen' : 'Hike on "BVV Freizeitwege" tracks where possible',
		color: 'red',
		borderColor: 'gray',
		subcategories: [hike]
	};
	const bayernnetzBike = {
		id: 'bayernnetz-bike',
		label: lang === 'de' ? 'Fahrrad (Bayernnetz)' : 'Bicycle (Bayernnetz)',
		description: lang === 'de' ? 'Fahrradfahren möglichst auf Wegen des Bayernnetzes' : 'Ride a bicycle on "Bayernnetz" tracks where possible',
		color: 'blue',
		borderColor: 'gray',
		subcategories: []
	};
	const bike = {
		id: 'bike',
		label: lang === 'de' ? 'Fahrrad' : 'Bicycle',
		description: lang === 'de' ? 'Fahrradfahren auf der gewöhnlich schnellsten Route' : 'Ride a bicycle on the usually fastest route',
		color: 'gray',
		borderColor: 'green',
		zIndex: 1,
		subcategories: []
	};
	const bvv_bike = {
		id: 'bvv-bike',
		label: lang === 'de' ? 'Fahrrad (Freizeitwege)' : 'Bicycle (BVV Freizeitwege)',
		description:
			lang === 'de' ? 'Fahrradfahren möglichst auf offiziellen Freizeitwegen' : 'Ride a bicycle on "BVV Freizeitwege" tracks where possible',
		color: 'green',
		borderColor: 'gray',
		subcategories: [bike, bayernnetzBike]
	};
	const mtb = {
		id: 'mtb',
		label: lang === 'de' ? 'Mountainbike' : 'Mountain bike',
		description: lang === 'de' ? 'Mountainbiken auf der gewöhnlich schnellsten Route' : 'Ride a mountain bike on the usually fastest route',
		color: 'gray',
		borderColor: 'SpringGreen',
		subcategories: []
	};
	const bvv_mtb = {
		id: 'bvv-mtb',
		label: lang === 'de' ? 'Mountainbike (Freizeitwege)' : 'Mountain bike (Freizeitwege)',
		description:
			lang === 'de' ? 'Mountainbiken möglichst auf offiziellen Freizeitwegen' : 'Ride a mountain bike on "BVV Freizeitwege" tracks where possible',
		color: 'SpringGreen',
		borderColor: 'gray',
		subcategories: [mtb]
	};
	const race = {
		id: 'racingbike',
		label: lang === 'de' ? 'Rennrad' : 'Racing bike',
		description: lang === 'de' ? 'Rennradfahren auf der gewöhnlich schnellsten Route' : 'Ride a racing bike on the usually fastest route',
		color: 'gray',
		borderColor: 'purple',
		subcategories: []
	};

	return [bvv_hike, bvv_bike, bvv_mtb, race];
};
