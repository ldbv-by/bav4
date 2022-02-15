import { TestUtils } from '../test-utils.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { NotificationPlugin } from '../../src/plugins/NotificationPlugin';
import { setBeingDragged, setClick, setContextClick } from '../../src/store/pointer/pointer.action';
import { emitFixedNotification } from '../../src/store/notifications/notifications.action';



describe('NotificationPlugin', () => {


	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			notifications: notificationReducer,
			pointer: pointerReducer
		});
		return store;
	};
	beforeEach(function () {
		jasmine.clock().install();
	});

	afterEach(function () {
		jasmine.clock().uninstall();
	});
	const afterDebounceDelay = 500;
	it('when dragging the pointer on the map, sets latest notification to null', async () => {
		const store = setup();
		const instanceUnderTest = new NotificationPlugin();
		await instanceUnderTest.register(store);

		emitFixedNotification('foo');
		expect(store.getState().notifications.latest.payload.content).not.toBeNull();

		setBeingDragged(true);
		jasmine.clock().tick(afterDebounceDelay);

		expect(store.getState().notifications.latest.payload.content).toBeNull();

	});

	it('when click on the map, sets latest notification to null', async () => {
		const store = setup();
		const instanceUnderTest = new NotificationPlugin();
		await instanceUnderTest.register(store);

		emitFixedNotification('foo');
		expect(store.getState().notifications.latest.payload.content).not.toBeNull();

		setClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });
		jasmine.clock().tick(afterDebounceDelay);
		expect(store.getState().notifications.latest.payload.content).toBeNull();

	});

	it('when contextClick on the map, sets latest notification to null', async () => {
		const store = setup();
		const instanceUnderTest = new NotificationPlugin();
		await instanceUnderTest.register(store);

		emitFixedNotification('foo');
		expect(store.getState().notifications.latest.payload.content).not.toBeNull();

		setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });
		jasmine.clock().tick(afterDebounceDelay);
		expect(store.getState().notifications.latest.payload.content).toBeNull();

	});
});
