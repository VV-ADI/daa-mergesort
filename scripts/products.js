/**
 * Product Class and Default Products
 */

class Product {
    constructor(id, name, price, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
    }

    // Convert to JSON for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            image: this.image
        };
    }

    // Create Product from JSON
    static fromJSON(data) {
        return new Product(data.id, data.name, data.price, data.image);
    }
}

// Default products
let defaultProducts = [
    new Product(1, "Kissan Fresh Tomato Ketchup", 215, "assets/1.jpg"),
    new Product(2, "Del Monte Tomato Ketchup", 75, "assets/2.jpg"),
    new Product(3, "Veeba Truly Tomato Ketchup", 140, "assets/3.jpg"),
    new Product(4, "Tata Salt", 25, "assets/4.jpg"),
    new Product(5, "Aashirvaad Iodized Salt", 30, "assets/5.jpg"),
    new Product(6, "Aashirvaad Himalayan Pink Salt", 106, "assets/6.jpg"),
    new Product(7, "Fortune oil ", 650, "assets/7.jpg"),
    new Product(8, "Amami oil", 208, "assets/8.jpg"),
    new Product(9, "Saffola oil", 1072, "assets/9.jpg"),
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Product, defaultProducts };
}
