/**
 * UI Logic for Admin Page
 * Handles CRUD operations and form management
 */

/**
 * Display all products in inventory
 */
function displayInventory() {
    const inventoryList = document.getElementById('inventoryList');
    
    if (!inventoryList) {
        console.error('Inventory list element not found');
        return;
    }

    // Clear existing content
    inventoryList.innerHTML = '';

    // Get all products
    const products = getProducts();

    // If no products, show empty state
    if (!products || products.length === 0) {
        inventoryList.innerHTML = '<div class="empty-state">No products in inventory. Add some products to get started!</div>';
        return;
    }

    // Create inventory items
    products.forEach(product => {
        const inventoryItem = createInventoryItem(product);
        inventoryList.appendChild(inventoryItem);
    });
}

/**
 * Create an inventory item element
 * @param {Product} product - Product object
 * @returns {HTMLElement} Inventory item element
 */
function createInventoryItem(product) {
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.dataset.productId = product.id;

    item.innerHTML = `
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"
             onerror="this.src='https://via.placeholder.com/80x80?text=${encodeURIComponent(product.name)}'">
        <div class="inventory-item-info">
            <div class="inventory-item-name">${escapeHtml(product.name)}</div>
            <div class="inventory-item-price">${parseFloat(product.price).toFixed(2)}</div>
        </div>
        <div class="inventory-item-actions">
            <button class="btn-edit" data-product-id="${product.id}">Edit</button>
            <button class="btn-delete" data-product-id="${product.id}">Delete</button>
        </div>
    `;

    // Add event listeners
    const editBtn = item.querySelector('.btn-edit');
    const deleteBtn = item.querySelector('.btn-delete');

    if (editBtn) {
        editBtn.addEventListener('click', () => openEditModal(product));
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => handleDeleteProduct(product.id));
    }

    return item;
}

/**
 * Handle adding a new product
 */
function handleAddProduct(event) {
    event.preventDefault();

    const nameInput = document.getElementById('productName');
    const priceInput = document.getElementById('productPrice');
    const imageInput = document.getElementById('productImage');
    const addBtn = document.getElementById('addProductBtn');

    if (!nameInput || !priceInput || !imageInput) {
        showNotification('Form inputs not found', 'error');
        return;
    }

    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const image = imageInput.value.trim();

    // Validate inputs
    if (!name) {
        showNotification('Please enter a product name', 'error');
        nameInput.focus();
        return;
    }

    if (!price || parseFloat(price) < 0) {
        showNotification('Please enter a valid price', 'error');
        priceInput.focus();
        return;
    }

    if (!image) {
        showNotification('Please enter an image URL', 'error');
        imageInput.focus();
        return;
    }

    // Set loading state
    if (addBtn) {
        addBtn.disabled = true;
        addBtn.textContent = 'Adding...';
    }

    // Add product
    const newProduct = addProduct(name, price, image);

    if (newProduct) {
        showNotification(`${name} added successfully!`, 'success');
        // Clear form
        nameInput.value = '';
        priceInput.value = '';
        imageInput.value = '';
        // Refresh inventory
        displayInventory();
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
    } else {
        showNotification('Failed to add product. Please try again.', 'error');
    }

    // Remove loading state
    if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = 'Add Product';
    }
}

/**
 * Handle deleting a product
 * @param {number} id - Product ID
 */
function handleDeleteProduct(id) {
    const product = getProductById(id);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        if (deleteProduct(id)) {
            showNotification(`${product.name} deleted successfully!`, 'success');
            displayInventory();
            // Trigger storage event for other tabs
            window.dispatchEvent(new Event('storage'));
        } else {
            showNotification('Failed to delete product', 'error');
        }
    }
}

/**
 * Open edit modal with product data
 * @param {Product} product - Product to edit
 */
function openEditModal(product) {
    const modal = document.getElementById('editModal');
    const editId = document.getElementById('editProductId');
    const editName = document.getElementById('editProductName');
    const editPrice = document.getElementById('editProductPrice');
    const editImage = document.getElementById('editProductImage');

    if (!modal || !editId || !editName || !editPrice || !editImage) {
        showNotification('Edit modal elements not found', 'error');
        return;
    }

    // Populate form
    editId.value = product.id;
    editName.value = product.name;
    editPrice.value = product.price;
    editImage.value = product.image;

    // Show modal
    modal.classList.add('active');
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('active');
        // Reset form
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.reset();
        }
    }
}

/**
 * Handle updating a product
 */
function handleUpdateProduct(event) {
    event.preventDefault();

    const editId = document.getElementById('editProductId');
    const editName = document.getElementById('editProductName');
    const editPrice = document.getElementById('editProductPrice');
    const editImage = document.getElementById('editProductImage');
    const updateBtn = event.target.querySelector('button[type="submit"]');

    if (!editId || !editName || !editPrice || !editImage) {
        showNotification('Edit form inputs not found', 'error');
        return;
    }

    const id = parseInt(editId.value);
    const name = editName.value.trim();
    const price = editPrice.value.trim();
    const image = editImage.value.trim();

    // Validate inputs
    if (!name) {
        showNotification('Please enter a product name', 'error');
        editName.focus();
        return;
    }

    if (!price || parseFloat(price) < 0) {
        showNotification('Please enter a valid price', 'error');
        editPrice.focus();
        return;
    }

    if (!image) {
        showNotification('Please enter an image URL', 'error');
        editImage.focus();
        return;
    }

    // Set loading state
    if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
    }

    // Update product
    const updatedProduct = updateProduct(id, {
        name: name,
        price: price,
        image: image
    });

    if (updatedProduct) {
        showNotification(`${name} updated successfully!`, 'success');
        closeEditModal();
        displayInventory();
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
    } else {
        showNotification('Failed to update product. Please try again.', 'error');
    }

    // Remove loading state
    if (updateBtn) {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update Product';
    }
}

/**
 * Handle reset to default products
 */
function handleReset() {
    if (confirm('Are you sure you want to reset all products to defaults? This will remove all custom products!')) {
        if (clearAllProducts()) {
            showNotification('Products reset to defaults!', 'success');
            displayInventory();
            // Trigger storage event for other tabs
            window.dispatchEvent(new Event('storage'));
        } else {
            showNotification('Failed to reset products', 'error');
        }
    }
}

/**
 * Initialize admin page
 */
function initializeAdminPage() {
    // Display inventory
    displayInventory();

    // Add form event listener
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
    }

    // Add edit form event listener
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleUpdateProduct);
    }

    // Add modal close listeners
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }

    const modal = document.getElementById('editModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }

    // Add reset button listener
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }

    // Listen for storage changes
    window.addEventListener('storage', function(event) {
        if (event.key === 'grocno_products') {
            displayInventory();
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
document.addEventListener('DOMContentLoaded', initializeAdminPage);

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        displayInventory,
        createInventoryItem,
        handleAddProduct,
        handleDeleteProduct,
        openEditModal,
        closeEditModal,
        handleUpdateProduct,
        initializeAdminPage
    };
}

