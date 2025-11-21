/**
 * Cart Logic & Storage
 * Handles shopping cart functionality using localStorage
 */

const CART_STORAGE_KEY = 'grocno_cart';

/**
 * Cart Item Class
 */
class CartItem {
    constructor(id, name, price, img, qty = 1) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img = img;
        this.qty = qty;
    }

    // Calculate total for this item
    getTotal() {
        return parseFloat(this.price) * parseInt(this.qty);
    }

    // Convert to JSON for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            img: this.img,
            qty: this.qty
        };
    }

    // Create CartItem from JSON
    static fromJSON(data) {
        return new CartItem(data.id, data.name, data.price, data.img, data.qty || 1);
    }
}

/**
 * Get all cart items from storage
 * @returns {Array} Array of CartItem objects
 */
function getCartItems() {
    try {
        const cartJson = localStorage.getItem(CART_STORAGE_KEY);
        if (!cartJson) {
            return [];
        }
        const cartData = JSON.parse(cartJson);
        return cartData.map(item => CartItem.fromJSON(item));
    } catch (error) {
        console.error('Error reading cart from storage:', error);
        return [];
    }
}

/**
 * Save cart items to storage
 * @param {Array} cartItems - Array of CartItem objects
 * @returns {boolean} True if saved successfully
 */
function saveCartItems(cartItems) {
    try {
        const cartJson = JSON.stringify(cartItems.map(item => item.toJSON()));
        localStorage.setItem(CART_STORAGE_KEY, cartJson);
        return true;
    } catch (error) {
        console.error('Error saving cart to storage:', error);
        return false;
    }
}

/**
 * Add item to cart or increase quantity if exists
 * @param {number} id - Product ID
 * @param {string} name - Product name
 * @param {number} price - Product price
 * @param {string} img - Product image URL
 * @returns {CartItem|null} The added/updated cart item or null if error
 */
function addToCart(id, name, price, img) {
    // Validate inputs
    if (!id || isNaN(id)) {
        console.error('Invalid product ID');
        return null;
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.error('Invalid product name');
        return null;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
        console.error('Invalid price');
        return null;
    }

    if (!img || typeof img !== 'string' || img.trim().length === 0) {
        console.error('Invalid image URL');
        return null;
    }

    // Get existing cart items
    const cartItems = getCartItems();

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === id);

    if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        cartItems[existingItemIndex].qty += 1;
    } else {
        // Item doesn't exist, add new item
        const newCartItem = new CartItem(id, name.trim(), priceNum, img.trim(), 1);
        cartItems.push(newCartItem);
    }

    // Save to storage
    if (saveCartItems(cartItems)) {
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
        return existingItemIndex !== -1 ? cartItems[existingItemIndex] : cartItems[cartItems.length - 1];
    }

    return null;
}

/**
 * Remove item from cart
 * @param {number} id - Product ID
 * @returns {boolean} True if item was removed, false otherwise
 */
function removeFromCart(id) {
    if (!id || isNaN(id)) {
        return false;
    }

    const cartItems = getCartItems();
    const filteredItems = cartItems.filter(item => item.id !== id);

    if (filteredItems.length === cartItems.length) {
        // Item not found
        return false;
    }

    if (saveCartItems(filteredItems)) {
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
        return true;
    }

    return false;
}

/**
 * Update item quantity in cart
 * @param {number} id - Product ID
 * @param {number} qty - New quantity
 * @returns {CartItem|null} Updated cart item or null if error
 */
function updateCartQuantity(id, qty) {
    if (!id || isNaN(id)) {
        return null;
    }

    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity < 1) {
        // If quantity is 0 or less, remove item
        if (quantity <= 0) {
            removeFromCart(id);
            return null;
        }
        return null;
    }

    const cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === id);

    if (itemIndex === -1) {
        return null;
    }

    cartItems[itemIndex].qty = quantity;

    if (saveCartItems(cartItems)) {
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
        return cartItems[itemIndex];
    }

    return null;
}

/**
 * Clear all items from cart
 * @returns {boolean} True if cleared successfully
 */
function clearCart() {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
}

/**
 * Get total number of items in cart
 * @returns {number} Total quantity of items
 */
function getCartItemCount() {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + item.qty, 0);
}

/**
 * Calculate total amount of cart
 * @returns {number} Total price of all items
 */
function getCartTotal() {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + item.getTotal(), 0);
}

/**
 * Checkout - clear cart and return success
 * @returns {boolean} True if checkout successful
 */
function checkout() {
    if (clearCart()) {
        return true;
    }
    return false;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CartItem,
        getCartItems,
        saveCartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartItemCount,
        getCartTotal,
        checkout
    };
}

