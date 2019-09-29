var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var item = require('../models/item.js');
var itemModel = require('../models/itemDB.js');
var userDBModel = require('../models/userDB.js');
var userItemModel = require('../models/userItem.js');
var userProfileModel = require('../models/userProfile.js');
var profileController = require('./profileController.js');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, './public/images/uploads/');
  },
  filename: function(req, file, callback){
    callback(null, new Date().toISOString() + file.originalname);
  }
});
var upload = multer({storage: storage});

router.use(profileController);
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/',function(req,res){
  var username = "";
  if(req.session.theUser != undefined){
    username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
  }
  res.render('index',{username:username});
})
.get('/register',function(req, res){
  var username = "";
  if(req.session.theUser != undefined){
    username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
    res.redirect('/myItems')
  }
  res.render('register',{username:username});
})
.get('/addMyAccessory',async function(req,res){
  try{
    var username = "";
    if(req.session.theUser != undefined){
      username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
    }else{
      res.redirect('/')
    }
    var listOfCategories = await itemModel.getCategories();
    res.render('addMyAccessory',{username:username,categories:listOfCategories});
  }catch(err){
    console.log("in addMyAccessory error!!");
  }
})
.post('/addAccessory',urlencodedParser,upload.single('itemImg'), async function(req, res){
  try{
    //console.log("file file file file file: ##### :"+req.file.path +" : "+req.file.destination);
    var username = "";
    var itemName = req.body.itemName;
    var itemCategory = req.body.itemCategory;
    var itemDescription = req.body.itemDescription;
    var itemSize = req.body.itemSize;
    var itemCost = req.body.itemCost;
    var itemRating = 0;
    var itemImg = req.file.path;
    var sellerId = "";
    var itemSellerInfo = "";
    var itemSellerRating = 0;
    if(req.session.theUser != undefined){
      username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
      sellerId = req.session.theUser.userId;
    }

    //Generating a unique itemCode
    var min = 100;
    var max = 999;
    var random = Math.floor(Math.random()*(max - min))+min;
    var itemCode = itemName.substring(0,3)+random.toString();

    var cost = "$"+itemCost+" per Day";

    //creating an instance for the item object
    var newItem = item.item(itemCode, itemName, itemCategory,
      itemDescription, itemRating, itemImg.substr(6,), itemSize,
    sellerId, itemSellerInfo, itemSellerRating, cost);

    await itemModel.addNewItem(newItem);

    res.redirect('/catalog');


  }catch(err){
    console.log(err);
    console.log("in addAccessory error!!!");
  }
})
.get('/editMyAccessory', async function(req, res){
  try{
    var itemCode = req.query.itemCode;
    var username = "";
    if(req.session.theUser != undefined){
      username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
    }else{
      res.redirect('/')
    }
    var listOfCategories = await itemModel.getCategories();
    var item = await itemModel.getItem(itemCode);
    console.log("######## editmyaccessories: !#########"+item);
    res.render('editMyAccessory',{username:username,categories:listOfCategories,item:item});
  }catch(err){
    console.log("in editMyAccessory error!!");
  }
})
.post('/updateAccessory',urlencodedParser, async function(req, res){
  try{
    var itemName = req.body.itemName;
    var itemCategory = req.body.itemCategory;
    var itemDescription = req.body.itemDescription;
    var itemSize = req.body.itemSize;
    var itemCost = req.body.itemCost;
    var itemCode = req.body.itemCode;

    var cost = "$"+itemCost+" per Day";

    var oldItem = await itemModel.getItem(itemCode);

    //creating an instance for the item object
    var newItem = item.item(itemCode, itemName, itemCategory,
      itemDescription, oldItem[0].itemRating, oldItem[0].itemImg, itemSize,
    oldItem[0].sellerId, oldItem[0].itemSellerInfo, oldItem[0].itemSellerRating, cost);

    await itemModel.updateMyAccesory(newItem);
    res.redirect('/catalog/item/'+itemCode);


  }catch(err){
    console.log(err);
    console.log("in update my accessory error!!");
  }
})
.get('/signIn',function(req,res){
  var username = "";
  if(req.session.theUser != undefined){
    username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
    res.redirect('/myItems')
  }
  res.render("login",{username:username,error:""});
})
.post('/login',urlencodedParser, async function(req, res){
  try{
    var error = "";
    var validationError = "";
    var username = "";
    var userId = req.body.userId;
    var password = req.body.password;

    req.check('userId')
    .notEmpty()
    .withMessage('The userID cannot be empty!!')
    .isLength({min:6,max:6})
    .withMessage('userId must be 6 chars long!!')
    .trim()
    .escape();
    req.check('password')
    .notEmpty()
    .withMessage('Password cannot be empty!!')
    .isLength({ min: 6})
    .withMessage('Password must be at least 6 chars long!!')
    .trim()
    .escape();

    validationError = req.validationErrors();
    if(validationError){
     res.render("login",{username:username,error:validationError[0].msg});
   }
   else{
     var user = await userDBModel.getUser(userId);
     if(req.session.theUser != undefined){
       username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
     }
     if(user.length == 0){
       error = "The UserId entered is wrong!!";
     }
     else if(user[0].userId != userId || user[0].password != password){
       error = "UserId/Password is wrong";
     }
     if(error.length != 0){
       res.render('login',{
         username:username,
         error:error
       });
     }
     else{
       req.session.theUser = user[0];
       req.session.currentUserProfile = await userDBModel.getUserProfile(user[0].userId);
       var currentUserProfile = req.session.currentUserProfile;
       if(req.session.currentUserProfile.length == 0){
         res.render('noData');
       }
       res.redirect("/myItems");
     }
   }

  }
  catch(err){
    console.log("login error: ");
    console.log(err);
  }
})
.get('/signOut', function(req, res){
  req.session.theUser = undefined;
  req.session.currentProfile = undefined;
  res.redirect("/");
})
.get('/catalog',async function(req,res){

  try{
    username="";
    if(req.session.theUser != undefined){
      username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
    }

    var listOfCategories = await itemModel.getCategories();
    var listOfItems = await itemModel.getItems();
    if(listOfCategories.length == 0 || listOfItems.length == 0){
      res.render('noData');
    }

    var data ={
      list:listOfCategories,
      items:listOfItems
    }
    res.render('catalog',{
      data:data,
      username:username
    });
  }
  catch(err){
    console.log("in catalog controller: ",err);
  }
})
.get('/about',function(req,res){
  var username = "";
  if(req.session.theUser != undefined){
    username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
  }
  res.render('about',{username:username});
})
.get('/contactUs',function(req,res){
  var username = "";
  if(req.session.theUser != undefined){
    username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
  }
  res.render('contact',{username:username});
})
.get('/catalog/item/:id',async function(req,res){
  try{
    var url = req.url;
    var id = req.params.id;

    req.check('id')
    .notEmpty()
    .withMessage('The itemCode cannot be empty!!!')
    .isLength({min:5,max:6})
    .withMessage('ItemId is of not proper length')
    .escape()
    .trim();

    var validationError = req.validationErrors();
    if(validationError){
      console.log("validation errors : ",validationError);
     res.redirect('/catalog');
   }else{
     var viewItem =await itemModel.getItem(id);
     console.log("/catalog/item/:id : ",viewItem);
     var username = "";
     var rating = "";
     rented = "";
     if(req.session.theUser != undefined && viewItem.length!=0){
       username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
       var userProfile = req.session.currentUserProfile;
       //returning the rating from the saved items
       userProfile.userItems.forEach(function(item){
         if(item.item.itemCode === viewItem[0].itemCode){
           rating = item.rating;
         }
       });
       //returning the rating from user rated items
       var ratedItems = await userDBModel.getUserRatedItems(req.session.theUser.userId);
       if(ratedItems != null){
         ratedItems.forEach(function(item){
           if(item.item.itemCode === viewItem[0].itemCode){
             rating = item.rating;
           }
         });
       }

     }
   //if itemcode is valid go in if orelse redirect ot 404 page
     if(viewItem.length!=0 && req.session.theUser!= undefined){
     console.log(url);
     res.render('item',{
       item:viewItem[0],
       url:url,
       username:username,
       userId:req.session.theUser.userId,
       rating:rating
     });
     }
     else if(viewItem.length!=0 && req.session.theUser == undefined){
      console.log(url);
      res.render('item',{
        item:viewItem[0],
        url:url,
        username:username,
        rating:rating
      });
     }
     else{
       res.render('404');
     }
   }

  }
  catch(err){
    console.log("in items error: ");
    console.log(err);
  }
})
//called when the user clicks on update button in myItems page
.get('/feedback',async function(req,res){

  try{

    var itemId = req.query.itemCode;
    var action = req.query.action;

    req.check('itemCode')
    .exists()
    .withMessage('itemcode missing in query params')
    .notEmpty()
    .withMessage('ItemId cannot be empty')
    .isLength({min:5,max:6})
    .withMessage('ItemId is of not proper length')
    .escape()
    .trim();

    req.check('action')
    .exists()
    .withMessage('action missing in query params')
    .notEmpty()
    .withMessage('Action cannot be empty')
    .isAlpha()
    .withMessage('action should be a string')
    .isIn(['update','rate'])
    .withMessage('Wrong action name')
    .escape()
    .trim();

    var validationError = req.validationErrors();
    if(validationError){
      console.log("validation errors : ",validationError);
     res.redirect('/myItems');
   }else{
     var viewItem =await itemModel.getItem(itemId);
     //If the itemCode is not valid
     if(viewItem.length==0){
       res.render('404');
     }else{
       var username = "";
       if(req.session.theUser != undefined){
         username = req.session.theUser.firstName + " " + req.session.theUser.lastName;
         var userProfile = req.session.currentUserProfile;
         var userItems = userProfile.userItems;
         counter=0;
         //checking if item exists in the userProfile
         userItems.forEach(function(item){
           if(item.item.itemCode === itemId){
             counter+=1;
           }
         });
         //checking if request came form myItems page and
         //if the item request to update is actually form the table inmyItems
         //If not redirecting to myItems page without any updation
         if(counter == 0 && action == "update"){
           res.redirect('/myItems');
         }
         var rented = "No";
         var rating = 0;
         //returning the rating and rented from the saved items
         userItems.forEach(function(item){
           if(item.item.itemCode === viewItem[0].itemCode){
             rented = item.rented;
             rating = item.rating;
           }
         });
         //returning the rating and rented from user rated items
         var ratedItems = await userDBModel.getUserRatedItems(req.session.theUser.userId);
         if(ratedItems != null){
           ratedItems.forEach(function(item){
             if(item.item.itemCode === viewItem[0].itemCode){
               rating = item.rating;
               rented = item.rented;
             }
           });
         }

       }

       res.render('feedback',{
         item:viewItem[0],
         username:username,
         rented:rented,
         rating:rating
       });
     }
   }
  }
  catch(err){
    console.log("in items error: ");
    console.log(err);
  }

})
//Called as a middleware function when confirm button clicked in the feedback form
.post('/update',urlencodedParser,async function(req,res){

  try{
    var rating = req.body.rating;
    var rented = req.body.rented;
    var itemCode = req.body.itemCode;

    req.check('rating')
    .notEmpty().withMessage("Rating cannot be empty!!")
    .isNumeric().isIn(['1','2','3','4','5']).withMessage("rating should be a numeric value between 0-5")
    .escape()
    .trim();

    req.check('rented')
    .notEmpty().withMessage("Rented cannot be empty!!")
    .isAlpha().isIn(['Yes','No']).withMessage("Rented should be Yes or No")
    .escape()
    .trim();

    var validationError = req.validationErrors();
    if(validationError){
      console.log("validation errors : ",validationError);
     res.redirect('/myItems');
   }
   else{
     var item =await itemModel.getItem(itemCode);
     item.itemRating = rating;

     req.session.currentUserProfile =await userDBModel.getUserProfile(req.session.theUser.userId);
     var userItem = await userItemModel.userItem(item,rating,rented);
     console.log("In update error check!!!!!",userItem);
     //req.session.currentUserProfile.updateItem(userItem);
     var itemPresent = false;
     //check if already present!!
     for(var i=0; i< req.session.currentUserProfile.userItems.length; i++){
       if(req.session.currentUserProfile.userItems[i].item.itemCode === itemCode){
         //alert that the item already present!!
         console.log("item already present!!");
         itemPresent= true;
       }
     }
     if(itemPresent){
       var updatedItem = await userDBModel.updateItem(req.session.theUser.userId, userItem);
       res.redirect('/myItems');
     }
     else{
       await userDBModel.addUserRatedItem(req.session.theUser.userId, userItem);
       res.redirect('/myRatedItems');
     }
   }

  }
  catch(err){
    console.log("in update errror!! : ",err);
  }

})
.get('*',function(req,res){
  res.render('404');
});

module.exports = router;
