import { IconService } from '../../../../src/modules/iconSelect/services/IconService';
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

	const iconTemplate1 = (r, g, b) => `foo_${r}-${g}-${b}`;
	const iconTemplate2 = (r, g, b) => `bar_${r}-${g}-${b}`;
	const loadMockIcons = async () => {
		return [
			iconTemplate1,
			iconTemplate2
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
			instanceUnderTest._icons = [iconTemplate1];

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {

			it('logs an error when we are NOT in standalone mode', async () => {

				const instanceUnderTest = setup(async () => {
					throw new Error('Icons could not be loaded');
				});
				const errorSpy = spyOn(console, 'error');


				const icons = await instanceUnderTest.all();

				expect(icons).toEqual([]);
				expect(errorSpy).toHaveBeenCalledWith('Icons could not be fetched from backend.', jasmine.anything());
			});
		});
	});

	describe('all', () => {

		it('provides all icons', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._icons = [iconTemplate1];

			const icons = await instanceUnderTest.all();

			expect(icons.length).toBe(1);
		});

		it('fetches the icons when service hat not been initialized', async () => {
			const instanceUnderTest = setup(async () => {
				return Promise.resolve([iconTemplate1]);
			});
			const loadSpy = spyOn(instanceUnderTest, '_load').and.callThrough();

			const icons = await instanceUnderTest.all();
			expect(loadSpy).toHaveBeenCalled();
			expect(icons).toEqual([iconTemplate1]);

		});
	});
});
