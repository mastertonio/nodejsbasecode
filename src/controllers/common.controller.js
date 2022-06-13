const jwtToken = require('jwt-decode');

const jwtExtract = (req) =>{
    let params = req.headers.authorization;
    let token = params.split(" ");
    const decode = jwtToken(token[1]);
    return decode.sub;
}

module.exports = {
    jwtExtract
}