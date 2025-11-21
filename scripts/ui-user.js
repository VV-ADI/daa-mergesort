/**
 * UI Logic for User Page
 * Handles product display and sorting
 */

// Store current products state
let currentProducts = [];

/**
 * Display products in the grid
 * @param {Array} products - Array of Product objects
 */
function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    
    if (!productGrid) {
        console.error('Product grid element not found');
        return;
    }

    // Clear existing content
    productGrid.innerHTML = '';

    // If no products, show empty state
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<div class="empty-state">No products available. Check back later!</div>';
        return;
    }

    // Create product cards
    products.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });

    // Update current products
    currentProducts = products;
}

/**
 * Create a product card element
 * @param {Product} product - Product object
 * @returns {HTMLElement} Product card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" 
             onerror="this.src='https://via.placeholder.com/250x200?text=${encodeURIComponent(product.name)}'">
        <div class="product-info">
            <h3>${escapeHtml(product.name)}</h3>
            <p class="price">${parseFloat(product.price).toFixed(2)}</p>
            <button class="btn btn-add-to-cart" data-product-id="${product.id}" 
                    data-product-name="${escapeHtml(product.name)}"
                    data-product-price="${product.price}"
                    data-product-image="${escapeHtml(product.image)}">
                Add to Cart
            </button>
        </div>
    `;

    // Add event listener for Add to Cart button
    const addToCartBtn = card.querySelector('.btn-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            handleAddToCart(product);
        });
    }

    return card;
}

/**
 * Handle adding product to cart
 * @param {Product} product - Product object
 */
function handleAddToCart(product) {
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    const cartItem = addToCart(product.id, product.name, product.price, product.image);
    
    if (cartItem) {
        const message = cartItem.qty > 1 
            ? `${product.name} added to cart! (${cartItem.qty} items)`
            : `${product.name} added to cart!`;
        showNotification(message, 'success');
    } else {
        showNotification('Failed to add item to cart', 'error');
    }
}

/**
 * Sort products by price using merge sort
 */
function sortByPrice() {
    const products = getProducts();
    const sortedProducts = MergeSort.sortByPrice(products);
    displayProducts(sortedProducts);
    showNotification('Products sorted by price!', 'success');
}

/**
 * Sort products alphabetically by name
 */
function sortByName() {
    const products = getProducts();
    const sortedProducts = MergeSort.sortByName(products);
    displayProducts(sortedProducts);
    showNotification('Products sorted alphabetically!', 'success');
}

/**
 * Initialize user page
 */
function initializeUserPage() {
    // Load and display products
    const products = getProducts();
    displayProducts(products);

    // Add event listeners
    const sortPriceBtn = document.getElementById('sortPriceBtn');
    const sortNameBtn = document.getElementById('sortNameBtn');

    if (sortPriceBtn) {
        sortPriceBtn.addEventListener('click', sortByPrice);
    }

    if (sortNameBtn) {
        sortNameBtn.addEventListener('click', sortByName);
    }
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        max-width: 300px;
    `;

    // Add animation if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Listen for storage changes (multi-tab support)
window.addEventListener('storage', function(event) {
    if (event.key === 'grocno_products') {
        const products = getProducts();
        displayProducts(products);
    }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        displayProducts,
        createProductCard,
        sortByPrice,
        sortByName,
        initializeUserPage
    };
}
