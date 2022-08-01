const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers', 'getDashboard','createCompany','getCompany','patchCompany','updateCompany'],
  "company-admin": ['getCompany']
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
