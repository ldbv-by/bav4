import { $injector } from '../../../../src/injection/index.js';
import { LastModifiedItem } from '../../../../src/modules/geoResourceInfo/components/LastModifiedItem.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(LastModifiedItem.tag, LastModifiedItem);

describe('LastModifiedItem', () => {
	const geoResourceServiceMock = {
		byId() {}
	};

	const fileStorageServiceMock = {
		isFileId: (id) => id.startsWith('f-'),
		isAdminId: (id) => id.startsWith('a-')
	};

	const setup = () => {
		const initialState = {};

		TestUtils.setupStoreAndDi(initialState, { notifications: notificationReducer, media: createNoInitialStateMediaReducer() });
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock);
		$injector.registerSingleton('FileStorageService', fileStorageServiceMock);
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(LastModifiedItem.tag);
	};

	describe('when initialized', () => {
		it('should render nothing when geoResourceId and lastModified are null', async () => {
			const element = await setup();

			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(0);
		});

		it('should render nothing when lastModified is null', async () => {
			const element = await setup();

			element.geoResourceId = 'some-id';

			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(0);
		});

		it('should render nothing when geoResourceId is null', async () => {
			const element = await setup();

			element.lastModified = '123456789';

			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(0);
		});

		it('should render nothing when geoResourceId revers to undefined georesource', async () => {
			const element = await setup();
			spyOn(fileStorageServiceMock, 'isFileId').withArgs('unknown-id').and.returnValue(false);
			spyOn(geoResourceServiceMock, 'byId').withArgs('unknown-id').and.returnValue(null);

			element.geoResourceId = 'unknown-id';
			element.lastModified = '123456789';

			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(0);
		});

		it('should render nothing when lastModified is not a number', async () => {
			const element = await setup();

			element.geoResourceId = 'some-id';
			element.lastModified = 'not-a-number';
			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs.length).toBe(0);
		});

		it('should render the lastModified date and id when geoResourceId and lastModified are set', async () => {
			const element = await setup();
			spyOn(fileStorageServiceMock, 'isFileId').withArgs('some-id').and.returnValue(false);
			spyOn(geoResourceServiceMock, 'byId').withArgs('some-id').and.returnValue({ collaborativeData: false });

			element.geoResourceId = 'some-id';
			element.lastModified = 123456789;
			await TestUtils.timeout();
			const divs = element.shadowRoot.querySelectorAll('div');

			expect(divs).toHaveSize(9);
			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.title')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.value')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.description')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.description-text')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.infographic')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.value.id').innerText).toBe('some-id');
			expect(new Date(element.shadowRoot.querySelector('.value.last-modified').innerText)).toEqual(jasmine.any(Date));
			expect(element.shadowRoot.querySelector('.description-text').innerText).toBe('');
		});

		it('should render a specific description for a geoResource as fileId', async () => {
			const element = await setup();
			spyOn(fileStorageServiceMock, 'isFileId').withArgs('some-id').and.returnValue(true);
			spyOn(geoResourceServiceMock, 'byId').withArgs('some-id').and.returnValue({ collaborativeData: false });

			element.geoResourceId = 'some-id';
			element.lastModified = 123456789;

			await TestUtils.timeout();

			expect(element.shadowRoot.querySelectorAll('.description')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.description-text')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.infographic')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.description-text').innerText).toBe(
				'geoResourceInfo_last_modified_description geoResourceInfo_last_modified_description_copy'
			);
		});

		it('should render a specific description for a geoResource as adminId', async () => {
			const element = await setup();
			spyOn(fileStorageServiceMock, 'isFileId').withArgs('some-id').and.returnValue(true);
			spyOn(geoResourceServiceMock, 'byId').withArgs('some-id').and.returnValue({ collaborativeData: true });

			element.geoResourceId = 'some-id';
			element.lastModified = 123456789;

			await TestUtils.timeout();

			expect(element.shadowRoot.querySelectorAll('.description')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.description-text')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.infographic')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.description-text').innerText).toBe(
				'geoResourceInfo_last_modified_description geoResourceInfo_last_modified_description_collaborative'
			);
		});
	});
});
