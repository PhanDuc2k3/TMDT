const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    minlength: 3, 
    maxlength: 200 
  },

  description: { 
    type: String, 
    maxlength: 3000 
  },

  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },

  salePrice: { 
    type: Number, 
    min: 0 
  },

  images: [{ 
    type: String 
  }],

  brand: { 
    type: String 
  },

  subCategory: { 
    type: String 
  }, // Phân loại nhỏ, từng shop tự đặt

  quantity: { 
    type: Number, 
    required: true, 
    min: 0 
  },

  soldCount: { 
    type: Number, 
    default: 0 
  },

  variations: [{ 
    color: String, 
    size: String 
  }],

  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },

  isActive: { 
    type: Boolean, 
    default: true 
  },

  store: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Store', 
    required: true 
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
