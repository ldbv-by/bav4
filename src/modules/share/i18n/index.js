import { provide as shareProvider } from './share.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('shareProvider', shareProvider);
