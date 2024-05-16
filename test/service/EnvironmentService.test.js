/* eslint-disable no-undef */
import { QueryParameters } from '../../src/domain/queryParameters';
import { $injector } from '../../src/injection';
import { PublicComponent } from '../../src/modules/public/components/PublicComponent';
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
		it('provides current query parameter from the location search object', () => {
			const mockWindow = {
				location: {
					search: '?foo=true'
				}
			};
			const instanceUnderTest = new EnvironmentService(mockWindow);
			spyOn(instanceUnderTest, 'isEmbeddedAsWC').and.returnValue(false);

			expect(instanceUnderTest.getQueryParams().size).toBe(1);
			expect(instanceUnderTest.getQueryParams().has('foo')).toBeTrue();
			expect(instanceUnderTest.getQueryParams().get('foo')).toBe('true');
		});

		it('provides current query parameter from the attributes of an embedded web component and filters attributes that do not match valid query parameters', () => {
			const mockDocument = { querySelector: () => {} };
			const mockWindow = { document: mockDocument };
			const mockElement = { getAttributeNames: () => {}, getAttribute: () => {} };
			const instanceUnderTest = new EnvironmentService(mockWindow);
			spyOn(mockDocument, 'querySelector').withArgs(PublicComponent.tag).and.returnValue(mockElement);
			spyOn(instanceUnderTest, 'isEmbeddedAsWC').and.returnValue(true);
			spyOn(mockElement, 'getAttributeNames').and.returnValue([QueryParameters.CROSSHAIR, 'style']);
			const getAttributeSpy = spyOn(mockElement, 'getAttribute').withArgs(QueryParameters.CROSSHAIR).and.returnValue('true');

			expect(instanceUnderTest.getQueryParams().size).toBe(1);
			expect(instanceUnderTest.getQueryParams().has(QueryParameters.CROSSHAIR)).toBeTrue();
			expect(instanceUnderTest.getQueryParams().get(QueryParameters.CROSSHAIR)).toBe('true');
			expect(getAttributeSpy).not.toHaveBeenCalledWith('style');
		});
	});

	describe('detects input device capabilities', () => {
		it('is a touch device', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			spyOn(mockWindow, 'matchMedia').and.callFake((mediaQuery) => {
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

			expect(instanceUnderTest.isTouch()).toBeTrue();
			expect(instanceUnderTest.isMouse()).toBeFalse();
			expect(instanceUnderTest.isMouseWithTouchSupport()).toBeFalse();
		});

		it('is a mouse only device', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			spyOn(mockWindow, 'matchMedia').and.callFake((mediaQuery) => {
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

			expect(instanceUnderTest.isTouch()).toBeFalse();
			expect(instanceUnderTest.isMouse()).toBeTrue();
			expect(instanceUnderTest.isMouseWithTouchSupport()).toBeFalse();
		});

		it('is a mouse device with touch support', () => {
			const mockWindow = {
				navigator: {},
				matchMedia: () => {}
			};
			spyOn(mockWindow, 'matchMedia').and.callFake((mediaQuery) => {
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

			expect(instanceUnderTest.isTouch()).toBeFalse();
			expect(instanceUnderTest.isMouse()).toBeFalse();
			expect(instanceUnderTest.isMouseWithTouchSupport()).toBeTrue();
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

	describe('isEmbedded', () => {
		it('return false when not running as Iframe or WC', () => {
			const instanceUnderTest = new EnvironmentService();
			spyOn(instanceUnderTest, 'isEmbeddedAsIframe').and.returnValue(false);
			spyOn(instanceUnderTest, 'isEmbeddedAsWC').and.returnValue(false);
			expect(instanceUnderTest.isEmbedded()).toBeFalse();
		});
		it('return true when running as Iframe', () => {
			const instanceUnderTest = new EnvironmentService();
			spyOn(instanceUnderTest, 'isEmbeddedAsIframe').and.returnValue(true);
			spyOn(instanceUnderTest, 'isEmbeddedAsWC').and.returnValue(false);
			expect(instanceUnderTest.isEmbedded()).toBeTrue();
		});
		it('return true when running as WC', () => {
			const instanceUnderTest = new EnvironmentService();
			spyOn(instanceUnderTest, 'isEmbeddedAsIframe').and.returnValue(false);
			spyOn(instanceUnderTest, 'isEmbeddedAsWC').and.returnValue(true);
			expect(instanceUnderTest.isEmbedded()).toBeTrue();
		});
	});

	describe('isEmbeddedAsWC', () => {
		it('detects embedded modus for WC', () => {
			let mockWindow = {
				customElements: {
					get: () => undefined
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsWC()).toBeFalse();

			mockWindow = {
				customElements: {
					get: (tag) => (tag === PublicComponent.tag ? true : false)
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsWC()).toBeTrue();
		});
	});

	describe('isEmbeddedAsIframe', () => {
		it('detects embedded modus for Iframe', () => {
			let mockWindow = {
				location: {
					pathname: '/foo/bar'
				}
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/index.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeFalse();

			mockWindow = {
				location: {
					pathname: '/embed.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeTrue();

			mockWindow = {
				location: {
					pathname: '/embed'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeTrue();

			mockWindow = {
				location: {
					pathname: '/embed/'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeTrue();

			mockWindow = {
				location: {
					pathname: '/embed/index.html'
				}
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isEmbeddedAsIframe()).toBeTrue();
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
