import { sleep } from '../../src/utils/sleep';

describe('sleep', () => {

	it('delays an execution', async () => {
		const date = Date.now();

		await sleep(100);

		expect((Date.now() - date) > 80).toBeTrue();
	});
});
