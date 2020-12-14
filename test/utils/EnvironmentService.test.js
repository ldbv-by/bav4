/* eslint-disable no-undef */
import { EnvironmentService } from '../../src/utils/EnvironmentService';

describe('EnvironmentService', () => {

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
				},
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeFalse();

			mockWindow = {
				navigator: {
					userAgent: 'Android'
				},
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			expect(instanceUnderTest.isTouch()).toBeTrue();
		});
	});

	describe('screen orientation', () => {
		it('detects screen orientation by orientation api', () => {
			let mockWindow = {
				screen: {
					orientation: {
						type: 'portrait-primary'
					}
				},
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			const { portrait, landscape } = instanceUnderTest.getScreenOrientation();
			expect(portrait).toBeTrue();
			expect(landscape).toBeFalse();
		});

		it('detects screen orientation by sreen width and height', () => {
			let mockWindow = {
				screen: {
					width: 200,
					height: 100
				},
			};
			let instanceUnderTest = new EnvironmentService(mockWindow);
			let orientation = instanceUnderTest.getScreenOrientation();
			expect(orientation.portrait).toBeFalse();
			expect(orientation.landscape).toBeTrue();

			mockWindow = {
				screen: {
					width: 100,
					height: 200
				},
			};
			instanceUnderTest = new EnvironmentService(mockWindow);
			orientation = instanceUnderTest.getScreenOrientation();
			expect(orientation.portrait).toBeTrue();
			expect(orientation.landscape).toBeFalse();
		});
	});
});