import { $injector } from '../../../injection';
import { provide as shareProvider } from './share.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('shareProvider', shareProvider);
