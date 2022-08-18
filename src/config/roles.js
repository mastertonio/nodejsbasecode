const allRoles = {
  user: [],
  "company-manager": ['getDashboard'],
  "company-agent": ['getDashboard'],
  admin: ['getUsers', 'manageUsers', 'getDashboard','patchCompany','createCompany','getCompany','getUser',
          'updateCompany',
          'createCompanyUser','getManager','getCurrency','getAllUser','patchCompanyUser',
          'createCompnayTemplate', 'listCompanyTemplate','transferTemplate','getAllUserTemplate','patchCompnayTemplate','CompnayTemplateInfo','patchCompnayTemplateVersion',
          'getCompnayTemplateVersion',"createCompnayTemplateVersion"],
  "company-admin": ['getCompany','createCompanyUser','getUsers','getUser',
                    'createCompnayTemplate','listCompanyTemplate',
                    'createCompnayTemplateVersion','getAllUser','transferTemplate','patchCompanyUser','getAllUserTemplate','patchCompnayTemplate','CompnayTemplateInfo','patchCompnayTemplateVersion',
                    'getCompnayTemplateVersion','getCurrency','getManager','getDashboard']
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
