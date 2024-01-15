import {
  CreateTemplateCommand,
  UpdateTemplateCommand,
  GetTemplateCommand,
  ListTemplatesCommand,
  SendTemplatedEmailCommand,
  DeleteTemplateCommand,
} from '@aws-sdk/client-ses';
import { SESClient } from '@aws-sdk/client-ses';
// Set the AWS Region.
const REGION = 'ap-southeast-1'; //Singapore
// Create SES service object.
const sesClient = new SESClient({ region: REGION });

//创建
const createSESTemplate = async (templateName, subject, html, text = '') => {
  const createTemplateCommand = new CreateTemplateCommand({
    Template: {
      TemplateName: templateName,
      HtmlPart: html,
      TextPart: text,
      SubjectPart: subject,
    },
  });

  try {
    return await sesClient.send(createTemplateCommand);
  } catch (err) {
    console.log('Failed to create template.', err);
    return err;
  }
};

//更新
const updateSESTemplate = async (templateName, subject, html, text = '') => {
  const updateTemplateCommand = new UpdateTemplateCommand({
    Template: {
      TemplateName: templateName,
      HtmlPart: html,
      TextPart: text,
      SubjectPart: subject,
    },
  });

  try {
    return await sesClient.send(updateTemplateCommand);
  } catch (err) {
    console.log('Failed to update template.', err);
    return err;
  }
};

//删除
const deleteSESTemplate = async (templateName) => {
  const deleteTemplatesCommand = new DeleteTemplateCommand({
    TemplateName: templateName,
  });

  try {
    return await sesClient.send(deleteTemplatesCommand);
  } catch (err) {
    console.log('Failed to delete templates.', err);
    return err;
  }
};

//列表
const listSESTemplates = async (maxItems) => {
  const listTemplatesCommand = new ListTemplatesCommand({ MaxItems: maxItems });

  try {
    return await sesClient.send(listTemplatesCommand);
  } catch (err) {
    console.log('Failed to list templates.', err);
    return err;
  }
};

//获取
const getSESTemplate = async (templateName) => {
  const getTemplateCommand = new GetTemplateCommand({
    TemplateName: templateName,
  });
  try {
    return await sesClient.send(getTemplateCommand);
  } catch (err) {
    console.log('Failed to get email template.', err);
    return err;
  }
};

//发送
const sendSESTemplatedEmail = async (
  templateName,
  data,
  toAddresses,
  fromeAddresses,
) => {
  const sendReminderEmailCommand = new SendTemplatedEmailCommand({
    Source: fromeAddresses,
    Destination: { ToAddresses: [toAddresses] },
    Template: templateName,
    TemplateData: JSON.stringify(data),
  });
  try {
    return await sesClient.send(sendReminderEmailCommand);
  } catch (err) {
    console.log('Failed to send template email', err);
    return err;
  }
};

export {
  createSESTemplate,
  updateSESTemplate,
  deleteSESTemplate,
  getSESTemplate,
  listSESTemplates,
  sendSESTemplatedEmail,
};
