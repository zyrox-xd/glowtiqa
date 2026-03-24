document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------- CONFIGURATION ---------------- //
    const RAZORPAY_KEY_ID = "rzp_live_Rgl2NCpQcyFajX"; 
    const BACKEND_URL = "https://glowtiqa-backend.onrender.com"; 

    // EmailJS Config
    const EMAILJS_SERVICE_ID = "service_jjk7wkz";
    const EMAILJS_TEMPLATE_ID = "template_jndkdwl";
    const EMAILJS_PUBLIC_KEY = "OlVciViSI0LWBnEA9";
    // ----------------------------------------------- //

    // --- UPDATED PRODUCT DATA ---
    const products = {
        cream: { id: 1, name: "Advance Whitening Cream", price: 2000, image: "gtiqa.jpg" },
        soap: { id: 2, name: "Skin Whitening Soap", price: 600, image: "soap.jpg" },
        combo: { id: 3, name: "The Signature Glow Duo", price: 2200, image: "combo1.jpg" },
        capsule: { id: 4, name: "Whitening Booster 1200MG", price: 3000, image: "capsule.jpg" },
        megaCombo: { id: 5, name: "The Prestige Radiance Collection", price: 5000, image: "mega-combo.png" } 
    };

    // Load Cart
    let cart = JSON.parse(localStorage.getItem('glowtiqaCart')) || [];
    
    // --- Elements ---
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountEl = document.querySelector('.cart-count');
    const navOverlay = document.getElementById('navOverlay');
    const successMessage = document.getElementById('successMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // --- Mobile Menu Elements ---
    const mobileMenuIcon = document.querySelector('.mobile-menu i');
    const mobileNav = document.getElementById('mobileNav');
    const closeMenuBtn = document.getElementById('closeMenu');

    // --- Mobile Menu Logic ---
    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', () => {
            mobileNav.classList.add('active');
            navOverlay.classList.add('active');
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    // --- Cart Sidebar Logic ---
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            navOverlay.classList.add('active');
            updateCartUI();
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    // --- Core Cart Functions ---
    function saveCart() {
        localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
        updateCartUI();
    }

    window.addToCart = function(product, quantity = 1) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        saveCart();
        showMessage("Added to Cart!", "success");
        cartSidebar.classList.add('active');
        navOverlay.classList.add('active');
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    };

    window.updateQuantity = function(id, delta) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) removeFromCart(id);
            else saveCart();
        }
    };

    function updateCartUI() {
        if (!cartItemsContainer || !cartTotalEl || !cartCountEl) return;
        
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                count += item.quantity;
                
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://placehold.co/100x100?text=Product'">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">₹${item.price}</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            <button class="remove-item trash-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalEl.textContent = `₹${total}`;
        cartCountEl.textContent = count;
        
        if (count > 0) {
            cartCountEl.style.display = 'flex';
            cartCountEl.classList.add('pop');
            setTimeout(() => cartCountEl.classList.remove('pop'), 300);
        } else {
            cartCountEl.style.display = 'none';
        }
    }

    function showMessage(msg, type = 'success') {
        if (!successMessage) return;
        successMessage.querySelector('span').textContent = msg;
        successMessage.classList.remove('error');
        if (type === 'error') {
            successMessage.classList.add('error');
        }
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 3000);
    }

    // --- Add to Cart Event Listeners ---
    // Cream
    if (document.getElementById('addCreamToCart')) {
        document.getElementById('addCreamToCart').addEventListener('click', () => addToCart(products.cream));
    }
    // Soap
    if (document.getElementById('addSoapToCart')) {
        document.getElementById('addSoapToCart').addEventListener('click', () => addToCart(products.soap));
    }
    // Capsule
    if (document.getElementById('addCapsuleToCart')) {
        document.getElementById('addCapsuleToCart').addEventListener('click', () => addToCart(products.capsule));
    }

    // Combo / Duo
    window.addComboToCart = function() {
        const qtyInput = document.getElementById('comboQuantity');
        const qty = qtyInput ? parseInt(qtyInput.value) : 1;
        addToCart(products.combo, qty);
    };

    // Mega Combo / Prestige
    if (document.getElementById('addMegaComboToCart')) {
        document.getElementById('addMegaComboToCart').addEventListener('click', () => {
            const qtyInput = document.getElementById('megaComboQuantity');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            addToCart(products.megaCombo, qty);
        });
    }

    // --- Direct Buy Now Function ---
    window.buyNow = function(productKey) {
        cart = []; // Clear cart
        let qty = 1;
        
        // Check if there's a quantity input for this specific product
        if (productKey === 'combo') {
            const qtyInput = document.getElementById('comboQuantity');
            if (qtyInput) qty = parseInt(qtyInput.value);
        } else if (productKey === 'megaCombo') {
            const qtyInput = document.getElementById('megaComboQuantity');
            if (qtyInput) qty = parseInt(qtyInput.value);
        } else if (productKey === 'capsule') {
            const qtyInput = document.getElementById('capsuleQuantity');
            if (qtyInput) qty = parseInt(qtyInput.value);
        }

        addToCart(products[productKey], qty);
        
        // Auto open cart
        if(cartSidebar) cartSidebar.classList.add('active');
        if(navOverlay) navOverlay.classList.add('active');
    };

    // --- Razorpay & EmailJS Checkout Logic ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) return showMessage('Your cart is empty', 'error');

            const custName = document.getElementById('custName').value.trim();
            const custPhone = document.getElementById('custPhone').value.trim();
            const custAddress = document.getElementById('custAddress').value.trim();

            if (!custName || !custPhone || !custAddress) {
                return showMessage('Please fill all shipping details', 'error');
            }

            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            checkoutBtn.disabled = true;

            try {
                // 1. Create order on backend
                const response = await fetch(`${BACKEND_URL}/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart })
                });

                if (!response.ok) throw new Error('Failed to create order on server');
                const orderData = await response.json();

                // 2. Format order details for Email
                let orderDetailsHTML = cart.map(item => `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('<br>');
                let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                // 3. Open Razorpay
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: "INR",
                    name: "Glowtiqa Paris",
                    description: "Premium Skincare Purchase",
                    image: "logo_v2.png", 
                    order_id: orderData.id,
                    handler: function (response) {
                        
                        // Payment Success - Send Emails
                        const templateParams = {
                            to_name: "Glowtiqa Admin",
                            customer_name: custName,
                            customer_phone: custPhone,
                            customer_address: custAddress,
                            order_details: orderDetailsHTML,
                            total_amount: `₹${totalAmount}`,
                            payment_id: response.razorpay_payment_id
                        };

                        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                            .then(() => {
                                cart = [];
                                saveCart();
                                cartSidebar.classList.remove('active');
                                navOverlay.classList.remove('active');
                                alert("Payment Successful! Your order has been placed. We will contact you shortly.");
                            }, (error) => {
                                console.error("EmailJS Error:", error);
                                alert("Payment successful, but there was an issue notifying the store. Please contact support on WhatsApp.");
                            });
                    },
                    prefill: {
                        name: custName,
                        contact: custPhone
                    },
                    theme: { color: "#b68d40" },
                    modal: {
                        ondismiss: function() {
                            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Checkout';
                            checkoutBtn.disabled = false;
                            showMessage("Payment cancelled", "error");
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();

            } catch (error) {
                console.error(error);
                showMessage("Checkout failed. Try again.", "error");
                checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Checkout';
                checkoutBtn.disabled = false;
            }
        });
    }

    // Initialize UI on load
    updateCartUI();
});