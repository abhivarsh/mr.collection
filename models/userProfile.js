var userProfile = function(userId, userItems){

  this.userId = userId;
  this.userItems = userItems;

//Add a new item to the userItems list
  this.addItem = function(userItem){
    console.log("Add userItem");
    this.userItems.push(userItem);
  };

//Remove an item from the userItems list
  this.removeItem = function(itemCode){
    console.log("Remove userItem");
    for(var i=0;i<this.userItems.length;i++){
      if(itemCode == this.userItems[i].item.itemCode){
        this.userItems.splice(i,1);
        break;
      }
    }
  };

//Update a userItem in the userItems list
  this.updateItem = function(userItem){
    console.log("Update userItem",userItem.item.itemCode);
    for(var i = 0; i < this.userItems.length; i++ ){
      console.log("in updateItem forloop: ",this.userItems[i].item.itemCode);
      if(userItem.item.itemCode == this.userItems[i].item.itemCode){
        this.userItems[i].item = userItem.item;
        this.userItems[i].rating = userItem.rating;
        this.userItems[i].rented = userItem.rented;
      }
    }
  };

//Get all the userItems
  this.getItems = function(){
    return this.userItems;
  };

//empty the profile
  this.emptyProfile = function(){
    console.log("Empty the profile");
    this.user = null;
    this.userItems = null;
  };
}

module.exports = userProfile;
