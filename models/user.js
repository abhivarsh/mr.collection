var user = function(userId,firstName,lastName,email,pwd){

  userModel = {
    userId : userId,
    firstName : firstName,
    lastName : lastName,
    email : email,
    password:pwd
  }
  return userModel;
}

module.exports.user = user;
