
const products = [
    {
        id: 1,
        name: "Essential Cotton Tee",
        category: "Men",
        price: 699,
        badge: "BESTSELLER",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Everyday Oversized Tee",
        category: "Women",
        price: 899,
        badge: "NEW",
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Classic Street Hoodie",
        category: "Men",
        price: 1499,
        badge: "POPULAR",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Everyday Tote Bag",
        category: "Accessories",
        price: 499,
        badge: "JUST IN",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
    }
];

let activeCategory = "All";
let searchQuery = "";
let cart = [];

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const emptyMessage = document.getElementById("emptyMessage");

const formatPrice = amount =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

// Display products
function renderProducts() {
    let filtered = products.filter(product => {
        const matchesCategory =
            activeCategory === "All" ||
            product.category === activeCategory;

        const matchesSearch =
            `${product.name} ${product.category}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const sort = document.getElementById("sortSelect").value;

    if (sort === "low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    productCount.textContent =
        `${String(filtered.length).padStart(2, "0")} PRODUCTS`;

    emptyMessage.hidden = filtered.length !== 0;

    productGrid.innerHTML = filtered.map(product => `
        <article class="product-card">
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
                    aria-label="Add ${product.name} to bag"
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

// Category filters
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn =>
            btn.classList.toggle("active", btn === button)
        );

        renderProducts();
    });
});

// Collection cards also select their category
document.querySelectorAll(".collection-card").forEach(card => {
    card.addEventListener("click", () => {
        activeCategory = card.dataset.category;

        document.querySelectorAll(".filter-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === activeCategory
            );
        });

        renderProducts();
    });
});

// Sorting
document.getElementById("sortSelect")
    .addEventListener("change", renderProducts);

// Search panel
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");

document.getElementById("searchBtn").addEventListener("click", () => {
    searchPanel.classList.toggle("visible");

    if (searchPanel.classList.contains("visible")) {
        searchInput.focus();
    }
});

document.getElementById("closeSearch").addEventListener("click", () => {
    searchPanel.classList.remove("visible");
    searchInput.value = "";
    searchQuery = "";
    renderProducts();
});

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    renderProducts();

    document.getElementById("products").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Mobile navigation
document.getElementById("menuBtn").addEventListener("click", () => {
    const nav = document.getElementById("navLinks");
    const isOpen = nav.classList.toggle("show");

    document.getElementById("menuBtn")
        .setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("navLinks").classList.remove("show");
        document.getElementById("menuBtn")
            .setAttribute("aria-expanded", "false");
    });
});

// Shopping cart
function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();
    openCart();
}

function changeQuantity(productId, amount) {
    const item = cart.find(product => product.id === productId);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== productId);
    }

    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(product => product.id !== productId);
    renderCart();
}

function renderCart() {
    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    document.getElementById("cartCount").textContent = totalItems;
    document.getElementById("drawerCount").textContent = `(${totalItems})`;
    document.getElementById("cartTotal").textContent =
        formatPrice(totalPrice);

    document.getElementById("cartItems").innerHTML = cart.length
        ? cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>${formatPrice(item.price)}</p>
                    <div class="quantity-controls">
                        <button data-minus="${item.id}" aria-label="Decrease quantity">−</button>
                        <span>${item.quantity}</span>
                        <button data-plus="${item.id}" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-remove="${item.id}" aria-label="Remove item">✕</button>
            </div>
        `).join("")
        : '<p style="padding:30px 0;color:#777970;font-size:13px;">Your bag is empty. Find something you love!</p>';

    document.getElementById("checkoutMessage").textContent = "";
}

const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");

function openCart() {
    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("visible");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
    document.getElementById("closeCart").focus();
}

function closeCart() {
    cartDrawer.classList.remove("open");
    cartBackdrop.classList.remove("visible");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();
        searchPanel.classList.remove("visible");
    }
});

productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
});

document.getElementById("cartItems").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.plus) {
        changeQuantity(Number(button.dataset.plus), 1);
    } else if (button.dataset.minus) {
        changeQuantity(Number(button.dataset.minus), -1);
    } else if (button.dataset.remove) {
        removeFromCart(Number(button.dataset.remove));
    }
});

// Demo checkout only — no payment is processed
document.getElementById("checkoutBtn").addEventListener("click", () => {
    const message = document.getElementById("checkoutMessage");

    message.textContent = cart.length
        ? "Demo only: checkout and payment will be added later."
        : "Your bag is empty. Add a product first.";
});

// Newsletter demo
document.getElementById("newsletterForm").addEventListener("submit", event => {
    event.preventDefault();

    document.getElementById("formMessage").textContent =
        "Thanks for your interest! Newsletter signup is a demo for now.";

    event.target.reset();
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Initial render
renderProducts();
renderCart();
