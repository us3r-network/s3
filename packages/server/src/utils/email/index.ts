export {
  createSESTemplate as createEmailTemplate,
  updateSESTemplate as updateEmailTemplate,
  getSESTemplate as getEmailTemplate,
  listSESTemplates as listEmailTemplates,
  sendSESTemplatedEmail as sendTemplateEmail,
} from './ses_template';
export { TEMPLETES, TemplateData } from './templates';
export const DEFAULT_FROM_ADDRESS = 'noreply@u3.xyz';
