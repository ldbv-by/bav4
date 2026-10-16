import { $injector } from '../../../injection';
import { provide as notificationsProvider } from './notifications.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('notificationsProvider', notificationsProvider);
