export type TemplateData = {
  name: string;
  subject: string;
  path: string;
  params: string[];
};

export const TEMPLETES: TemplateData[] = [
  {
    name: 'confirm-email',
    subject: 'WL.xyz email confirm',
    path: './confirmEmail.html',
    params: ['confirmEmailURL'],
  },
  {
    name: 'activateCode-email',
    subject: 'WL.xyz email confirm',
    path: './activateCodeEmail.html',
    params: ['activateCode'],
  },
  {
    name: 'activateCode-email-u3',
    subject: 'u3.xyz email confirm',
    path: './activateCodeEmailU3.html',
    params: ['activateCode'],
  },
];
