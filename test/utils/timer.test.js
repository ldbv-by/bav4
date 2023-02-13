/* eslint-disable no-undef */
import { debounced, throttled, sleep } from '../../src/utils/timer.js';

describe('Unit test functions from asyncs.js', () => {

	describe('debounce and throttle', () => {

		beforeEach(function () {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});


		it('debounces a function call', () => {
			const myFunction = jasmine.createSpy();
			const handler = debounced(100, myFunction);

			handler();
			handler();
			handler();
			jasmine.clock().tick(200);
			handler();
			handler();
			handler();
			jasmine.clock().tick(200);

			expect(myFunction).toHaveBeenCalledTimes(2);
		});


		it('throttles a function call', () => {
			//throttled is based on Date
			jasmine.clock().mockDate();
			const myFunction = jasmine.createSpy();
			const handler = throttled(100, myFunction);

			handler();
			handler();
			handler();
			jasmine.clock().tick(200);
			handler();
			handler();
			handler();
			jasmine.clock().tick(200);

			expect(myFunction).toHaveBeenCalledTimes(2);
		});
	});

	describe('sleep', () => {

		it('delays an execution', async () => {
			const date = Date.now();

			await sleep(100);

			expect((Date.now() - date) > 80).toBeTrue();
		});
	});

});
