import { provide as geoResourceInfoProvider } from './geoResourceInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('geoResourceInfoProvider', geoResourceInfoProvider);
