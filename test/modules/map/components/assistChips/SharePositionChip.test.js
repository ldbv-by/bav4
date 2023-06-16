import { $injector } from '../../../../../src/injection';
import { SharePositionChip } from '../../../../../src/modules/map/components/assistChips/SharePositionChip';
import shareSvg from '../../../../../src/modules/map/components/assistChips/assets/share.svg';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(SharePositionChip.tag, SharePositionChip);

describe('SharePositionChip', () => {
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
		encodeState() {
			return 'http://this.is.a.url?forTestCase';
		}
	};
	const urlServiceMock = {
		shorten() {
			return Promise.resolve('http://foo');
		}
	};
	const mapServiceMock = {
		getCoordinateRepresentations() {},
		getSrid() {}
	};

	const coordinateServiceMock = {
		transform() {}
	};

	const setup = async () => {
		const windowMock = { navigator: {}, open() {} };
		TestUtils.setupStoreAndDi({}, {});
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('UrlService', urlServiceMock);

		return TestUtils.render(SharePositionChip.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({ position: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('map_assistChips_share_position_label');
			expect(element.getIcon()).toBe(shareSvg);
		});
	});
});
