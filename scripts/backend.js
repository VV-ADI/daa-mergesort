/**
 * Backend Logic & Storage
 * Simulates backend functionality using localStorage
 * Handles all CRUD operations for products
 */

const STORAGE_KEY = 'grocno_products';

/**
 * Get all products from storage
 * @returns {Array} Array of Product objects
 */
function getProducts() {
    try {
        const productsJson = localStorage.getItem(STORAGE_KEY);
        if (!productsJson) {
            // If no products exist, initialize with default products
            saveProducts(defaultProducts);
            return defaultProducts;
        }
        const productsData = JSON.parse(productsJson);
        return productsData.map(data => Product.fromJSON(data));
    } catch (error) {
        console.error('Error reading from storage:', error);
        // Return default products on error
        return defaultProducts;
    }
}

/**
 * Save all products to storage
 * @param {Array} products - Array of Product objects to save
 * @returns {boolean} True if saved successfully
 */
function saveProducts(products) {
    try {
        const productsJson = JSON.stringify(products.map(p => p.toJSON()));
        localStorage.setItem(STORAGE_KEY, productsJson);
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

/**
 * Add a new product
 * @param {string} name - Product name
 * @param {number} price - Product price
 * @param {string} image - Product image URL/path
 * @returns {Product|null} The added product or null if error
 */
function addProduct(name, price, image) {
    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.error('Invalid product name');
        return null;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
        console.error('Invalid price');
        return null;
    }

    if (!image || typeof image !== 'string' || image.trim().length === 0) {
        console.error('Invalid image URL');
        return null;
    }

    // Get existing products
    const products = getProducts();

    // Generate unique ID
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    const newId = maxId + 1;

    // Create new product
    const newProduct = new Product(newId, name.trim(), priceNum, image.trim());

    // Add to array
    products.push(newProduct);

    // Save to storage
    if (saveProducts(products)) {
        return newProduct;
    }

    return null;
}

/**
 * Delete a product by ID
 * @param {number} id - Product ID
 * @returns {boolean} True if product was deleted, false otherwise
 */
function deleteProduct(id) {
    if (!id || isNaN(id)) {
        return false;
    }

    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);

    if (filteredProducts.length === products.length) {
        // Product not found
        return false;
    }

    return saveProducts(filteredProducts);
}

/**
 * Update a product
 * @param {number} id - Product ID
 * @param {Object} updates - Object with name, price, and/or image to update
 * @returns {Product|null} Updated product or null if error
 */
function updateProduct(id, updates) {
    if (!id || isNaN(id)) {
        return null;
    }

    const products = getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return null;
    }

    // Update fields
    if (updates.name !== undefined) {
        const name = updates.name.trim();
        if (name.length === 0) {
            console.error('Product name cannot be empty');
            return null;
        }
        products[productIndex].name = name;
    }

    if (updates.price !== undefined) {
        const priceNum = parseFloat(updates.price);
        if (isNaN(priceNum) || priceNum < 0) {
            console.error('Invalid price');
            return null;
        }
        products[productIndex].price = priceNum;
    }

    if (updates.image !== undefined) {
        const image = updates.image.trim();
        if (image.length === 0) {
            console.error('Image URL cannot be empty');
            return null;
        }
        products[productIndex].image = image;
    }

    if (saveProducts(products)) {
        return products[productIndex];
    }

    return null;
}

/**
 * Get a product by ID
 * @param {number} id - Product ID
 * @returns {Product|null} The product or null if not found
 */
function getProductById(id) {
    if (!id || isNaN(id)) {
        return null;
    }

    const products = getProducts();
    return products.find(p => p.id === id) || null;
}

/**
 * Clear all products
 * @returns {boolean} True if cleared successfully
 */
function clearAllProducts() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        // Reset to default products
        saveProducts(defaultProducts);
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
}

/**
 * Get total count of products
 * @returns {number} Number of products
 */
function getProductCount() {
    return getProducts().length;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getProducts,
        saveProducts,
        addProduct,
        deleteProduct,
        updateProduct,
        getProductById,
        clearAllProducts,
        getProductCount
    };
}
