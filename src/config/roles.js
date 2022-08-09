const allRoles = {
  user: [],
  "company-manager": [],
  "company-agent": [],
  admin: ['getUsers', 'manageUsers', 'getDashboard','patchCompany','createCompany','getCompany','getUser',
          'updateCompany',
          'createCompanyUser','getManager','getCurrency','getAllUser','patchCompanyUser',
          'createCompnayTemplate', 'listCompanyTemplate','transferTemplate',
          "createCompnayTemplateVersion"],
  "company-admin": ['getCompany','createCompanyUser','getUsers','getUser',
                    'createCompnayTemplate','listCompanyTemplate',
                    'createCompnayTemplateVersion','getAllUser','transferTemplate','patchCompanyUser',
                    'getCurrency','getManager']
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
