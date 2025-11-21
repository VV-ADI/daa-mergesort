/**
 * UI Logic for Cart Page
 * Handles cart display and interactions
 */

/**
 * Display all cart items
 */
function displayCartItems() {
    const cartContent = document.getElementById('cartContent');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartContent || !cartSummary) {
        console.error('Cart elements not found');
        return;
    }

    // Get cart items
    const cartItems = getCartItems();

    // Clear existing content
    cartContent.innerHTML = '';

    // If cart is empty, show empty state
    if (!cartItems || cartItems.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-state">
                <p>Your cart is empty!</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        cartSummary.innerHTML = '';
        return;
    }

    // Create cart item cards
    cartItems.forEach(cartItem => {
        const cartItemCard = createCartItemCard(cartItem);
        cartContent.appendChild(cartItemCard);
    });

    // Update cart summary
    updateCartSummary();
}

/**
 * Create a cart item card element
 * @param {CartItem} cartItem - Cart item object
 * @returns {HTMLElement} Cart item card element
 */
function createCartItemCard(cartItem) {
    const card = document.createElement('div');
    card.className = 'cart-item-card';
    card.dataset.itemId = cartItem.id;

    card.innerHTML = `
        <div class="cart-item-image">
            <img src="${escapeHtml(cartItem.img)}" alt="${escapeHtml(cartItem.name)}"
                 onerror="this.src='https://via.placeholder.com/120x120?text=${encodeURIComponent(cartItem.name)}'">
        </div>
        <div class="cart-item-info">
            <h3 class="cart-item-name">${escapeHtml(cartItem.name)}</h3>
            <p class="cart-item-price">₹${parseFloat(cartItem.price).toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
            <button class="qty-btn qty-decrease" data-item-id="${cartItem.id}">-</button>
            <span class="qty-value" id="qty-${cartItem.id}">${cartItem.qty}</span>
            <button class="qty-btn qty-increase" data-item-id="${cartItem.id}">+</button>
        </div>
        <div class="cart-item-total">
            <p class="item-total-price">₹${cartItem.getTotal().toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
            <button class="btn-remove" data-item-id="${cartItem.id}" aria-label="Remove item">
                Remove
            </button>
        </div>
    `;

    // Add event listeners
    const decreaseBtn = card.querySelector('.qty-decrease');
    const increaseBtn = card.querySelector('.qty-increase');
    const removeBtn = card.querySelector('.btn-remove');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            const newQty = Math.max(1, cartItem.qty - 1);
            updateCartItemQuantity(cartItem.id, newQty);
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            updateCartItemQuantity(cartItem.id, cartItem.qty + 1);
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            handleRemoveItem(cartItem.id, cartItem.name);
        });
    }

    return card;
}

/**
 * Update cart item quantity
 * @param {number} id - Item ID
 * @param {number} qty - New quantity
 */
function updateCartItemQuantity(id, qty) {
    const updatedItem = updateCartQuantity(id, qty);
    
    if (updatedItem) {
        // Update quantity display
        const qtyElement = document.getElementById(`qty-${id}`);
        if (qtyElement) {
            qtyElement.textContent = updatedItem.qty;
        }

        // Update item total
        const itemCard = document.querySelector(`[data-item-id="${id}"]`);
        if (itemCard) {
            const totalPriceElement = itemCard.querySelector('.item-total-price');
            if (totalPriceElement) {
                totalPriceElement.textContent = `₹${updatedItem.getTotal().toFixed(2)}`;
            }
        }

        // Update cart summary
        updateCartSummary();
        showNotification('Quantity updated!', 'success');
    } else if (qty === 0) {
        // Item was removed
        displayCartItems();
    }
}

/**
 * Handle removing an item from cart
 * @param {number} id - Item ID
 * @param {string} name - Item name
 */
function handleRemoveItem(id, name) {
    if (confirm(`Are you sure you want to remove "${name}" from your cart?`)) {
        if (removeFromCart(id)) {
            showNotification(`${name} removed from cart!`, 'success');
            displayCartItems();
        } else {
            showNotification('Failed to remove item', 'error');
        }
    }
}

/**
 * Update cart summary (total amount)
 */
function updateCartSummary() {
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartSummary) {
        return;
    }

    const cartItems = getCartItems();
    const totalAmount = getCartTotal();

    cartSummary.innerHTML = `
        <div class="summary-card">
            <h2 class="summary-title">Order Summary</h2>
            <div class="summary-row">
                <span>Items (${cartItems.length})</span>
                <span>${cartItems.reduce((sum, item) => sum + item.qty, 0)}</span>
            </div>
            <div class="summary-row total-row">
                <span>Total Amount</span>
                <span class="total-amount">₹${totalAmount.toFixed(2)}</span>
            </div>
            <button id="checkoutBtn" class="btn btn-checkout">Checkout</button>
        </div>
    `;

    // Add checkout button event listener
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

/**
 * Handle checkout
 */
function handleCheckout() {
    const cartItems = getCartItems();
    
    if (!cartItems || cartItems.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // Clear cart
    if (checkout()) {
        // Show success alert
        alert('Successfully checked out!');
        
        // Redirect to index.html
        window.location.href = 'index.html';
    } else {
        showNotification('Checkout failed. Please try again.', 'error');
    }
}

/**
 * Initialize cart page
 */
function initializeCartPage() {
    // Display cart items
    displayCartItems();

    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', function(event) {
        if (event.key === 'grocno_cart') {
            displayCartItems();
        }
    });
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCartPage);

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        displayCartItems,
        createCartItemCard,
        updateCartItemQuantity,
        handleRemoveItem,
        updateCartSummary,
        handleCheckout,
        initializeCartPage
    };
}

