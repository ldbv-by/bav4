import { $injector } from '../../../src/injection';
import { bvvRoutingCategoriesProvider } from '../../../src/services/provider/routingCategories.provider';

describe('bvvRoutingCategoriesProvider', () => {
	const configService = {
		getValue: () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService);
	});

	afterEach(() => {
		$injector.reset();
	});

	it('returns routing categories for "de"', async () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');

		const hike = {
			id: 'hike',
			label: 'Wandern',
			description: 'Wandern auf der gewöhnlich schnellsten Route',
			color: 'gray',
			borderColor: 'red',
			subcategories: []
		};
		const bvv_hike = {
			id: 'bvv-hike',
			label: 'Wandern (Freizeitwege)',
			description: 'Wandern möglichst auf offiziellen Wanderwegen',
			color: 'red',
			borderColor: 'gray',
			subcategories: [hike]
		};
		const bayernnetzBike = {
			id: 'bayernnetz-bike',
			label: 'Fahrrad (Bayernnetz)',
			description: 'Fahrradfahren möglichst auf Wegen des Bayernnetzes',
			color: 'blue',
			borderColor: 'gray',
			subcategories: []
		};
		const bike = {
			id: 'bike',
			label: 'Fahrrad',
			description: 'Fahrradfahren auf der gewöhnlich schnellsten Route',
			color: 'gray',
			borderColor: 'green',
			zIndex: 1,
			subcategories: []
		};
		const bvv_bike = {
			id: 'bvv-bike',
			label: 'Fahrrad (Freizeitwege)',
			description: 'Fahrradfahren möglichst auf offiziellen Freizeitwegen',
			color: 'green',
			borderColor: 'gray',
			subcategories: [bike, bayernnetzBike]
		};
		const mtb = {
			id: 'mtb',
			label: 'Mountainbike',
			description: 'Mountainbiken auf der gewöhnlich schnellsten Route',
			color: 'gray',
			borderColor: 'SpringGreen',
			subcategories: []
		};
		const bvv_mtb = {
			id: 'bvv-mtb',
			label: 'Mountainbike (Freizeitwege)',
			description: 'Mountainbiken möglichst auf offiziellen Freizeitwegen',
			color: 'SpringGreen',
			borderColor: 'gray',
			subcategories: [mtb]
		};
		const race = {
			id: 'racingbike',
			label: 'Rennrad',
			description: 'Rennradfahren auf der gewöhnlich schnellsten Route',
			color: 'gray',
			borderColor: 'purple',
			subcategories: []
		};

		const expected = [bvv_hike, bvv_bike, bvv_mtb, race];

		await expectAsync(bvvRoutingCategoriesProvider()).toBeResolvedTo(expected);
	});

	it('returns routing categories for other languages', async () => {
		spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');

		const hike = {
			id: 'hike',
			label: 'Hiking',
			description: 'Hike on the usually fastest route',
			color: 'gray',
			borderColor: 'red',
			subcategories: []
		};
		const bvv_hike = {
			id: 'bvv-hike',
			label: 'Hiking (BVV Freizeitwege)',
			description: 'Hike on "BVV Freizeitwege" tracks where possible',
			color: 'red',
			borderColor: 'gray',
			subcategories: [hike]
		};
		const bayernnetzBike = {
			id: 'bayernnetz-bike',
			label: 'Bicycle (Bayernnetz)',
			description: 'Ride a bicycle on "Bayernnetz" tracks where possible',
			color: 'blue',
			borderColor: 'gray',
			subcategories: []
		};
		const bike = {
			id: 'bike',
			label: 'Bicycle',
			description: 'Ride a bicycle on the usually fastest route',
			color: 'gray',
			borderColor: 'green',
			zIndex: 1,
			subcategories: []
		};
		const bvv_bike = {
			id: 'bvv-bike',
			label: 'Bicycle (BVV Freizeitwege)',
			description: 'Ride a bicycle on "BVV Freizeitwege" tracks where possible',
			color: 'green',
			borderColor: 'gray',
			subcategories: [bike, bayernnetzBike]
		};
		const mtb = {
			id: 'mtb',
			label: 'Mountain bike',
			description: 'Ride a mountain bike on the usually fastest route',
			color: 'gray',
			borderColor: 'SpringGreen',
			subcategories: []
		};
		const bvv_mtb = {
			id: 'bvv-mtb',
			label: 'Mountain bike (Freizeitwege)',
			description: 'Ride a mountain bike on "BVV Freizeitwege" tracks where possible',
			color: 'SpringGreen',
			borderColor: 'gray',
			subcategories: [mtb]
		};
		const race = {
			id: 'racingbike',
			label: 'Racing bike',
			description: 'Ride a racing bike on the usually fastest route',
			color: 'gray',
			borderColor: 'purple',
			subcategories: []
		};

		const expected = [bvv_hike, bvv_bike, bvv_mtb, race];

		await expectAsync(bvvRoutingCategoriesProvider()).toBeResolvedTo(expected);
	});
});
