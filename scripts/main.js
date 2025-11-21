/**
 * Main Script
 * Entry point for user page
 * Initializes the application when DOM is loaded
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the user page
    if (typeof initializeUserPage === 'function') {
        initializeUserPage();
    } else {
        console.error('initializeUserPage function not found');
    }
});
