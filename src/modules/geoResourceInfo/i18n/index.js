import { $injector } from '../../../injection';
import { provide as geoResourceInfoProvider } from './geoResourceInfo.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('geoResourceInfoProvider', geoResourceInfoProvider);
