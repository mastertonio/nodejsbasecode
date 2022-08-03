const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers', 'getDashboard','createCompany','getCompany',
          'patchCompany','updateCompany','createCompanyUser',
          'createCompnayTemplate', 'listCompanyTemplate',
          "createCompnayTemplateVersion"],
  "company-admin": ['getCompany','createCompany','createCompanyUser',
                    'createCompnayTemplate','listCompanyTemplate',
                    'createCompnayTemplateVersion']
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
