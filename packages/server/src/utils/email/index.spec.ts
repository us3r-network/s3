import {
  createEmailTemplate,
  DEFAULT_FROM_ADDRESS,
  getEmailTemplate,
  listEmailTemplates,
  sendTemplateEmail,
  TEMPLETES,
} from './';

const TO_ADDRESS = 'bufan@hotmail.com';

describe('Send Templete Email Test', () => {
  it(
    'send a Templete Email from ' + DEFAULT_FROM_ADDRESS + ' to ' + TO_ADDRESS,
    async () => {
      const sendTemplateEmailResult = await sendTemplateEmail(
        TEMPLETES[2].name,
        { activateCode: '123456' },
        TO_ADDRESS,
        DEFAULT_FROM_ADDRESS,
      );
      // console.log(sendTemplateEmailResult);
      expect(sendTemplateEmailResult.$metadata.httpStatusCode).toBe(200);
    },
  );
});

// npm test src/utils/email
