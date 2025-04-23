import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    book: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }],
    status: {
        type: String,
        enum: ['Order Placed', 'Out For Delivery', 'Delivered', 'Cancelled'],
        default: 'Order Placed'
    },

}, { timestamps: true });

export default mongoose.model('Order', orderSchema);