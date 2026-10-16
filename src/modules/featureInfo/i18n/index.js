import { $injector } from '../../../injection';
import { provide } from './featureInfo.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('featureInfoProvider', provide);
