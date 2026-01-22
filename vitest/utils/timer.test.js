/* eslint-disable no-undef */
import { debounced, throttled, sleep } from '../../src/utils/timer.js';

describe('Unit test functions from asyncs.js', () => {
    describe('debounce and throttle', () => {
        beforeEach(function () {
            vi.useFakeTimers();
        });

        afterEach(function () {
            vi.useRealTimers();
        });

        it('debounces a function call', () => {
            const myFunction = vi.fn();
            const handler = debounced(100, myFunction);

            handler();
            handler();
            handler();
            vi.advanceTimersByTime(200);
            handler();
            handler();
            handler();
            vi.advanceTimersByTime(200);

            expect(myFunction).toHaveBeenCalledTimes(2);
        });

        it('throttles a function call', () => {
            //throttled is based on Date
            vi.setSystemTime(new Date());
            const myFunction = vi.fn();
            const handler = throttled(100, myFunction);

            handler();
            handler();
            handler();
            vi.advanceTimersByTime(200);
            handler();
            handler();
            handler();
            vi.advanceTimersByTime(200);

            expect(myFunction).toHaveBeenCalledTimes(2);
        });
    });

    describe('sleep', () => {
        it('delays an execution', async () => {
            const date = Date.now();

            await sleep(100);

            expect(Date.now() - date > 80).toBe(true);
        });
    });
});
