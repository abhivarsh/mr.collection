var express = require('express');
var app = express();
var itemModel = require('./item');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mrCollection',{ useNewUrlParser: true },function(err){
  if(err) throw err;
  console.log("Successfully connected!!");
});

//databse for items in the application
var itemsSchema = mongoose.Schema({
  itemCode:{type:String, required:true, unique: true},
  itemName:String,
  itemCategory:String,
  itemDescription:String,
  itemRating:Number,
  itemImg:String,
  itemSize:String,
  sellerId: String,
  itemSellerInfo:String,
  itemSellerRating:Number,
  itemCost:String
},{collection:'itemsData'});

var items = mongoose.model('itemsData', itemsSchema);

//Add a new Item to the database
exports.addNewItem = async function(newItem){
  console.log("in addItem new: ",newItem.sellerId);
  if(items){
    var nItem = new items({
        'itemCode':newItem.itemCode,
        'itemName':newItem.itemName,
        'itemCategory':newItem.itemCategory,
        'itemDescription':newItem.itemDescription,
        'itemRating':newItem.itemRating,
        'itemImg':newItem.itemImg,
        'itemSize':newItem.itemSize,
        'sellerId':newItem.sellerId,
        'itemSellerInfo':newItem.itemSellerInfo,
        'itemSellerRating':newItem.itemSellerRating,
        'itemCost':newItem.itemCost
      });
    await nItem.save(function(err, data){
      if(err) console.log(err);
      if(data.nModified) console.log("new item has been saved successfully!!");
    });
  }
}


//Update the users Accesory to the database
exports.updateMyAccesory = async function(userItem){
  console.log("in updateMyAccesory itemDB");
  if(items){
    await items.findOneAndUpdate({'sellerId':userItem.sellerId, 'itemCode':userItem.itemCode},userItem,function(err,data){
      if(err) console.log(err);
    });
  }
}
//Hard coded data
// var item1 = itemModel.item('SNE001','Sneakers','Shoes','soft and flexible very well equiped for running and training',
// 0 , '/images/category/shoes/sne001.jpeg','Large','',125,'$3 per day');
// var item2 = itemModel.item('BTS001','Boots','Shoes','Made with genuine leather, brown coloured and very comfortable to wear. Suits on any kind of trousers',
// 0 , '/images/category/shoes/bts001.jpg','Large','',15,'$2 per day');
// var item3 = itemModel.item('SS001','Slip-on Shoes','Shoes','Casual wear shoes. Cloth material. It works on shorts and on casual jeans.',
// 0 , '/images/category/shoes/ss001.jpg','Medium','',12,'$7 per day');
// var item4 = itemModel.item('BS001','Boat Shoes','Shoes','These shoes can be worn casually or even formal. Very flexible and made with genuine leather.',
// 0 , '/images/category/shoes/bs001.jpg','Large','',1254,'$10 per day');
// var item5 = itemModel.item('MC001','Moccasin','Shoes','Made with genuine leather. Suits on both formal and casual clothings.',
// 0 , '/images/category/shoes/mc001.jpg','Medium','',1,'$16 per day');
// var item6 = itemModel.item('OS001','Oxford Shoes','Shoes','Black formal shoes made with genuine leather, suits on suits and formal wearing.',
// 0 , '/images/category/shoes/os001.jpeg','Small','',25,'$15 per day');
// var item7 = itemModel.item('CW001','Chronograph Watches','Watches','silver metal chain strap having a big face to the watch. Has chronographs.',
// 0 , '/images/category/watches/CW001.jpg','Large','',15,'$5 per day');
// var item8 = itemModel.item('AW001','Automatic Watches','Watches','Can be used on formal wear and works without any batteries.',
// 0 , '/images/category/watches/AW001.jpg','Large','',5,'$20 per day');
// var item9 = itemModel.item('MW001','Mechanical Watches','Watches','leather strap with a big watch face',
// 0 , '/images/category/watches/MW001.jpg','Medium','',8,'$10 per day');
// var item10 = itemModel.item('SW001','Sports Watches','Watches','water proof, plast strap looks cool on both formal and semi formal clothings. Orange strap.',
// 0 , '/images/category/watches/SW001.jpg','Large','',3,'$5 per day');

//Get all the items
exports.getItems = async function(){
  console.log("In getItems");
  return await items.find();
};


//Get a single selected item
exports.getItem = async function(itemCode){
  console.log("In getItems DB: ",itemCode);
  return await items.find({'itemCode':itemCode});
}

//Get all the categories of catalog
exports.getCategories = async function(){
  console.log("in get categories");
  var listOfCategories = [];
  await items.find(function(err,data){
    if(err){
      throw err;
    }else{
      data.forEach(function(item){
        if(!listOfCategories.includes(item.itemCategory)){
          listOfCategories.push(item.itemCategory);
        }
      });
    }
  });
  console.log(listOfCategories);
  return listOfCategories;
}
