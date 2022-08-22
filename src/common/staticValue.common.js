const value = {}
value.ACTIVE = "active";
value.INACTIVE = "inactive";
value.LOGGER_INVALID_TOKEN = "[Invalid Token]";
value.STATUS_ACTIVE = 1;
value.STATUS_INACTIVE = 0;
value.NO_RECORD_FOUND = "No record found!";
//user
value.USER_ERROR = {
    NOT_FOUND: 'User not found!',
    UNAUTHORIZED: 'Unauthorized user access',
}
//company module
value.INSUFFICIENT_LICENSE ="insufficient license"
value.LICENSE_ERROR ="[Company Module]"

value.ROLE = {
    ADMIN:'admin',
    COMPANY_ADMIN: 'company-admin',
    COMPANY_MANAGER: 'company-manager',
    COMPANY_AGENT: 'company-agent'
}

module.exports = value;