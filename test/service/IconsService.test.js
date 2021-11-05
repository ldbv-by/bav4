import { IconsService } from '../../src/services/IconsService';
import { loadBvvIcons } from '../../src/services/provider/icons.provider';
import { $injector } from '../../src/injection';


describe('IconsService', () => {

    const configService = {
        getValue: () => { }
    };

    beforeAll(() => {
        $injector
            .registerSingleton('ConfigService', configService);
    });

    const iconTemplate1 = {
        default: 'foo',
        colored: (r, g, b) => `foo_${r}-${g}-${b}`
    };
    const iconTemplate2 = {
        default: 'bar',
        colored: (r, g, b) => `bar_${r}-${g}-${b}`
    };
    const loadMockIcons = async () => {
        return [
            iconTemplate1,
            iconTemplate2
        ];
    };

    const setup = (provider = loadMockIcons) => {
        return new IconsService(provider);
    };

    describe('init', () => {

        it('initializes the service', async () => {
            const instanceUnderTest = setup();
            expect(instanceUnderTest._icons).toBeNull();

            const icons = await instanceUnderTest.init();

            expect(icons.length).toBe(2);
        });

        it('initializes the service with default provider', async () => {
            const instanceUnderTest = new IconsService();
            expect(instanceUnderTest._provider).toEqual(loadBvvIcons);
        });


        it('just provides the icons when already initialized', async () => {
            const instanceUnderTest = setup();
            instanceUnderTest._icons = [iconTemplate1];

            const icons = await instanceUnderTest.init();

            expect(icons.length).toBe(1);
        });

        describe('provider cannot fulfill', () => {

            it('logs an error when we are NOT in standalone mode', async () => {

                const instanceUnderTest = setup(async () => {
                    throw new Error('Icons could not be loaded');
                });
                const errorSpy = spyOn(console, 'error');


                const icons = await instanceUnderTest.init();

                expect(icons).toEqual([]);
                expect(errorSpy).toHaveBeenCalledWith('Icons could not be fetched from backend.', jasmine.anything());
            });
        });
    });

    describe('all', () => {

        it('provides all icons', () => {
            const instanceUnderTest = setup();
            instanceUnderTest._icons = [iconTemplate1];

            const icons = instanceUnderTest.all();

            expect(icons.length).toBe(1);
        });

        it('logs a warn statement when service hat not been initialized', () => {
            const instanceUnderTest = setup();
            const warnSpy = spyOn(console, 'warn');

            expect(instanceUnderTest.all()).toEqual([]);
            expect(warnSpy).toHaveBeenCalledWith('IconsService not yet initialized');
        });
    });
});
