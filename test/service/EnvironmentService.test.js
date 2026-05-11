import { $injector } from '@src/injection';
import { EnvironmentService } from '@src/services/EnvironmentService';

describe('EnvironmentService', () => {
	const configService = {
		getValue: () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService);
	});

	describe('class', () => {
		it('defines constant value for embed mode detection', async () => {
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/foo/bar')).toBe(false);
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/')).toBe(false);
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/index.html')).toBe(false);
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/embed.html')).toBe(true);
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/embed')).toBe(true);
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/embed/')).toBe(true);
			expect(EnvironmentService._EMBED_DETECTION_REGEX.test('/embed/index.html')).toBe(true);
		});
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
		it('provides current query parameter from the location search object', () => {
			const mockWindow = {
				location: {
					search: '?foo=true'
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			vi.spyOn(instanceUnderTest, 'isEmbeddedAsWC').mockReturnValue(false);

			expect(instanceUnderTest.getQueryParams().size).toBe(1);
			expect(instanceUnderTest.getQueryParams().has('foo')).toBe(true);
			expect(instanceUnderTest.getQueryParams().get('foo')).toBe('true');
		});
	});

	describe('detects input device capabilities', () => {
		it('is a touch device', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			vi.spyOn(mockWindow, 'matchMedia').mockImplementation((mediaQuery) => {
				if (mediaQuery === '(pointer:coarse)') {
					return {
						media: mediaQuery,
						matches: true
					};
				}
				return {
					media: mediaQuery,
					matches: false
				};
			});
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.isTouch()).toBe(true);
			expect(instanceUnderTest.isMouse()).toBe(false);
			expect(instanceUnderTest.isMouseWithTouchSupport()).toBe(false);
		});

		it('is a mouse only device', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			vi.spyOn(mockWindow, 'matchMedia').mockImplementation((mediaQuery) => {
				if (mediaQuery === '(pointer:fine)' || mediaQuery === '(hover:hover)') {
					return {
						media: mediaQuery,
						matches: true
					};
				}
				return {
					media: mediaQuery,
					matches: false
				};
			});
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.isTouch()).toBe(false);
			expect(instanceUnderTest.isMouse()).toBe(true);
			expect(instanceUnderTest.isMouseWithTouchSupport()).toBe(false);
		});

		it('is a mouse device with touch support', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			vi.spyOn(mockWindow, 'matchMedia').mockImplementation((mediaQuery) => {
				if (mediaQuery === '(any-pointer:coarse)' || mediaQuery === '(pointer:fine)') {
					return {
						media: mediaQuery,
						matches: true
					};
				}
				return {
					media: mediaQuery,
					matches: false
				};
			});
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.isTouch()).toBe(false);
			expect(instanceUnderTest.isMouse()).toBe(false);
			expect(instanceUnderTest.isMouseWithTouchSupport()).toBe(true);
		});
	});

	describe('isRetinaDisplay', () => {
		it('detects a retina display by the devicePixelRatio property', () => {
			const mockWindow = {
				devicePixelRatio: 1
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isRetinaDisplay()).toBe(false);

			mockWindow.devicePixelRatio = 2;

			expect(instanceUnderTest.isRetinaDisplay()).toBe(true);
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

			expect(instanceUnderTest.isRetinaDisplay()).toBe(true);
		});
	});

	describe('isDarkMode', () => {
		it('detects the dark mode by a mediaQuery', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			vi.spyOn(mockWindow, 'matchMedia').mockImplementation((mediaQuery) => {
				if (mediaQuery === '(prefers-color-scheme: dark)') {
					return {
						media: mediaQuery,
						matches: true
					};
				}
				return {
					media: mediaQuery,
					matches: false
				};
			});
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.isDarkMode()).toBe(true);
		});
	});

	describe('isHighContrast', () => {
		it('detects high contrast by a mediaQuery', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			vi.spyOn(mockWindow, 'matchMedia').mockImplementation((mediaQuery) => {
				if (mediaQuery === '(forced-colors: active)') {
					return {
						media: mediaQuery,
						matches: true
					};
				}
				return {
					media: mediaQuery,
					matches: false
				};
			});
			const instanceUnderTest = new EnvironmentService(mockWindow);

			expect(instanceUnderTest.isHighContrast()).toBe(true);
		});
	});

	describe('isEmbedded', () => {
		it('return false when not running as Iframe or WC', () => {
			const instanceUnderTest = new EnvironmentService();
			vi.spyOn(instanceUnderTest, 'isEmbeddedAsIframe').mockReturnValue(false);
			vi.spyOn(instanceUnderTest, 'isEmbeddedAsWC').mockReturnValue(false);
			expect(instanceUnderTest.isEmbedded()).toBe(false);
		});
		it('return true when running as Iframe', () => {
			const instanceUnderTest = new EnvironmentService();
			vi.spyOn(instanceUnderTest, 'isEmbeddedAsIframe').mockReturnValue(true);
			vi.spyOn(instanceUnderTest, 'isEmbeddedAsWC').mockReturnValue(false);
			expect(instanceUnderTest.isEmbedded()).toBe(true);
		});
		it('return true when running as WC', () => {
			const instanceUnderTest = new EnvironmentService();
			vi.spyOn(instanceUnderTest, 'isEmbeddedAsWC').mockReturnValue(true);
			expect(instanceUnderTest.isEmbedded()).toBe(true);
		});
	});

	describe('isEmbeddedAsWC', () => {
		it('detects embedded modus for WC', () => {
			let mockWindow = {
				name: 'foo',
				location: {
					pathname: '/foo/bar'
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsWC()).toBe(false);

			mockWindow = {
				name: 'ba_foo',
				location: {
					pathname: '/foo/bar'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsWC()).toBe(false);

			mockWindow = {
				name: 'ba_foo',
				location: {
					pathname: '/embed'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsWC()).toBe(true);
		});
	});

	describe('isEmbeddedAsIframe', () => {
		it('detects embedded modus for Iframe', () => {
			let mockWindow = {
				name: 'ba_foo',
				location: {
					pathname: '/foo/bar'
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBe(false);

			mockWindow = {
				name: 'ba_foo',
				location: {
					pathname: '/embed.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBe(false);

			mockWindow = {
				name: 'foo',
				location: {
					pathname: '/embed.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBe(true);
		});
	});

	describe('isStandalone', () => {
		it('returns `false` when BACKEND_URL config param is available', () => {
			const instanceUnderTest = new EnvironmentService();
			const configServiceSpy = vi.spyOn(configService, 'getValue').mockReturnValue('foo');

			expect(instanceUnderTest.isStandalone()).toBe(false);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL', false);
		});

		it('returns `true` when BACKEND_URL config param is NOT available', () => {
			const instanceUnderTest = new EnvironmentService();

			const configServiceSpy = vi.spyOn(configService, 'getValue').mockReturnValue(false);

			expect(instanceUnderTest.isStandalone()).toBe(true);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL', false);
		});
	});
});
