import { PromiseQueue } from '../../src/utils/PromiseQueue';

describe('PromiseQueue', () => {
	it('queues the execution of a number of functions', async () => {
		const result = [];
		const instanceUnderTest = new PromiseQueue();

		instanceUnderTest.add(() => result.push(0));
		instanceUnderTest.add(() => result.push(1));
		instanceUnderTest.add(() => result.push(2));
		await instanceUnderTest.add(() => result.push(3));

		expect(result).toEqual([0, 1, 2, 3]);
	});
});
