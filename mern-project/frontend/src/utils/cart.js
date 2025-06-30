// Lấy giỏ hàng từ LocalStorage
export const getCart = () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  };
  
  // Lưu giỏ hàng vào LocalStorage
  export const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };
  
  // Thêm sản phẩm vào giỏ hàng
  export const addToCart = (product, quantity = 1) => {
    const cart = getCart();
    const index = cart.findIndex((item) => item.productId === product._id);
  
    if (index >= 0) {
      // Nếu đã có sản phẩm, tăng số lượng
      cart[index].quantity += quantity;
    } else {
      // Nếu chưa có, thêm sản phẩm mới
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images?.[0],
        quantity,
      });
    }
  
    saveCart(cart);
  };
  
  // Cập nhật số lượng sản phẩm
  export const updateQuantity = (productId, quantity) => {
    const cart = getCart();
    const index = cart.findIndex((item) => item.productId === productId);
  
    if (index >= 0) {
      cart[index].quantity = quantity;
      if (quantity <= 0) {
        cart.splice(index, 1); // Xóa nếu số lượng về 0
      }
      saveCart(cart);
    }
  };
  
  // Xóa sản phẩm khỏi giỏ hàng
  export const removeFromCart = (productId) => {
    const cart = getCart().filter((item) => item.productId !== productId);
    saveCart(cart);
  };
  // Xóa toàn bộ giỏ hàng
export const clearCart = () => {
    localStorage.removeItem('cart');
  };
  