/* eslint-disable no-undef */
import { MapContextMenuContent } from '../../../../../src/modules/map/components/contextMenu/MapContextMenuContent';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { Icon } from '../../../../../src/modules/commons/components/icon/Icon';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { GlobalCoordinateRepresentations } from '../../../../../src/domain/coordinateRepresentation';

window.customElements.define(MapContextMenuContent.tag, MapContextMenuContent);

window.customElements.define(Icon.tag, Icon);

describe('MapContextMenuContent', () => {
	const mapServiceMock = {
		getCoordinateRepresentations() {},
		getSrid() {}
	};
	const coordinateServiceMock = {
		stringify() {}
	};
	const shareServiceMock = {
		copyToClipboard() {}
	};
	const elevationServiceMock = {
		getElevation() {}
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
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('ElevationService', elevationServiceMock)
			.registerSingleton('AdministrationService', administrationServiceMock);

		return TestUtils.render(MapContextMenuContent.tag);
	};

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new MapContextMenuContent();

			expect(element.getModel()).toEqual({
				coordinate: null,
				elevation: null,
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
			const elevationMock = spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(42);
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
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.label')).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('.label')[0].innerText).toBe('map_contextMenuContent_community_label');
			expect(element.shadowRoot.querySelectorAll('.label')[1].innerText).toBe('map_contextMenuContent_district_label');
			expect(element.shadowRoot.querySelectorAll('.label')[2].innerText).toBe('map_contextMenuContent_parcel_label');
			expect(element.shadowRoot.querySelectorAll('.label')[3].innerText).toBe('map_contextMenuContent_elevation_label');

			expect(element.shadowRoot.querySelectorAll('.coordinate')[0].innerText).toEqual('LDBV');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[1].innerText).toEqual('Ref42');
			expect(element.shadowRoot.querySelectorAll('.coordinate')[2].innerText).toEqual('Parcel');
			const badge = element.shadowRoot.querySelector('ba-badge');
			expect(badge.color).toEqual('var(--text3)');
			expect(badge.background).toEqual('var(--roles-color)');
			expect(badge.label).toEqual('map_contextMenuContent_parcel_badge');
			expect(badge.size).toEqual('0.6');

			expect(element.shadowRoot.querySelectorAll('.coordinate')[3].innerText).toEqual('42');

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();
			expect(copyIcon.title).toBe('map_contextMenuContent_copy_icon');
			expect(elevationMock).toHaveBeenCalledOnceWith(coordinateMock);
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
			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(42);
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
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(1);
		});

		it('renders the content when administration is NOT available', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(42);
			spyOn(administrationServiceMock, 'getAdministration').and.resolveTo(null);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.r_community')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.r_district')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.r_parcel')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('ba-coordinate-info')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(1);
		});

		it('renders the content when elevation is NOT available', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(null);
			spyOn(administrationServiceMock, 'getAdministration')
				.withArgs(coordinateMock)
				.and.resolveTo({ community: 'LDBV', district: 'Ref42', parcel: 'parcel' });
			const element = await setup();

			element.coordinate = [...coordinateMock];

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.r_community')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_district')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_parcel')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-coordinate-info')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.r_elevation')).toHaveSize(0);
		});

		it('renders selectable content', async () => {
			// HINT: the existence of the behavior (user select text) is driven by css-classes specified in main.css and mvuElement.css.
			// All elements are not selectable by default, but can be activated with the 'selectable' class.
			const cssClass = 'selectable';
			const coordinateMock = [1000, 2000];
			const stringifiedCoord = 'stringified coordinate';
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
			spyOn(coordinateServiceMock, 'stringify').and.returnValue(stringifiedCoord);
			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(42);
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
			const element = await setup();

			element.coordinate = [...coordinateMock];

			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.content').classList.contains(cssClass)).toBeTrue();
		});

		it('copies a coordinate to the clipboard', async () => {
			const coordinateMock = [1000, 2000];
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			spyOn(elevationServiceMock, 'getElevation').withArgs(coordinateMock).and.resolveTo(42);
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			const element = await setup();

			element.coordinate = [...coordinateMock];
			await TestUtils.timeout();
			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith('LDBV');
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"LDBV" map_contextMenuContent_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('fires a notification and logs a warn statement when Clipboard API is not available and disables all copyToClipboard buttons', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = coordinateMock;

			await TestUtils.timeout();

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();

			copyIcon.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('map_contextMenuContent_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
		});
	});

	describe('Clipboard API is not available', () => {
		it('fires a notification and logs a warn statement and disables all copyToClipboard buttons', async () => {
			const coordinateMock = [1000, 2000];
			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			spyOn(administrationServiceMock, 'getAdministration').withArgs(coordinateMock).and.resolveTo({ community: 'LDBV', district: 'Ref42' });
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();

			element.coordinate = coordinateMock;

			await TestUtils.timeout();

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			expect(copyIcon).toBeTruthy();

			copyIcon.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('map_contextMenuContent_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
		});
	});

	describe('ElevationService throws', () => {
		it('resets the model and re-throws the error', async () => {
			await setup();
			const error = new Error('Elevation Error');
			spyOn(elevationServiceMock, 'getElevation').and.rejectWith(error);
			const element = new MapContextMenuContent({
				coordinate: null,
				elevation: 12345,
				administration: {
					community: null,
					district: null,
					parcel: null
				}
			});

			await expectAsync(element._getElevation([1000, 2000])).toBeRejectedWith(error);

			expect(element.getModel()).toEqual({
				coordinate: null,
				elevation: null,
				administration: {
					community: null,
					district: null,
					parcel: null
				}
			});
		});
	});

	describe('AdministrationServices throws', () => {
		it('resets the model and re-throws the error', async () => {
			await setup();
			const error = new Error('Administration Error');
			spyOn(administrationServiceMock, 'getAdministration').and.rejectWith(error);
			const element = new MapContextMenuContent({
				coordinate: null,
				elevation: null,
				administration: {
					community: 'c',
					district: 'd',
					parcel: 'p'
				}
			});

			await expectAsync(element._getAdministration([1000, 2000])).toBeRejectedWith(error);

			expect(element.getModel()).toEqual({
				coordinate: null,
				elevation: null,
				administration: {
					community: null,
					district: null,
					parcel: null
				}
			});
		});
	});
});
