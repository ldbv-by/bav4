import { IconResult, IconService } from '../../../../src/modules/iconSelect/services/IconService';
import { loadBvvIcons } from '../../../../src/modules/iconSelect/services//provider/icons.provider';
import { $injector } from '../../../../src/injection';


describe('IconsService', () => {

	const configService = {
		getValue: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});

	const iconResult1 = new IconResult('foo1', 'bar1');
	const iconResult2 = new IconResult('foo2', 'bar2');
	const loadMockIcons = async () => {
		return [
			iconResult1,
			iconResult2
		];
	};

	const setup = (provider = loadMockIcons) => {
		return new IconService(provider);
	};

	describe('initialization', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._icons).toBeNull();

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(2);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new IconService();
			expect(instanceUnderTest._provider).toEqual(loadBvvIcons);
		});


		it('just provides the icons when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._icons = [iconResult1];

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {

			it('logs an error when we are NOT in standalone mode', async () => {

				const instanceUnderTest = setup(async () => {
					throw new Error('Icons could not be loaded');
				});
				const errorSpy = spyOn(console, 'warn');


				const icons = await instanceUnderTest.all();

				expect(icons.length).toBe(5);
				expect(errorSpy).toHaveBeenCalledWith('Icons could not be fetched from backend.', jasmine.anything());
			});
		});
	});

	describe('all', () => {

		it('provides all icons', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._icons = [iconResult1];

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(1);
		});

		it('fetches the icons when service hat not been initialized', async () => {
			const instanceUnderTest = setup(async () => {
				return Promise.resolve([iconResult1]);
			});
			const loadSpy = spyOn(instanceUnderTest, '_load').and.callThrough();

			const icons = await instanceUnderTest.all();
			expect(loadSpy).toHaveBeenCalled();
			expect(icons).toEqual([iconResult1]);

		});
	});
});
