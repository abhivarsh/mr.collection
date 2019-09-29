var express = require('express');
var app = express();
//Required
var itemDBModel = require('./itemDB');
var userModel = require('./user');
var userItemModel = require('./userItem');
var userProfileModel = require('./userProfile');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mrCollection',{ useNewUrlParser: true, useFindAndModify: false },function(err){
  if(err) throw err;
  console.log("Successfully connected!!");
});

//user database
var userSchema = mongoose.Schema({
  userId : {type:String, required:true, unique: true},
  firstName : String,
  lastName : String,
  email : String,
  password: String
},{collection:'userData'});

//items linked to the user
var userItemSchema = mongoose.Schema({
  userId:{type:String, required:true},
  item : {
    itemCode:{type:String, required:true},
    itemName:String,
    itemCategory:String,
    itemDescription:String,
    itemRating:Number,
    itemImg:String,
    itemSize:String,
    sellerId:String,
    itemSellerInfo:String,
    itemSellerRating:Number,
    itemCost:String
  },
  rating : String,
  rented : String
},{collection:'userItemData'});

//items rated by the user
var userRatedItemsSchema = mongoose.Schema({
  userId:{type:String, required:true},
  item : {
    itemCode:{type:String, required:true},
    itemName:String,
    itemCategory:String,
    itemDescription:String,
    itemRating:Number,
    itemImg:String,
    itemSize:String,
    sellerId:String,
    itemSellerInfo:String,
    itemSellerRating:Number,
    itemCost:String
  },
  rating : String,
  rented : String
},{collection:'userRatedItemsData'});

var user = mongoose.model('userData',userSchema);
var userItem = mongoose.model('userItemData',userItemSchema);
var userRatedItems = mongoose.model('userRatedItemsData',userRatedItemsSchema);

//Defining users to login
// var user1 = userModel.user('usr001','Abhi','Peddireddy','abhi@collections.com');
// var user2 = userModel.user('usr002','Naga','Reddy','naga@collections.com');


//Return list of all the users
//For now I'm returning the first user.
exports.getUsers = async function(){
  console.log("in get users");
  var usr=null;
  await user.find(function(err, data){
    if(err) {
      throw err;
    }
    else{
      usr = data;
    }
  });
  return usr;
}

//Return a particular users
exports.getUser = async function(id){
  console.log("in get user");
  var usr=null;
  await user.find({'userId':id},function(err, data){
    if(err) {
      throw err;
    }
    else{
      usr = data;
    }
  });
  return usr;
}

//Return profile for a particular user
exports.getUserProfile =async function(userId){
  if(userItem){
      return new userProfileModel(userId, await userItem.find({"userId": userId}));

  }
}

//remove the userItem form the database
exports.removeItem = async function(userId,itemCode){
  console.log("in removeItem userDB");
  if(userItem){
    console.log(userId+" : "+itemCode);
    var item =await userItem.remove({'userId':userId, 'item.itemCode':itemCode});
  }
}

//Add the userItem to the database
exports.addItem = async function(userId, uItem){
  console.log("in addItem userDB",uItem.item[0].sellerId);
  if(userItem){
    var item = new userItem({
      'userId' : userId,
      'item' : {
        'itemCode':uItem.item[0].itemCode,
        'itemName':uItem.item[0].itemName,
        'itemCategory':uItem.item[0].itemCategory,
        'itemDescription':uItem.item[0].itemDescription,
        'itemRating':uItem.item[0].itemRating,
        'itemImg':uItem.item[0].itemImg,
        'itemSize':uItem.item[0].itemSize,
        'sellerId':uItem.item[0].sellerId,
        'itemSellerInfo':uItem.item[0].itemSellerInfo,
        'itemSellerRating':uItem.item[0].itemSellerRating,
        'itemCost':uItem.item[0].itemCost
      },
      'rating' : uItem.rating,
      'rented' : uItem.rented
    });
    await item.save(function(err, data){
      if(err) console.log(err);
      if(data.nModified) console.log("userItem has been saved successfully!!");
    });
  }
}


//Update the userItem to the database
exports.updateItem = async function(userId, uItem){
  console.log("in updateItem userDB");
  if(userItem){
    await userItem.findOneAndUpdate({'userId':userId, 'item.itemCode':uItem.item[0].itemCode},{'rating' :uItem.rating,'rented' :uItem.rented},function(err,data){
      if(err) console.log(err);
    });
  }
}

//get user rated items from the databse.
exports.getUserRatedItems = async function(userId){
  if(userRatedItems){
    console.log("in userRatedItems!!!",userId);
    var ratedItems = null;
    await userRatedItems.find({'userId':userId},function(err, data){
      if(err){
        console.log(err);
      }
      else{
        ratedItems = data;
      }
    });
    return ratedItems;
  }
}

//remove a user rated item from the databse.
exports.removeUserRatedItems = async function(userId, itemCode){
  if(userRatedItems){
    await userRatedItems.remove({'userId':userId,'item.itemCode':itemCode});
  }
}

//add user rated item to the database.
exports.addUserRatedItem = async function(userId, uItem){
  if(userRatedItems){
    await userRatedItems.findOneAndUpdate({'userId':userId,'item.itemCode':uItem.item[0].itemCode},{
      'userId' : userId,
      'item' : {
        'itemCode':uItem.item[0].itemCode,
        'itemName':uItem.item[0].itemName,
        'itemCategory':uItem.item[0].itemCategory,
        'itemDescription':uItem.item[0].itemDescription,
        'itemRating':uItem.item[0].itemRating,
        'itemImg':uItem.item[0].itemImg,
        'itemSize':uItem.item[0].itemSize,
        'sellerId':uItem.item[0].sellerId,
        'itemSellerInfo':uItem.item[0].itemSellerInfo,
        'itemSellerRating':uItem.item[0].itemSellerRating,
        'itemCost':uItem.item[0].itemCost
      },
      'rating' : uItem.rating,
      'rented' : uItem.rented
    },{upsert:true},function(err,data){
      if(err) console.log(err);
      else console.log("successfully updated the rating!!");
    });
}
}
// var items = itemDBModel.getItems();
// console.log("In userDB: ",items);
// var userItem1 = userItemModel.userItem(items[0],4,'Yes');
// var userItem2 = userItemModel.userItem(items[2],2,'No');
// var userItem3 = userItemModel.userItem(items[5],4,'Yes');
// var userItem4 = userItemModel.userItem(items[6],1,'Yes');
// var userItem5 = userItemModel.userItem(items[1],3,'No');
// var userItem6 = userItemModel.userItem(items[9],5,'No');
// var userItem7 = userItemModel.userItem(items[8],3,'Yes');
//
// //List of userItems for each users
// var itemListUser1 = [userItem1,userItem3,userItem5,userItem7];
// var itemListUser2 = [userItem2,userItem4,userItem6];

//Add userProfile to the userProfileList
// userProfileList = [];
// userProfileList.push(new userProfileModel(user1.userId,itemListUser1));
// userProfileList.push(new userProfileModel(user2.userId,itemListUser2));

//Return all the userProfileList
// exports.getUserProfiles = function(){
//   return userProfileList;
// }
