import mongoose from "mongoose";
//schema
const userSchema = new mongoose.Schema({
   username: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   address: {
      type: String,
      required: true,
   },
   avatar: { type: String, default:"https://i.pinimg.com/236x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg" },
   role:{
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    favourites:[{ 
      type : mongoose.Schema.Types.ObjectId,
      ref : "Book",
   },],
    cart:[{ 
      type : mongoose.Schema.Types.ObjectId,
      ref : "Book",
   },],
    orders:[{ 
      type : mongoose.Schema.Types.ObjectId,
      ref : "Order",
   },],
},
{timestamps:true})

export default mongoose.model("User", userSchema);