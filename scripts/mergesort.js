/**
 * Merge Sort Algorithm Implementation
 * Sorts products by price in ascending order
 */

/**
 * Merge two sorted arrays into one sorted array
 * @param {Array} left - Left sorted array
 * @param {Array} right - Right sorted array
 * @param {string} sortBy - Property to sort by ('price' or 'name')
 * @returns {Array} Merged sorted array
 */
function merge(left, right, sortBy = 'price') {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    // Compare elements from both arrays and add the smaller one to result
    while (leftIndex < left.length && rightIndex < right.length) {
        let leftValue = sortBy === 'price' ? parseFloat(left[leftIndex][sortBy]) : left[leftIndex][sortBy];
        let rightValue = sortBy === 'price' ? parseFloat(right[rightIndex][sortBy]) : right[rightIndex][sortBy];
        
        let comparison = 0;
        if (sortBy === 'price') {
            comparison = leftValue <= rightValue ? -1 : 1;
        } else {
            comparison = leftValue.localeCompare(rightValue);
        }

        if (comparison <= 0) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    // Add remaining elements from left array
    while (leftIndex < left.length) {
        result.push(left[leftIndex]);
        leftIndex++;
    }

    // Add remaining elements from right array
    while (rightIndex < right.length) {
        result.push(right[rightIndex]);
        rightIndex++;
    }

    return result;
}

/**
 * Merge Sort Algorithm - Recursive implementation
 * @param {Array} items - Array of products to sort
 * @param {string} sortBy - Property to sort by ('price' or 'name')
 * @returns {Array} Sorted array of products
 */
function mergeSort(items, sortBy = 'price') {
    // Base case: if array has 0 or 1 element, it's already sorted
    if (items.length <= 1) {
        return items;
    }

    // Find the middle point to divide the array into two halves
    const middle = Math.floor(items.length / 2);

    // Divide the array into two halves
    const left = items.slice(0, middle);
    const right = items.slice(middle);

    // Recursively sort both halves
    const sortedLeft = mergeSort(left, sortBy);
    const sortedRight = mergeSort(right, sortBy);

    // Merge the sorted halves
    return merge(sortedLeft, sortedRight, sortBy);
}

/**
 * Sort products by price using merge sort
 * @param {Array} products - Array of Product objects
 * @returns {Array} Sorted array of products
 */
function sortByPrice(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    // Create a copy to avoid mutating the original array
    const productsCopy = products.map(p => new Product(p.id, p.name, p.price, p.image));
    
    // Apply merge sort by price
    return mergeSort(productsCopy, 'price');
}

/**
 * Sort products alphabetically by name
 * @param {Array} products - Array of Product objects
 * @returns {Array} Sorted array of products
 */
function sortByName(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    // Create a copy to avoid mutating the original array
    const productsCopy = products.map(p => new Product(p.id, p.name, p.price, p.image));
    
    // Apply merge sort by name
    return mergeSort(productsCopy, 'name');
}

// MergeSort namespace for easy access
const MergeSort = {
    sort: sortByPrice,
    sortByPrice: sortByPrice,
    sortByName: sortByName
};

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mergeSort, sortByPrice, sortByName, MergeSort };
}
