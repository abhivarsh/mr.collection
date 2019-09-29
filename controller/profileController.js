var express = require('express');
var app = module.exports = express();
var itemModel = require('../models/itemDB.js');
var userDBModel = require('../models/userDB.js');
var userItemModel = require('../models/userItem.js');
var userProfileModel = require('../models/userProfile.js');
//var confirm = require('confirm-dialog');

const path = require('path');

//Setting up static files path and views
app.set('views', path.join(__dirname, '../views'));
app.set('view engine','ejs');

//myFavorite Categories
app.get('/myItems',async function(req,res){

  try{

    //check if session variable is set or not
    var theUser = req.session.theUser;
    if( theUser == undefined){

      res.render('myItems', {
          userId: "",
          userItems: "",
          username : ""
      });

    }
    //session variable to not null
      else if(theUser != null || theUser != undefined){
        var user = req.session.theUser;
        req.session.currentUserProfile =await userDBModel.getUserProfile(user.userId);
        var currentUserProfile = req.session.currentUserProfile;
        var action = req.query.action;
    //if no action is given then redirect to myItems page
        if(action == undefined){
          res.render('myItems',{
            success:true,
            userId: user.userId,
            username: user.firstName + " " + user.lastName,
            userItems: currentUserProfile.userItems
          });
        }
    //when action is "Delete"
        else if(action == "delete"){
          var itemCode = req.query.itemCode;
          req.check('itemCode')
          .notEmpty()
          .withMessage('The itemCode cannot be empty!!!')
          .isLength({min:5,max:6})
          .withMessage('ItemId is of not proper length');

          var validationError = req.validationErrors();
          if(validationError){
            console.log("validation errors : ",validationError);
           res.redirect('/myItems');
          }else{
            console.log("In delete action : ",itemCode);

            // confirm('DO YOU WANT TO DELETE THE ITEM?').then(function() {
            //   // yes
            //   //use actions present in userProfile to perform delete action
            //   req.session.currentUserProfile.removeItem(itemCode);
            // }, function() {
            //   // no
            // })
            //req.session.currentUserProfile.removeItem(itemCode);
            await userDBModel.removeItem(user.userId,itemCode);
            res.redirect('/myItems');
          }
        }
    //When action is "Save"
        else if(action == "save"){
          var itemCode = req.query.itemCode;

          req.check('itemCode')
          .notEmpty()
          .withMessage('The itemCode cannot be empty!!!')
          .isLength({min:5,max:6})
          .withMessage('ItemId is of not proper length');

          var validationError = req.validationErrors();
          if(validationError){
            console.log("validation errors : ",validationError);
           res.redirect('/myItems');
          }else{
            console.log("In SAVE action : ",itemCode);
            var itemPresent = false;
            var itemPresentInRated = false;
            //check if already present!!
            for(var i=0; i< req.session.currentUserProfile.userItems.length; i++){
              if(req.session.currentUserProfile.userItems[i].item.itemCode === itemCode){
                //alert that the item already present!!
                console.log("item already present!!");
                itemPresent= true;
              }
            }

            //If item not present
            if(!itemPresent){
              var item =await itemModel.getItem(itemCode);
              var ratedItems = await userDBModel.getUserRatedItems(user.userId);
              var itemPresent = false;
              var userItem = null;
              for(var j=0; j< ratedItems.length; j++){
                if(ratedItems[j].item.itemCode == itemCode){
                  itemPresent = true;
                  var itemInclude = [];
                  itemInclude[0] = ratedItems[j].item;
                  userItem =  userItemModel.userItem(itemInclude,ratedItems[j].rating,ratedItems[j].rented);
                  console.log("item present!!: ",userItem);
                  await userDBModel.removeUserRatedItems(user.userId,itemCode);
                }
              }
              if(!itemPresent){
                userItem = userItemModel.userItem(item,0,"No");
              }
              //use actions present in userProfile to perform delete action
              await userDBModel.addItem(user.userId, userItem);
            }
            res.redirect('/myItems');
          }
          }
      }
  }
  catch(err){
    console.log("in items error: ");
    console.log(err);
  }

  })
  .get('/myRatedItems',async function(req, res){

    try{

      //check if session variable is set or not
      var theUser = req.session.theUser;
      if( theUser == undefined){

        res.render('myRatedItems', {
            userId: "",
            userItems: "",
            username : ""
        });

      }
      //session variable to not null
        else if(theUser != null || theUser != undefined){
          var user = req.session.theUser;
          req.session.currentUserProfile =await userDBModel.getUserProfile(user.userId);
          var currentUserProfile = req.session.currentUserProfile;
          var action = req.query.action;
          var ratedItems = await userDBModel.getUserRatedItems(user.userId);
          console.log("in rate items : user defined",ratedItems);
          var userItems = [];
          if(ratedItems != null){
            var userItems = ratedItems;
          }
      //if no action is given then redirect to myItems page
          if(action == undefined){
            res.render('myRatedItems',{
              success:true,
              userId: user.userId,
              username: user.firstName + " " + user.lastName,
              userItems: userItems
            });
          }
        }
    }
    catch(err){
      console.log("in items error: ");
      console.log(err);
    }

  });
