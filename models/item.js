//Constructor
var item = function(itemCode, itemName, itemCategory,
  itemDescription, itemRating, itemImg, itemSize,
sellerId, itemSellerInfo, itemSellerRating, itemCost){

  itemModel ={

    itemCode:itemCode,
    itemName:itemName,
    itemCategory:itemCategory,
    itemDescription:itemDescription,
    itemRating:itemRating,
    itemImg:itemImg,
    itemSize:itemSize,
    sellerId:sellerId,
    itemSellerInfo:itemSellerInfo,
    itemSellerRating:itemSellerRating,
    itemCost:itemCost

  };
  return itemModel;
}

module.exports.item = item;
