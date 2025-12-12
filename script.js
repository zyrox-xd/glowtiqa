document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------- CONFIGURATION ---------------- //
    const RAZORPAY_KEY_ID = "rzp_live_Rgl2NCpQcyFajX"; 
    const BACKEND_URL = "https://glowtiqa-backend.onrender.com"; 

    // EmailJS Config
    const EMAILJS_SERVICE_ID = "service_jjk7wkz";
    const EMAILJS_TEMPLATE_ID = "template_jndkdwl";
    const EMAILJS_PUBLIC_KEY = "OlVciViSI0LWBnEA9";
    // ----------------------------------------------- //

    // --- PRODUCT DATA (ID 3 is the Combo) ---
    const products = {
        cream: { id: 1, name: "Glowtiqa Advance Whitening Cream", price: 2000, image: "gtiqa.jpg" },
        soap: { id: 2, name: "Glowtiqa Skin Whitening Soap", price: 599, image: "soap.jpg" },
        combo: { id: 3, name: "Ultimate Whitening Kit (Cream + Soap)", price: 2400, image: "combo.jpg" } 
    };

    let cart = JSON.parse(localStorage.getItem('glowtiqaCart')) || [];
    
    // --- Elements ---
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.querySelector('.cart-count');
    const messagePopup = document.getElementById('successMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.getElementById('closeMenu');
    const mobileNav = document.getElementById('mobileNav');
    const navOverlay = document.getElementById('navOverlay');
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');

    // --- GLOBAL BUY NOW FUNCTION (Fixes the issue) ---
    // This function can be called from HTML onclick="..."
    window.buyNow = function(productKey) {
        let product = products[productKey];
        let qty = 1;

        // Try to find a quantity input for this product (only exists on products.html)
        const qtyInput = document.getElementById(`${productKey}Quantity`);
        if (qtyInput) {
            qty = parseInt(qtyInput.value) || 1;
        }

        addToCart(product, qty);
        
        // Force sidebar open smoothly
        if (cartSidebar) {
            cartSidebar.classList.remove('active'); // Reset to ensure animation plays
            setTimeout(() => {
                cartSidebar.classList.add('active');
            }, 10);
        }
    };

    // --- CHECKOUT FLOW ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                showMessage('Your cart is empty!', 'error');
                return;
            }

            const customerName = document.getElementById('custName').value;
            const customerPhone = document.getElementById('custPhone').value;
            const customerAddress = document.getElementById('custAddress').value;

            if (!customerName || !customerPhone || !customerAddress) {
                showMessage('Please fill in all shipping details.', 'error');
                return;
            }

            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Order...';

            try {
                const response = await fetch(`${BACKEND_URL}/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart: cart }),
                });
                
                if (!response.ok) throw new Error('Failed to create order.');
                const order = await response.json();

                var options = {
                    "key": RAZORPAY_KEY_ID,
                    "amount": order.amount,
                    "currency": "INR",
                    "name": "Glowtiqa Paris",
                    "description": "Skincare Purchase",
                    "image": "logo_v2.png",
                    "order_id": order.id,
                    "prefill": {
                        "name": customerName,
                        "email": "customer@example.com", 
                        "contact": customerPhone
                    },
                    "theme": { "color": "#b68d40" },
                    "handler": function (response) {
                        showMessage('Payment successful! Sending confirmation...');
                        
                        let orderItemsText = "";
                        let totalAmount = 0;
                        cart.forEach(item => {
                            orderItemsText += `${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}<br>`;
                            totalAmount += item.price * item.quantity;
                        });

                        const templateParams = {
                            payment_id: response.razorpay_payment_id,
                            order_id: response.razorpay_order_id,
                            customer_name: customerName,
                            customer_phone: customerPhone,
                            shipping_address: customerAddress, 
                            order_items: orderItemsText,
                            total_amount: totalAmount.toFixed(2)
                        };

                        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
                            .finally(function() {
                                cart = [];
                                saveCart();
                                window.location.href = `/thanks.html?payment_id=${response.razorpay_payment_id}`;
                            });
                    },
                    "modal": {
                        "ondismiss": function() {
                            showMessage('Payment was cancelled.', 'error');
                            checkoutBtn.disabled = false;
                            checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay Now';
                        }
                    }
                };
                var rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    showMessage(response.error.description, 'error');
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay Now';
                });
                rzp1.open();

            } catch (error) {
                showMessage(error.message, 'error');
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay Now';
            }
        });
    }

    // --- Cart Logic ---
    function updateCartCount() {
        if (!cartCount) return;
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    }
    
    function updateCartDisplay() {
        if (!cartItems || !cartTotal) return;
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart" style="text-align:center; padding:20px; color:#777;"><i class="fas fa-shopping-cart" style="font-size:2rem; margin-bottom:10px;"></i><p>Your cart is empty</p></div>';
            cartTotal.textContent = '₹0.00';
            return;
        }
        let total = 0;
        let itemsHTML = '';
        cart.forEach(item => {
            total += item.price * item.quantity;
            itemsHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://placehold.co/80x80/f9f5eb/b68d40?text=Glowtiqa'">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn decrease-quantity">-</button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity">+</button>
                            <button class="remove-item"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        });
        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = `₹${total.toFixed(2)}`;
        attachCartItemListeners();
    }

    function attachCartItemListeners() {
        document.querySelectorAll('.decrease-quantity').forEach(btn => btn.addEventListener('click', function() { modifyQuantity(parseInt(this.closest('.cart-item').dataset.id), -1); }));
        document.querySelectorAll('.increase-quantity').forEach(btn => btn.addEventListener('click', function() { modifyQuantity(parseInt(this.closest('.cart-item').dataset.id), 1); }));
        document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', function() { removeFromCart(parseInt(this.closest('.cart-item').dataset.id)); }));
    }

    function addToCart(product, quantity = 1) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) { existingItem.quantity += quantity; } 
        else { cart.push({ ...product, quantity: quantity }); }
        saveCart();
        showMessage("Added to Cart!", 'success');
        
        // Open sidebar
        if (cartSidebar) cartSidebar.classList.add('active');
    }
    
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    }
    
    function modifyQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) { removeFromCart(productId); } 
            else { saveCart(); }
        }
    }
    
    function saveCart() {
        localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
    
    function showMessage(msg, type = 'success') {
        if (!messagePopup) return;
        messagePopup.querySelector('span').textContent = msg;
        messagePopup.classList.toggle('error', type === 'error');
        messagePopup.classList.add('show');
        setTimeout(() => { messagePopup.classList.remove('show'); }, 3000);
    }
    
    // --- Mobile Menu ---
    if (mobileMenu) { mobileMenu.addEventListener('click', () => {
        if(mobileNav) mobileNav.classList.add('active');
        if(navOverlay) navOverlay.classList.add('active');
    });}
    
    function closeMobileMenu() {
        if (mobileNav) mobileNav.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
    }
    
    if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
    document.querySelectorAll('.mobile-nav a').forEach(l => l.addEventListener('click', closeMobileMenu));
    
    // --- Cart Sidebar ---
    if (cartIcon) { cartIcon.addEventListener('click', () => { if(cartSidebar) cartSidebar.classList.add('active'); }); }
    if (closeCart) { closeCart.addEventListener('click', () => { if(cartSidebar) cartSidebar.classList.remove('active'); }); }
    
    // --- Product Actions (Add to Cart Buttons) ---
    // These listeners handle the normal "Add to Cart" buttons
    const addCreamBtn = document.getElementById('addCreamToCart');
    if (addCreamBtn) { 
        addCreamBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('creamQuantity');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            addToCart(products.cream, qty);
        });
    }

    const addSoapBtn = document.getElementById('addSoapToCart');
    if (addSoapBtn) { 
        addSoapBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('soapQuantity');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            addToCart(products.soap, qty);
        });
    }
    
    // Quantity Selectors
    ['Cream', 'Soap'].forEach(type => {
        const inc = document.getElementById(`increase${type}`);
        const dec = document.getElementById(`decrease${type}`);
        const input = document.getElementById(`${type.toLowerCase()}Quantity`);
        if(inc && input) inc.addEventListener('click', () => input.value = parseInt(input.value) + 1);
        if(dec && input) dec.addEventListener('click', () => { if(parseInt(input.value) > 1) input.value = parseInt(input.value) - 1; });
    });

    // --- Reviews Logic ---
    function loadReviews() {
        if (!reviewsList) return;

        let reviews = JSON.parse(localStorage.getItem('glowtiqaReviews')) || [];
        if (reviews.length === 0) {
            reviews = [
                { name: "Sarah J.", date: "March 15, 2025", rating: 5, text: "My dark spots faded significantly!" },
                { name: "Michael T.", date: "Feb 28, 2025", rating: 4, text: "Great soap, leaves skin fresh." }
            ];
            localStorage.setItem('glowtiqaReviews', JSON.stringify(reviews));
        }
        
        reviewsList.innerHTML = '';
        reviews.forEach(r => {
            let stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            const div = document.createElement('div');
            div.className = 'review-item';
            div.innerHTML = `
                <div class="review-header" style="display:flex; justify-content:space-between;">
                    <h4>${r.name} <span style="font-size:0.8rem; color:#777; font-weight:normal;">${r.date}</span></h4>
                    <div class="review-stars">${stars}</div>
                </div>
                <p style="color:#555;">${r.text}</p>`;
            reviewsList.appendChild(div);
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewerName').value;
            const text = document.getElementById('reviewText').value;
            const ratingEl = document.querySelector('input[name="rating"]:checked');
            const rating = ratingEl ? parseInt(ratingEl.value) : 5;
            const newReview = { 
                name: name, 
                rating: rating, 
                text: text, 
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
            };
            let reviews = JSON.parse(localStorage.getItem('glowtiqaReviews')) || [];
            reviews.unshift(newReview);
            localStorage.setItem('glowtiqaReviews', JSON.stringify(reviews));
            loadReviews();
            reviewForm.reset();
            showMessage("Review Submitted!", 'success');
        });
    }

    // Init
    loadReviews();
    updateCartCount();
    updateCartDisplay();
});