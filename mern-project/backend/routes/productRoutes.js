const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
    getProductsByStore,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct
  } = require('../controllers/productController');
  
  router.get('/my-products', verifyToken, getMyProducts);
  router.post('/create', verifyToken, createProduct);
  router.put('/:id', verifyToken, updateProduct);
  router.delete('/:id', verifyToken, deleteProduct);
  router.get('/by-store/:storeId', getProductsByStore); // ❌ dòng này có thể lỗi nếu getProductsByStore không phải là function
module.exports = router;
