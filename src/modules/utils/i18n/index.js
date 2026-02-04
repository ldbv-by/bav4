import { provide as defInfoProvider } from './defInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('devInfoProvider', defInfoProvider);
