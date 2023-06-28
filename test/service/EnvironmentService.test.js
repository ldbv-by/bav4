/* eslint-disable no-undef */
import { $injector } from '../../src/injection';
import { EnvironmentService } from '../../src/services/EnvironmentService';

describe('EnvironmentService', () => {
	const configService = {
		getValue: () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService);
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

	describe('query parameter', () => {
		it('provides current query parameter', () => {
			const mockWindow = {
				location: {
					search: '?foo=true'
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.getQueryParams().has('foo')).toBeTrue();
			expect(instanceUnderTest.getQueryParams().has('bar')).toBeFalse();
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

	describe('isRetinaDisplay', () => {
		it('detects a retina display by the devicePixelRatio property', () => {
			const mockWindow = {
				devicePixelRatio: 1
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isRetinaDisplay()).toBeFalse();

			mockWindow.devicePixelRatio = 2;

			expect(instanceUnderTest.isRetinaDisplay()).toBeTrue();
		});

		it('detects a retina display by a mediaQuery', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: (mediaQuery) => {
					return {
						media: mediaQuery,
						matches: true
					};
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.isRetinaDisplay()).toBeTrue();
		});
	});

	describe('embedded', () => {
		it('detects embedded modus', () => {
			let mockWindow = {
				location: {
					pathname: '/foo/bar'
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/index.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/embed.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbedded()).toBeTrue();

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
