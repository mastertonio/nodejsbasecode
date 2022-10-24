const jwtToken = require('jwt-decode');

const getCID = (req) => {
    let params = req.headers.authorization;
    let token = params.split(" ");
    const decode = jwtToken(token[1]);
    return decode.cid;
}

const jwtExtract = (req) =>{
  console.log(req.headers)
    let params = req.headers.authorization;
    let token = params.split(" ");
    const decode = jwtToken(token[1]);
    return decode.sub;
}

const getUserRole = (req) => {
    req.role = parseInt(req.role);
    switch (req.role) {
      case 1:
          req.role = "admin"
        return req;
      case 2:
          req.role = "company-admin"
        return req;
      case 3:
          
          req.role = "company-manager"
        return req;
      case 4:
          req.role = "company-agent"
        return req;
      default:
        delete req.role;
        return req
    }
    
}

module.exports = {
    jwtExtract,
    getCID,
    getUserRole
}