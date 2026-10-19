import { $injector } from '../../../injection';
import { provide as oafProvider } from './oaf.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('oafProvider', oafProvider);
