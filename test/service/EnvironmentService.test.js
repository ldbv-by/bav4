/* eslint-disable no-undef */
import { $injector } from '../../src/injection';
import { EnvironmentService } from '../../src/services/EnvironmentService';

describe('EnvironmentService', () => {

	const configService = {
		getValue: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});

	describe('window object', () => {

		it('provides the global window object', () => {

			const mockWindow = {
				location: {
					search: '?foo=bar'
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.getWindow().location.search).toBe('?foo=bar');
		});

		it('provides the global window object from default param', () => {

			const instanceUnderTest = new EnvironmentService();

			expect(instanceUnderTest.getWindow()).toBeDefined();
		});
	});

	describe('url parameter', () => {

		it('provides current url parameter', () => {

			const mockWindow = {
				location: {
					search: '?foo=true'
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.getUrlParams().has('foo')).toBeTrue();
			expect(instanceUnderTest.getUrlParams().has('bar')).toBeFalse();
		});
	});

	describe('touch ability', () => {

		it('detects touch ability', () => {
			const mockWindow = {
				navigator: {}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeFalse();
		});

		it('detects touch ability by touchPoints', () => {
			let mockWindow = {
				navigator: {
					maxTouchPoints: 0
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeFalse();

			mockWindow = {
				navigator: {
					maxTouchPoints: 1
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeTrue();
		});

		it('detects touch ability by mediaQuery', () => {
			let mockWindow = {
				navigator: {},
				matchMedia: () => {
					return undefined;
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeFalse();

			mockWindow = {
				navigator: {},
				matchMedia: (mediaQuery) => {
					return {
						media: mediaQuery,
						matches: true
					};
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeTrue();
		});

		it('detects touch ability by deprecated orientation object in window', () => {
			const mockWindow = {
				navigator: {},
				orientation: 'something'

			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeTrue();
		});

		it('detects touch ability by user agent', () => {
			let mockWindow = {
				navigator: {
					userAgent: 'noop'
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeFalse();

			mockWindow = {
				navigator: {
					userAgent: 'Android'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeTrue();
		});
	});

	describe('screen orientation', () => {
		it('detects screen orientation by orientation api', () => {
			const mockWindow = {
				screen: {
					orientation: {
						type: 'portrait-primary'
					}
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			const { portrait, landscape } = instanceUnderTest.getScreenOrientation();
			expect(portrait).toBeTrue();
			expect(landscape).toBeFalse();
		});

		it('detects screen orientation by sreen width and height', () => {
			let mockWindow = {
				screen: {
					width: 200,
					height: 100
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			let orientation = instanceUnderTest.getScreenOrientation();
			expect(orientation.portrait).toBeFalse();
			expect(orientation.landscape).toBeTrue();

			mockWindow = {
				screen: {
					width: 100,
					height: 200
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			orientation = instanceUnderTest.getScreenOrientation();
			expect(orientation.portrait).toBeTrue();
			expect(orientation.landscape).toBeFalse();
		});
	});

	describe('embedded', () => {
		it('detects embedded flag via query parameter', () => {
			let mockWindow = {
				location: {
					pathname: '/foo/bar'
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/embed'
				}
			};

			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeTrue();

			mockWindow = {
				location: {
					pathname: '/embed/'
				}
			};

			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeTrue();

			mockWindow = {
				location: {
					pathname: '/embed/index.html'
				}
			};

			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeTrue();
		});
	});

	describe('isStandalone', () => {

		it('returns `false` when BACKEND_URL config param is available', () => {
			const instanceUnderTest = new EnvironmentService();
			spyOn(configService, 'getValue').withArgs('BACKEND_URL', false).and.returnValue('foo');

			expect(instanceUnderTest.isStandalone()).toBeFalse();
		});

		it('returns `true` when BACKEND_URL config param is NOT available', () => {
			const instanceUnderTest = new EnvironmentService();

			spyOn(configService, 'getValue').withArgs('BACKEND_URL', false).and.returnValue(false);

			expect(instanceUnderTest.isStandalone()).toBeTrue();
		});
	});
});
