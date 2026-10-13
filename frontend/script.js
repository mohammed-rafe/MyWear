
/* ============================================
   MYWEAR - FASHION E-COMMERCE FRONTEND
   Connected to Spring Boot Products API
   Demo only: checkout/payment is not real.
   ============================================ */

// ============================================
// 1. API CONFIGURATION & PRODUCT DATA
// ============================================

const API_URL = "http://localhost:8080/api/products";

let products = [];

const productOptions = {
    1: { sizes: ["S", "M", "L", "XL"], colors: ["White", "Black"] },
    2: { sizes: ["S", "M", "L"], colors: ["White", "Pink", "Black"] },
    3: { sizes: ["M", "L", "XL"], colors: ["Black", "Grey"] },
    4: { sizes: ["One Size"], colors: ["Natural", "Black"] }
};

// Temporary images until image URLs are stored in the database.
const fallbackImages = {
    1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    2: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80",
    3: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
    4: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
};

const fallbackBadges = {
    1: "BESTSELLER",
    2: "NEW",
    3: "POPULAR",
    4: "JUST IN"
};

// ============================================
// 2. APPLICATION STATE
// ============================================

let activeCategory = "All";
let searchQuery = "";
let cart = [];

// ============================================
// 3. HTML ELEMENTS
// ============================================

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const emptyMessage = document.getElementById("emptyMessage");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const productModal = document.getElementById("productModal");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");

// ============================================
// 4. PRICE FORMATTER
// ============================================

function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

// ============================================
// 5. LOAD PRODUCTS FROM BACKEND API
// ============================================

async function loadProducts() {
    if (productGrid) {
        productGrid.innerHTML = "<p>Loading products...</p>";
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Unexpected products API response");
        }

        products = data.map(product => ({
            ...product,
            id: Number(product.id),
            price: Number(product.price),
            image: fallbackImages[Number(product.id)] ||
                product.imageUrl ||
                "",
            badge: fallbackBadges[Number(product.id)] || "NEW"
        }));

        renderProducts();

        console.log("MyWear products loaded from API:", products);
    } catch (error) {
        console.error("Unable to load products:", error);

        if (productGrid) {
            productGrid.innerHTML = `
                <p class="api-error">
                    Unable to load products.
                    Please check that the backend is running.
                </p>
                <button type="button" id="retryProducts" class="btn btn-dark">
                    Try Again
                </button>
            `;

            document.getElementById("retryProducts")
                ?.addEventListener("click", loadProducts);
        }

        if (productCount) {
            productCount.textContent = "PRODUCTS UNAVAILABLE";
        }
    }
}

// ============================================
// 6. RENDER PRODUCTS
// ============================================

function renderProducts() {
    if (!productGrid) return;

    let filteredProducts = products.filter(product => {
        const matchesCategory =
            activeCategory === "All" ||
            product.category === activeCategory;

        const matchesSearch =
            `${product.name} ${product.category}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const sortSelect = document.getElementById("sortSelect");
    const sort = sortSelect ? sortSelect.value : "featured";

    if (sort === "low") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (productCount) {
        productCount.textContent =
            `${String(filteredProducts.length).padStart(2, "0")} PRODUCTS`;
    }

    if (emptyMessage) {
        emptyMessage.hidden = filteredProducts.length !== 0;
    }

    productGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="product-badge">${product.badge}</span>

                <button
                    class="add-btn"
                    data-add="${product.id}"
                    aria-label="Quick add ${product.name} to bag"
                    type="button"
                >+</button>
            </div>

            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <span class="product-price">${formatPrice(product.price)}</span>
            </div>
        </article>
    `).join("");
}

// ============================================
// 7. CATEGORY FILTERS
// ============================================

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        renderProducts();
    });
});

// ============================================
// 8. COLLECTION CATEGORY LINKS
// ============================================

document.querySelectorAll(".collection-card").forEach(card => {
    card.addEventListener("click", () => {
        activeCategory = card.dataset.category || "All";

        document.querySelectorAll(".filter-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === activeCategory
            );
        });

        renderProducts();
    });
});

// ============================================
// 9. PRODUCT SORTING
// ============================================

const sortSelect = document.getElementById("sortSelect");

if (sortSelect) {
    sortSelect.addEventListener("change", renderProducts);
}

// ============================================
// 10. SEARCH
// ============================================

const searchBtn = document.getElementById("searchBtn");
const closeSearch = document.getElementById("closeSearch");

if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        if (!searchPanel) return;

        searchPanel.classList.toggle("visible");

        if (searchPanel.classList.contains("visible")) {
            searchInput?.focus();
        }
    });
}

if (closeSearch) {
    closeSearch.addEventListener("click", () => {
        searchPanel?.classList.remove("visible");

        if (searchInput) {
            searchInput.value = "";
        }

        searchQuery = "";
        renderProducts();
    });
}



if (searchInput) {
    let hasScrolledToSearchResults = false;
    let searchScrollTimer;

    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim();

        // Keep the search field active while typing.
        renderProducts();

        // Scroll only after the user pauses typing.
        clearTimeout(searchScrollTimer);

        if (searchQuery && !hasScrolledToSearchResults) {
            searchScrollTimer = setTimeout(() => {
                const productsSection =
                    productGrid?.closest("section") || productGrid;

                if (productsSection) {
                    hasScrolledToSearchResults = true;

                    productsSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }, 800);
        }

        if (!searchQuery) {
            hasScrolledToSearchResults = false;
        }
    });

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            clearTimeout(searchScrollTimer);

            const productsSection =
                productGrid?.closest("section") || productGrid;

            if (productsSection) {
                hasScrolledToSearchResults = true;

                productsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    });

    closeSearch?.addEventListener("click", () => {
        clearTimeout(searchScrollTimer);
        hasScrolledToSearchResults = false;
    });
}



// ============================================
// 11. MOBILE NAVIGATION
// ============================================

const menuBtn = document.getElementById("menuBtn");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        const nav = document.getElementById("navLinks");
        const isOpen = nav?.classList.toggle("show") || false;

        menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("navLinks")?.classList.remove("show");
        menuBtn?.setAttribute("aria-expanded", "false");
    });
});

// ============================================
// 12. PRODUCT DETAILS MODAL
// ============================================

function showProductDetails(product) {
    if (!productModal) {
        console.error("Missing #productModal in index.html.");
        return;
    }

    const options = productOptions[product.id] || {
        sizes: ["One Size"],
        colors: ["Standard"]
    };

    productModal.innerHTML = `
        <div class="modal-backdrop" data-close-modal></div>

        <section
            class="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label="Product details"
        >
            <button
                class="modal-close"
                data-close-modal
                aria-label="Close product details"
                type="button"
            >✕</button>

            <img src="${product.image}" alt="${product.name}">

            <div class="modal-details">
                <span class="product-category">${product.category}</span>
                <h2>${product.name}</h2>
                <p class="modal-price">${formatPrice(product.price)}</p>

                <label for="productSize">Select size</label>
                <select id="productSize">
                    ${options.sizes.map(size => `
                        <option value="${size}">${size}</option>
                    `).join("")}
                </select>

                <label for="productColor">Select colour</label>
                <select id="productColor">
                    ${options.colors.map(color => `
                        <option value="${color}">${color}</option>
                    `).join("")}
                </select>

                <p class="stock-note">
                    Demo options only. Live stock is not connected.
                </p>

                <button
                    class="btn btn-dark modal-add"
                    id="modalAddToCart"
                    type="button"
                >
                    Add to bag — ${formatPrice(product.price)}
                </button>
            </div>
        </section>
    `;

    productModal.classList.add("visible");
    productModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    productModal.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", closeProductDetails);
    });

    const addButton = document.getElementById("modalAddToCart");

    if (addButton) {
        addButton.addEventListener("click", () => {
            const size = document.getElementById("productSize").value;
            const color = document.getElementById("productColor").value;

            addConfiguredProductToCart(product, size, color);

            closeProductDetails();
            openCart();
        });
    }

    productModal.querySelector(".modal-close")?.focus();
}

function closeProductDetails() {
    if (!productModal) return;

    productModal.classList.remove("visible");
    productModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// ============================================
// 13. PRODUCT CARD CLICK HANDLER
// ============================================

if (productGrid) {
    productGrid.addEventListener("click", event => {
        const addButton = event.target.closest("[data-add]");

        if (addButton) {
            addToCart(Number(addButton.dataset.add));
            return;
        }

        const card = event.target.closest(".product-card");
        if (!card) return;

        const productId = Number(card.dataset.productId);
        const product = products.find(item => item.id === productId);

        if (product) {
            showProductDetails(product);
        }
    });
}

// ============================================
// 14. ADD TO CART
// ============================================

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const options = productOptions[productId] || {
        sizes: ["One Size"],
        colors: ["Standard"]
    };

    addConfiguredProductToCart(
        product,
        options.sizes[0],
        options.colors[0]
    );

    openCart();
}

function addConfiguredProductToCart(product, size, color) {
    const existing = cart.find(item =>
        item.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            selectedSize: size,
            selectedColor: color,
            quantity: 1,
            cartKey: `${product.id}-${size}-${color}`
        });
    }

    renderCart();
}

// ============================================
// 15. CHANGE CART QUANTITY
// ============================================

function changeQuantity(cartKey, amount) {
    const item = cart.find(product => product.cartKey === cartKey);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.cartKey !== cartKey);
    }

    renderCart();
}

// ============================================
// 16. REMOVE CART ITEM
// ============================================

function removeFromCart(cartKey) {
    cart = cart.filter(product => product.cartKey !== cartKey);
    renderCart();
}

// ============================================
// 17. RENDER SHOPPING CART
// ============================================

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const cartCount = document.getElementById("cartCount");
    const drawerCount = document.getElementById("drawerCount");
    const cartTotal = document.getElementById("cartTotal");

    if (cartCount) cartCount.textContent = totalItems;
    if (drawerCount) drawerCount.textContent = `(${totalItems})`;
    if (cartTotal) cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length > 0) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">

                <div>
                    <h3>${item.name}</h3>
                    <p>${formatPrice(item.price)}</p>
                    <p>Size: ${item.selectedSize}</p>
                    <p>Colour: ${item.selectedColor}</p>

                    <div class="quantity-controls">
                        <button
                            data-minus="${item.cartKey}"
                            aria-label="Decrease quantity"
                            type="button"
                        >−</button>

                        <span>${item.quantity}</span>

                        <button
                            data-plus="${item.cartKey}"
                            aria-label="Increase quantity"
                            type="button"
                        >+</button>
                    </div>
                </div>

                <button
                    class="remove-btn"
                    data-remove="${item.cartKey}"
                    aria-label="Remove item"
                    type="button"
                >✕</button>
            </div>
        `).join("");
    } else {
        cartItems.innerHTML = `
            <p style="padding:30px 0;color:#777970;font-size:13px;">
                Your bag is empty. Find something you love!
            </p>
        `;
    }

    const checkoutMessage = document.getElementById("checkoutMessage");

    if (checkoutMessage) {
        checkoutMessage.textContent = "";
    }
}

// ============================================
// 18. OPEN AND CLOSE CART DRAWER
// ============================================

function openCart() {
    if (!cartDrawer || !cartBackdrop) return;

    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("visible");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");

    document.getElementById("closeCart")?.focus();
}

function closeCart() {
    cartDrawer?.classList.remove("open");
    cartBackdrop?.classList.remove("visible");
    cartDrawer?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}

document.getElementById("cartBtn")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
cartBackdrop?.addEventListener("click", closeCart);

// ============================================
// 19. CART BUTTON HANDLER
// ============================================

const cartItemsContainer = document.getElementById("cartItems");

if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.dataset.plus) {
            changeQuantity(button.dataset.plus, 1);
        } else if (button.dataset.minus) {
            changeQuantity(button.dataset.minus, -1);
        } else if (button.dataset.remove) {
            removeFromCart(button.dataset.remove);
        }
    });
}

// ============================================
// 20. DEMO CHECKOUT
// ============================================

document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    const message = document.getElementById("checkoutMessage");
    if (!message) return;

    message.textContent = cart.length
        ? "Demo only: checkout and payment will be added later."
        : "Your bag is empty. Add a product first.";
});

// ============================================
// 21. NEWSLETTER DEMO
// ============================================

document.getElementById("newsletterForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const message = document.getElementById("formMessage");

    if (message) {
        message.textContent =
            "Thanks for your interest! Newsletter signup is a demo for now.";
    }

    event.target.reset();
});

// ============================================
// 22. KEYBOARD ESCAPE HANDLER
// ============================================

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeProductDetails();
        closeCart();
        searchPanel?.classList.remove("visible");
    }
});

// ============================================
// 23. FOOTER YEAR
// ============================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// ============================================
// 24. INITIALIZE WEBSITE
// ============================================

renderCart();
loadProducts();
