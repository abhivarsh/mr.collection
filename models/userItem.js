var userItem = function(item,rating,rented){

  userItemModel = {
    item : item,
    rating : rating,
    rented : rented
  }
  return userItemModel;
}

//Getters
userItem.prototype.getItem = function(){
  return this.item;
}
userItem.prototype.getRating = function(){
  return this.rating;
}
userItem.prototype.getRented = function(){
  return this.rented;
}


//setters
userItem.prototype.setItem = function(item){
  this.item = item;
}
userItem.prototype.setRating = function(rating){
  this.rating = rating;
}
userItem.prototype.setRented = function(rented){
  this.rented = rented;
}

module.exports.userItem = userItem;
