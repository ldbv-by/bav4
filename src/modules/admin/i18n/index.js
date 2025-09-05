import { $injector } from '../../../injection';
import { provide as adminProvider } from './admin.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('adminProvider', adminProvider);
