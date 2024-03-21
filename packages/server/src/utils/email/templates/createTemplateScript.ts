import {
  createEmailTemplate,
  getEmailTemplate,
  updateEmailTemplate,
} from '../';
import { TEMPLETES, TemplateData } from './';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
//读模板文件
const readTemplateHTML = async (filePath: string) => {
  const templateFile = await fs.readFileSync(path.join(__dirname, filePath));
  return templateFile.toString();
};

const updateTempletes = async () => {
  TEMPLETES.forEach(async (item: TemplateData) => {
    const existTemplate = await getEmailTemplate(item.name);
    const templateHTML = await readTemplateHTML(item.path);
    // console.log(existTemplate, templateHTML);
    if (!existTemplate?.Template?.TemplateName) {
      const newTemplate = await createEmailTemplate(
        item.name,
        item.subject,
        templateHTML,
      );
      console.log('create new template:', newTemplate.Template?.TemplateName);
    } else {
      if (
        existTemplate.Template.HtmlPart != templateHTML ||
        existTemplate.Template.SubjectPart != item.subject
      ) {
        await updateEmailTemplate(item.name, item.subject, templateHTML);
        console.log(
          'update exist template:',
          existTemplate.Template?.TemplateName,
        );
      }
    }
  });
};
updateTempletes();
