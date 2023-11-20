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
		style: {
			routeColor: 'gray',
			routeBorderColor: 'red'
		},
		subcategories: []
	};
	const bvv_hike = {
		id: 'bvv-hike',
		label: lang === 'de' ? 'Wandern (Freizeitwege)' : 'Hiking (BVV Freizeitwege)',
		description: lang === 'de' ? 'Wandern möglichst auf offiziellen Wanderwegen' : 'Hike on "BVV Freizeitwege" tracks where possible',
		style: {
			routeColor: 'red',
			routeBorderColor: 'gray',
			color: 'red',
			icon: '<path d="M5.785 0a1.6 1.6 0 00-1.6 1.6 1.6 1.6 0 001.6 1.6 1.6 1.6 0 001.6-1.6 1.6 1.6 0 00-1.6-1.6zM4.104 3.514l.001.007-1.36 4.72c-.16.64.08 1.279.56 1.679l.88.715 1.2.974c.416.338.484.787.484.787L5.914 16h1.54v-2.936c0-.683-.048-1.04-.173-1.584-.124-.543-.635-1.087-.635-1.087L5.193 8.629l.754-2.67c.12.092.21.165.237.195.108.125.653.715 1.166.994.512.28 1.166.141 1.166.141l1.425-.45.85-.269c.232-.112.414-.35.414-.607a.623.623 0 00-.61-.623V4h-.663v1.457c-.565.125-1.62.353-1.79.356-.188.002-.34-.168-.515-.352-.15-.158-.521-.49-.697-.658-.167-.16-.901-.636-1.112-.735-.368-.172-1.714-.554-1.714-.554zm-.938.02c-1.15-.086-2.3.607-2.678 1.741l-.431 1.44c-.216.648.215 1.368.863 1.584.72.216 1.368-.146 1.584-.865l1.152-3.815a2.534 2.534 0 00-.49-.086zm7.43 3.64l-.655.191L9.931 16h.665V7.174zm-7.494 3.21L1.064 16h1.68l1.615-4.531-1.257-1.084z"/>'
		},
		subcategories: [hike]
	};
	const bayernnetzBike = {
		id: 'bayernnetz-bike',
		label: lang === 'de' ? 'Fahrrad (Bayernnetz)' : 'Bicycle (Bayernnetz)',
		description: lang === 'de' ? 'Fahrradfahren möglichst auf Wegen des Bayernnetzes' : 'Ride a bicycle on "Bayernnetz" tracks where possible',
		style: {
			routeColor: 'blue',
			routeBorderColor: 'gray',
			routeZindex: 0
		},
		subcategories: []
	};
	const bike = {
		id: 'bike',
		label: lang === 'de' ? 'Fahrrad' : 'Bicycle',
		description: lang === 'de' ? 'Fahrradfahren auf der gewöhnlich schnellsten Route' : 'Ride a bicycle on the usually fastest route',
		style: {
			routeColor: 'gray',
			routeBorderColor: 'green',
			routeZindex: 1
		},
		subcategories: []
	};
	const bvv_bike = {
		id: 'bvv-bike',
		label: lang === 'de' ? 'Fahrrad (Freizeitwege)' : 'Bicycle (BVV Freizeitwege)',
		description:
			lang === 'de' ? 'Fahrradfahren möglichst auf offiziellen Freizeitwegen' : 'Ride a bicycle on "BVV Freizeitwege" tracks where possible',
		style: {
			routeColor: 'green',
			routeBorderColor: 'gray',
			routeZindex: 2,
			color: 'green',
			icon: '<path d="M14.243 7.395a.783.783 0 00-.784-.783h-.002V6.61h-2.045s-.215.012-.473-.315C8.97 3.851 8.653 3.378 8.022 3.378h-.394c-.63 0-1.104.473-3.39 2.76-.867.867-.788 1.97.079 2.522l2.403 1.414-.012 3.41-.002.05v.093h.004a.836.836 0 00.831.742c.43 0 .784-.325.83-.742h.001v-.003a.888.888 0 00.005-.09.845.845 0 00-.005-.09v-3.6c0-.556-.448-.934-.513-1.012-.034-.042-.459-.47-.839-.852l1.71-1.527 1.183 1.261c.271.304.631.473 1.025.473h2.553a.792.792 0 00.75-.793zm-2.335-6.361a1.64 1.64 0 00-.244-.37 2.228 2.228 0 00-.52-.44c-.213-.12-.415-.215-.89-.223-.465-.008-.62.059-.82.112-.43.114-1.06.438-1.14.547-.082.109-.06.172.061.275.042.037.107.077.174.114a1.57 1.57 0 00-.19.752 1.577 1.577 0 103.082-.468c.15-.017.388-.051.454-.11.074-.066.076-.088.033-.189zm1.066 8.68l.14.877a2.31 2.31 0 11-1.165.044l.32 2.07a.342.342 0 00.345.335.341.341 0 00.337-.41l-.663-4.133h-.67l.201 1.299a3.166 3.166 0 00-2.358 3.05A3.163 3.163 0 0012.614 16a3.163 3.163 0 003.154-3.153 3.164 3.164 0 00-2.794-3.133zM10.189 8.31L8.632 9.55c.025.091.041.189.041.292v.55l2.348-1.894h-.148a1.323 1.323 0 01-.684-.19zm-5.273 1.926l.355-.687-.572-.336-1.857 3.544a.33.33 0 00-.03.066c-.06.176.039.369.22.43.18.06.373-.033.433-.208l1.062-2.055a2.31 2.31 0 11-1.056-.431l.409-.781a3.134 3.134 0 00-.727-.085A3.163 3.163 0 000 12.846 3.163 3.163 0 003.153 16a3.163 3.163 0 003.154-3.154 3.156 3.156 0 00-1.39-2.61z"/>'
		},
		subcategories: [bike, bayernnetzBike]
	};
	const mtb = {
		id: 'mtb',
		label: lang === 'de' ? 'Mountainbike' : 'Mountain bike',
		description: lang === 'de' ? 'Mountainbiken auf der gewöhnlich schnellsten Route' : 'Ride a mountain bike on the usually fastest route',
		style: {
			routeColor: 'gray',
			routeBorderColor: 'SpringGreen'
		},
		subcategories: []
	};
	const bvv_mtb = {
		id: 'bvv-mtb',
		label: lang === 'de' ? 'Mountainbike (Freizeitwege)' : 'Mountain bike (Freizeitwege)',
		description:
			lang === 'de' ? 'Mountainbiken möglichst auf offiziellen Freizeitwegen' : 'Ride a mountain bike on "BVV Freizeitwege" tracks where possible',
		style: {
			routeColor: 'SpringGreen',
			routeBorderColor: 'gray',
			color: 'SpringGreen',
			icon: '<path d="M8.687 0c-.254.006-.383.047-.538.08-.442.09-1.096.381-1.184.485-.088.104-.068.168.048.278.097.09.312.205.386.244-.127.225-.2.485-.2.76 0 .87.717 1.573 1.601 1.573s1.6-.704 1.6-1.572c0-.165-.025-.324-.073-.473.103-.014.2-.034.24-.066.077-.062.08-.083.043-.186a1.626 1.626 0 00-.229-.38 2.248 2.248 0 00-.503-.465c-.21-.131-.41-.236-.89-.269A3.572 3.572 0 008.686 0zM3.524 2.053a2.267 2.267 0 00-1.714.81L.764 4.117c-.402.549-.406 1.335.152 1.73.558.475 1.279.399 1.761-.15L5.09 2.72l-.159-.158a2.184 2.184 0 00-1.407-.51zm2.674.566a.917.917 0 00-.758.409c-.8.865-2 2.28-2.64 3.066-.72.865-.4 2.202.72 2.516l1.722.489 1.701.482 1.07 3.072a.67.67 0 00.664.52c.375 0 .678-.29.678-.647a.633.633 0 00-.02-.156l-.004-.01a.628.628 0 00-.024-.07L8 8.456 5.36 7.16l1.818-2.184 1.52 1.122 2.981.264a.677.646 0 00.01 0l.018.002a.677.646 0 00.045.002.677.646 0 00.677-.647.677.646 0 00-.585-.64v-.006l-2.268-.216L6.879 2.87a1.062 1.062 0 00-.681-.252zm3.441 3.938L8.396 8.335a.37.37 0 00-.035.046l.28.814 1.755-2.557zm.863.093l.583 1.196A3.138 3.138 0 009.6 10.497c0 1.73 1.44 3.144 3.2 3.144 1.76 0 3.2-1.415 3.2-3.144 0-1.73-1.44-3.146-3.2-3.146a3.232 3.232 0 00-.741.086l.575 1.18a1.878 1.878 0 01.166-.008c1.04 0 1.92.865 1.92 1.888 0 1.022-.88 1.886-1.92 1.886s-1.92-.864-1.92-1.886c0-.602.305-1.149.768-1.497l.806 1.652a.348.348 0 00.433.22.34.34 0 00.237-.42.328.329 0 00-.029-.068l-1.802-3.65zM4.758 9.337l-1.77 3.322a.323.323 0 00-.031.065.34.34 0 00.223.429.348.348 0 00.44-.207l.804-1.53c.422.35.696.87.696 1.44 0 1.021-.88 1.886-1.92 1.886s-1.92-.865-1.92-1.887.88-1.887 1.92-1.887c.09 0 .18.007.267.02l.613-1.156a3.227 3.227 0 00-.88-.122c-1.76 0-3.2 1.415-3.2 3.145S1.44 16 3.2 16c1.76 0 3.2-1.415 3.2-3.145 0-1.065-.546-2.01-1.376-2.58l.394-.75z"/>'
		},
		subcategories: [mtb]
	};
	const race = {
		id: 'racingbike',
		label: lang === 'de' ? 'Rennrad' : 'Racing bike',
		description: lang === 'de' ? 'Rennradfahren auf der gewöhnlich schnellsten Route' : 'Ride a racing bike on the usually fastest route',
		style: {
			routeColor: 'gray',
			routeBorderColor: 'purple',
			color: 'gray',
			icon: '<path d="M11.938.712c-.262.005-.395.048-.554.08-.456.094-1.13.39-1.221.495-.09.106-.054.286.066.397.08.074.248.182.353.248a1.6 1.6 0 00-.102.557 1.6 1.6 0 001.6 1.6 1.6 1.6 0 001.599-1.6 1.6 1.6 0 00-.048-.379c.106-.014.204-.035.245-.066.08-.063.084-.085.045-.19a1.654 1.654 0 00-.236-.387 2.303 2.303 0 00-.52-.472c-.216-.134-.422-.24-.917-.274a3.705 3.705 0 00-.31-.009zM8.78 2.336c-.64 0-1.774.521-4.567 2.35-.88.88-.8 2 .08 2.56l.463.272.934.55 1.082.636v3.537h.002a.772.772 0 101.543.057.773.773 0 00-.003-.065v-3.7a1.427 1.427 0 00-.432-1.016l-.82-.797 2.2-1.19.588 1.213c.24.32.521.736 1.268.736l2.822-.144a.744.744 0 100-1.487l-2.325.021c-.503.057-.9-1.896-1.758-2.97-.096-.12-.199-.23-.308-.325 0 0-.295-.238-.769-.238zm.793 4.731l-.992.74c.058.145.1.32.105.525l.003.257 1.312-.996c-.163-.136-.28-.3-.388-.444zm2.468.76l-.697.036.204.676a3.21 3.21 0 00-2.038 2.979c0 1.76 1.44 3.199 3.199 3.199s3.198-1.44 3.198-3.2A3.208 3.208 0 0012.73 8.32l.175.568a2.639 2.639 0 11-1.194.189l.758 2.51a.346.346 0 00.394.288.346.346 0 00.3-.388.333.333 0 00-.019-.071zm-7.43.062L2.8 11.39a.33.33 0 00-.031.067c-.06.179.04.374.223.436a.346.346 0 00.44-.21l1.198-2.32a2.639 2.639 0 11-1.126-.454l.268-.52a3.179 3.179 0 00-.664-.07 3.208 3.208 0 00-3.199 3.2c0 1.758 1.44 3.198 3.2 3.198 1.758 0 3.198-1.44 3.198-3.199a3.202 3.202 0 00-1.42-2.654l.317-.613z"/>'
		},
		subcategories: []
	};

	return [bvv_hike, bvv_bike, bvv_mtb, race];
};
