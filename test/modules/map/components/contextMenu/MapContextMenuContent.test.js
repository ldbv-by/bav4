 
import { MapContextMenuContent } from '../../../../../src/modules/map/components/contextMenu/MapContextMenuContent';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { Icon } from '../../../../../src/modules/commons/components/icon/Icon';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';

window.customElements.define(MapContextMenuContent.tag, MapContextMenuContent);

window.customElements.define(Icon.tag, Icon);

describe('MapContextMenuContent', () => {
	const mapServiceMock = {
		getCoordinateRepresentations() {},
		getSrid() {}
	};

	const shareServiceMock = {
		copyToClipboard() {}
	};
	const administrationServiceMock = {
		getAdministration() {}
	};
	const translationServiceMock = {
		translate: (key) => key
	};

	let store;

	const setup = () => {
		const state = {
			notifications: {
				notification: null
			}
		};

		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('AdministrationService', administrationServiceMock);

		return TestUtils.render(MapContextMenuContent.tag);
	};

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new MapContextMenuContent();

			expect(element.getModel()).toEqual({
				coordinate: null,
				administration: {
					community: null,
					district: null,
					parcel: null
				}
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when screen coordinate available', () => {
		it('renders the full content', async () => {
			const coordinateMock = [1000, 2000];
			const administrationMock = spyOn(administrationServiceMock, 'getAdministration')
				.withArgs(coordinateMock)
				.and.resolveTo({ community: 'LDBV', district: 'Ref42', parcel: 'Parcel' });

			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_community')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_district')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_parcel')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-coordinate-info')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.label')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.label')[0].innerText).toBe('map_contextMenuContent_community_label');
			expect(element.shadowRoot.querySelectorAll('.label')[1].innerText).toBe('map_contextMenuContent_district_label');
			expect(element.shadowRoot.querySelectorAll('.label')[2].innerText).toBe('map_contextMenuContent_parcel_label');

			expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toEqual('LDBV');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('Ref42');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[2].innerText).toEqual('Parcel');
			const badge = element.shadowRoot.querySelector('ba-badge');
			expect(badge.color).toEqual('var(--text5)');
			expect(badge.background).toEqual('var(--roles-plus)');
			expect(badge.label).toEqual('map_contextMenuContent_parcel_badge');
			expect(badge.size).toEqual('0.6');

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();
			expect(copyIcon.title).toBe('map_contextMenuContent_copy_icon');

			expect(administrationMock).toHaveBeenCalledOnceWith(coordinateMock);

			// assistChips
			expect(element.shadowRoot.querySelectorAll('ba-share-chip')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-share-chip')[0].center).toEqual(coordinateMock);

			expect(element.shadowRoot.querySelectorAll('ba-map-feedback-chip')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-map-feedback-chip')[0].center).toEqual(coordinateMock);

			expect(element.shadowRoot.querySelectorAll('ba-routing-chip')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-chip')[0].coordinate).toEqual(coordinateMock);
		});

		it('renders the content when parcel is NOT available', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			spyOn(administrationServiceMock, 'getAdministration')
				.withArgs(coordinateMock)
				.and.resolveTo({ community: 'LDBV', district: 'Ref42', parcel: null });
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();

			expect(element.shadowRoot.querySelectorAll('.r_community')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_district')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_parcel')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('ba-coordinate-info')).toHaveSize(1);
		});

		it('renders the content when administration is NOT available', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(administrationServiceMock, 'getAdministration').and.resolveTo(null);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.r_community')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.r_district')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.r_parcel')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('ba-coordinate-info')).toHaveSize(1);
		});

		it('renders selectable content', async () => {
			// HINT: the existence of the behavior (user select text) is driven by css-classes specified in main.css and mvuElement.css.
			// All elements are not selectable by default, but can be activated with the 'selectable' class.
			const cssClass = 'selectable';
			const coordinateMock = [1000, 2000];
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.content').classList.contains(cssClass)).toBeTrue();
		});

		it('copies a community value to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			const element = await setup();

			element.coordinate = [...coordinateMock];
			await TestUtils.timeout();
			const copyIcon = element.shadowRoot.querySelector(`.r_community ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith('LDBV');
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"LDBV" map_contextMenuContent_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies a district value to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			const element = await setup();

			element.coordinate = [...coordinateMock];
			await TestUtils.timeout();
			const copyIcon = element.shadowRoot.querySelector(`.r_district ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith('Ref42');
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"Ref42" map_contextMenuContent_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies a parcel value to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(administrationServiceMock, 'getAdministration')
				.withArgs(coordinateMock)
				.and.resolveTo({ community: 'LDBV', district: 'Ref42', parcel: '42/42' });
			const element = await setup();

			element.coordinate = [...coordinateMock];
			await TestUtils.timeout();
			const copyIcon = element.shadowRoot.querySelector(`.r_parcel ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith('42/42');
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"42/42" map_contextMenuContent_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});
	});

	describe('Clipboard API is not available', () => {
		it('fires a notification and logs a warn statement and disables all copyToClipboard buttons', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = coordinateMock;
			await TestUtils.timeout();

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();

			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));

			copyIcon.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('map_contextMenuContent_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
		});
	});

	describe('AdministrationServices throws', () => {
		it('resets the model and re-throws the error', async () => {
			await setup();
			const error = new Error('Administration Error');
			spyOn(administrationServiceMock, 'getAdministration').and.rejectWith(error);
			const element = new MapContextMenuContent({
				coordinate: null,
				administration: {
					community: 'c',
					district: 'd',
					parcel: 'p'
				}
			});

			await expectAsync(element._getAdministration([1000, 2000])).toBeRejectedWith(error);

			expect(element.getModel()).toEqual({
				coordinate: null,
				administration: {
					community: null,
					district: null,
					parcel: null
				}
			});
		});
	});
});
