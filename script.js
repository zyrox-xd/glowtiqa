document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------- CONFIGURATION ---------------- //
    const RAZORPAY_KEY_ID = "rzp_live_Rgl2NCpQcyFajX"; 
    const BACKEND_URL = "https://glowtiqa-backend.onrender.com"; 

    const EMAILJS_SERVICE_ID = "service_jjk7wkz";
    const EMAILJS_TEMPLATE_ID = "template_jndkdwl";
    const EMAILJS_PUBLIC_KEY = "OlVciViSI0LWBnEA9";
    // ----------------------------------------------- //

    // --- PRODUCT DATA WITH COD ADVANCES ---
    const products = {
        cream: { id: 1, name: "Advance Whitening Cream", price: 2000, advance: 400, image: "gtiqa.jpg" },
        soap: { id: 2, name: "Skin Whitening Soap", price: 600, advance: 200, image: "soap.jpg" },
        combo: { id: 3, name: "The Signature Glow Duo", price: 2200, advance: 600, image: "combo1.jpg" },
        capsule: { id: 4, name: "Whitening Booster 1200MG", price: 3000, advance: 800, image: "capsule.jpg" },
        megaCombo: { id: 5, name: "The Prestige Radiance Collection", price: 5000, advance: 1400, image: "mega-combo.jpg" } 
    };

    let cart = JSON.parse(localStorage.getItem('glowtiqaCart')) || [];
    
    // --- Elements ---
    const cartIcon = document.getElementById('cartIcon');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountEl = document.querySelector('.cart-count');
    const navOverlay = document.getElementById('navOverlay');
    const successMessage = document.getElementById('successMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Mobile Menu
    const mobileMenuIcon = document.querySelector('.mobile-menu i');
    const mobileNav = document.getElementById('mobileNav');
    const closeMenuBtn = document.getElementById('closeMenu');

    // Radio Buttons for Payment Method (On cart.html)
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', updateCartUI);
    });

    // --- UI Listeners ---
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

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            if(mobileNav) mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    // NEW: Cart Icon Redirects to cart.html
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    // --- Cart Functions ---
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
        // Update bubble counter globally
        let count = 0;
        cart.forEach(item => count += item.quantity);
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }

        // If we are NOT on the cart page, stop here.
        if (!cartItemsContainer) return; 
        
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let advanceTotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart" style="text-align:center; padding:40px 20px;">
                    <i class="fas fa-shopping-cart" style="font-size:3rem; color:#ddd; margin-bottom:15px;"></i>
                    <p style="color:#777; font-size:1.2rem; margin-bottom: 20px;">Your cart is empty</p>
                    <a href="products.html" class="cta-btn" style="padding: 10px 20px; font-size: 1rem;">Continue Shopping</a>
                </div>`;
            if (cartTotalEl) cartTotalEl.textContent = `₹0.00`;
            if (checkoutBtn) checkoutBtn.style.display = 'none'; // Hide checkout if empty
            return;
        } 
        
        if (checkoutBtn) checkoutBtn.style.display = 'block';

        cart.forEach(item => {
            total += item.price * item.quantity;
            advanceTotal += (item.advance || 0) * item.quantity;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://placehold.co/100x100?text=Product'">
                <div class="cart-item-details">
                    <h4 class="cart-item-name" style="margin-bottom: 5px;">${item.name}</h4>
                    <div class="cart-item-price" style="color: var(--primary); font-weight: 600; margin-bottom: 15px;">₹${item.price}</div>
                    <div class="cart-item-actions" style="display:flex; align-items:center; gap:10px;">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span style="font-weight: 600; min-width: 25px; text-align: center;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <i class="fas fa-trash" style="color: #e74c3c; cursor: pointer; margin-left: auto; font-size: 1.2rem;" onclick="removeFromCart(${item.id})"></i>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        if (cartTotalEl) cartTotalEl.textContent = `₹${total}`;

        // COD Advance Logic
        const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'full';
        const advanceRow = document.getElementById('cartAdvanceRow');
        const advanceAmountEl = document.getElementById('cartAdvance');

        if (paymentMethod === 'cod' && cart.length > 0) {
            if(advanceRow) advanceRow.style.display = 'flex';
            if(advanceAmountEl) advanceAmountEl.textContent = `₹${advanceTotal}`;
            if(checkoutBtn) checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Pay ₹${advanceTotal} Advance`;
        } else {
            if(advanceRow) advanceRow.style.display = 'none';
            if(checkoutBtn) checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Pay ₹${total} Now`;
        }
    }

    function showMessage(msg, type = 'success') {
        if (!successMessage) return;
        successMessage.querySelector('span').textContent = msg;
        successMessage.style.background = type === 'success' ? '#28a745' : '#dc3545';
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 3000);
    }

    // --- Product Page Listeners ---
    if (document.getElementById('addCreamToCart')) document.getElementById('addCreamToCart').addEventListener('click', () => {
        addToCart(products.cream, parseInt(document.getElementById('creamQuantity')?.value || 1));
    });
    if (document.getElementById('addSoapToCart')) document.getElementById('addSoapToCart').addEventListener('click', () => {
        addToCart(products.soap, parseInt(document.getElementById('soapQuantity')?.value || 1));
    });
    if (document.getElementById('addCapsuleToCart')) document.getElementById('addCapsuleToCart').addEventListener('click', () => {
        addToCart(products.capsule, parseInt(document.getElementById('capsuleQuantity')?.value || 1));
    });

    window.addComboToCart = function() {
        addToCart(products.combo, parseInt(document.getElementById('comboQuantity')?.value || 1));
    };

    if (document.getElementById('addMegaComboToCart')) {
        document.getElementById('addMegaComboToCart').addEventListener('click', () => {
            addToCart(products.megaCombo, parseInt(document.getElementById('megaComboQuantity')?.value || 1));
        });
    }

    // NEW: "Buy Now" redirects to cart.html
    window.buyNow = function(productKey) {
        cart = []; // Clear cart so they only buy this one item
        let qty = parseInt(document.getElementById(`${productKey}Quantity`)?.value || 1);
        addToCart(products[productKey], qty);
        window.location.href = 'cart.html'; 
    };

    // --- Checkout Logic (Runs on cart.html) ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) return showMessage('Your cart is empty', 'error');

            const custName = document.getElementById('custName').value.trim();
            const custPhone = document.getElementById('custPhone').value.trim();
            const custAddress = document.getElementById('custAddress').value.trim();

            if (!custName || !custPhone || !custAddress) {
                return showMessage('Please fill all shipping details', 'error');
            }

            const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
            const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'full';

            const originalBtnText = checkoutBtn.innerHTML;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            checkoutBtn.disabled = true;

            try {
                const response = await fetch(`${BACKEND_URL}/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart, paymentMethod })
                });

                if (!response.ok) throw new Error('Failed to create order on server');
                const orderData = await response.json();

                // Calculate totals for email
                let totalAmount = 0;
                let advanceTotal = 0;
                let orderDetailsHTML = cart.map(item => {
                    totalAmount += item.price * item.quantity;
                    advanceTotal += (item.advance || 0) * item.quantity;
                    return `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`;
                }).join('<br>');

                const amountPaid = paymentMethod === 'cod' ? advanceTotal : totalAmount;
                const balanceDue = paymentMethod === 'cod' ? totalAmount - advanceTotal : 0;
                const orderTypeString = paymentMethod === 'cod' ? `COD Order (Collect ₹${balanceDue} Cash)` : 'Prepaid Order (Paid in Full)';

                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: "INR",
                    name: "Glowtiqa Paris",
                    description: paymentMethod === 'cod' ? "Advance Payment" : "Premium Skincare Purchase",
                    image: "logo_v2.png", 
                    order_id: orderData.id,
                    handler: function (response) {
                        
                        const templateParams = {
                            to_name: "Glowtiqa Admin",
                            customer_name: custName,
                            customer_phone: custPhone,
                            customer_address: custAddress,
                            order_details: orderDetailsHTML,
                            total_amount: `₹${totalAmount}`,
                            amount_paid: `₹${amountPaid}`,
                            balance_due: `₹${balanceDue} (CASH ON DELIVERY)`,
                            order_type: orderTypeString,
                            payment_id: response.razorpay_payment_id
                        };

                        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
                            .then(() => {
                                cart = [];
                                saveCart();
                                alert(`Payment Successful! ${paymentMethod === 'cod' ? 'Your advance is paid.' : 'Your order is confirmed.'} We will contact you shortly.`);
                                window.location.href = 'index.html'; // Send home after success
                            }, (error) => {
                                console.error("EmailJS Error:", error);
                                alert("Payment successful, but issue notifying store. Contact support on WhatsApp.");
                            });
                    },
                    prefill: { name: custName, contact: custPhone },
                    theme: { color: "#b68d40" },
                    modal: {
                        ondismiss: function() {
                            checkoutBtn.innerHTML = originalBtnText;
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
                checkoutBtn.innerHTML = originalBtnText;
                checkoutBtn.disabled = false;
            }
        });
    }

    // Load initial cart UI
    updateCartUI();
});