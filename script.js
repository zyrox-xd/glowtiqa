document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------- CONFIGURATION ---------------- //
    const RAZORPAY_KEY_ID = "rzp_live_Rgl2NCpQcyFajX"; 
    // ----------------------------------------------- //

    // Product Data
    const products = {
        cream: {
            id: 1,
            name: "Glowtiqa Advance Whitening Cream",
            price: 2000,
            image: "gtiqa.jpg"
        },
        soap: {
            id: 2,
            name: "Glowtiqa Skin Whitening Soap",
            price: 599,
            image: "soap.jpg"
        },
    };

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('glowtiqaCart')) || [];
    
    // Element Selectors
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.querySelector('.cart-count');
    const successMessage = document.getElementById('successMessage');
    
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.getElementById('closeMenu');
    const mobileNav = document.getElementById('mobileNav');
    const navOverlay = document.getElementById('navOverlay');
    
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');
    const checkoutBtn = document.getElementById('checkoutBtn');

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
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
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
                </div>
            `;
        });
        
        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = `₹${total.toFixed(2)}`;
        
        // Re-attach listeners to new buttons
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                modifyQuantity(itemId, -1);
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                modifyQuantity(itemId, 1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                removeFromCart(itemId);
            });
        });
    }

    function addToCart(product, quantity = 1) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        saveCart();
        showSuccessMessage("Added to Cart!");
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
            if (item.quantity < 1) {
                removeFromCart(productId);
            } else {
                saveCart();
            }
        }
    }
    
    function saveCart() {
        localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
    
    function showSuccessMessage(msg = "Action Successful!") {
        if (!successMessage) return;
        successMessage.querySelector('span').textContent = msg;
        successMessage.classList.add('show');
        setTimeout(() => { successMessage.classList.remove('show'); }, 3000);
    }

    // --- Event Listeners ---
    
    // Menu
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileNav.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    function closeMobileMenu() {
        if (mobileNav) mobileNav.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
    document.querySelectorAll('.mobile-nav a').forEach(l => l.addEventListener('click', closeMobileMenu));
    
    // Cart Sidebar
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }

    // Product Buttons
    const addCreamBtn = document.getElementById('addCreamToCart');
    if (addCreamBtn) {
        addCreamBtn.addEventListener('click', () => {
            const qty = parseInt(document.getElementById('creamQuantity').value) || 1;
            addToCart(products.cream, qty);
        });
    }

    const addSoapBtn = document.getElementById('addSoapToCart');
    if (addSoapBtn) {
        addSoapBtn.addEventListener('click', () => {
            const qty = parseInt(document.getElementById('soapQuantity').value) || 1;
            addToCart(products.soap, qty);
        });
    }
    
    // Quantity Inputs (+/- buttons)
    ['Cream', 'Soap'].forEach(type => {
        const inc = document.getElementById(`increase${type}`);
        const dec = document.getElementById(`decrease${type}`);
        const input = document.getElementById(`${type.toLowerCase()}Quantity`);
        
        if(inc && input) inc.addEventListener('click', () => input.value = parseInt(input.value) + 1);
        if(dec && input) dec.addEventListener('click', () => {
            if(parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
        });
    });

    // --- 🚀 RAZORPAY (NEW SECURE BACKEND FLOW) 🚀 ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                alert('Your cart is empty!'); 
                return;
            }

            if(RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID_HERE") {
                alert("Developer: Please set your RAZORPAY_KEY_ID in script.js");
                return;
            }

            // 1. Create the Order on the Backend
            // This URL must match where your backend is running
            const response = await fetch('https://glowtiqa-backend.onrender.com/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart: cart }),
            });
            
            if (!response.ok) {
                alert('Failed to create order. Please try again.');
                return;
            }

            const order = await response.json();

            // 2. Open Razorpay Checkout
            var options = {
                "key": RAZORPAY_KEY_ID, // Your PUBLIC Key ID
                "amount": order.amount,   // Amount from server
                "currency": "INR",
                "name": "Glowtiqa Paris",
                "description": "Skincare Purchase",
                "image": "logo_v2.png",
                "order_id": order.id,     // This is the new, important part
                "handler": function (response) {
                    // This function is called on a successful payment
                    alert("Payment Successful!\nPayment ID: " + response.razorpay_payment_id);
                    
                    // Clear cart and close
                    cart = [];
                    saveCart();
                    if (cartSidebar) cartSidebar.classList.remove('active');
                },
                "prefill": {
                    "name": "Customer Name",
                    "email": "customer@example.com",
                    "contact": "9999999999"
                },
                "theme": {
                    "color": "#b68d40"
                }
            };
            
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert("Payment Failed. " + response.error.description);
            });
            rzp1.open();
        });
    }
    // --- End of Razorpay Flow ---

    // --- REVIEWS LOGIC ---
    function loadReviews() {
        let reviews = JSON.parse(localStorage.getItem('glowtiqaReviews')) || [];
        // Dummy data if empty
        if (reviews.length === 0) {
            reviews = [
                { name: "Sarah J.", date: "March 15, 2025", rating: 5, text: "My dark spots faded significantly!" },
                { name: "Michael T.", date: "Feb 28, 2025", rating: 4, text: "Great soap, leaves skin fresh." }
            ];
            // Save dummy data so it persists
            localStorage.setItem('glowtiqaReviews', JSON.stringify(reviews));
        }
        
        if (!reviewsList) return;
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
                <p style="color:#555;">${r.text}</p>
            `;
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
            reviews.unshift(newReview); // Add to top
            localStorage.setItem('glowtiqaReviews', JSON.stringify(reviews));
            
            loadReviews();
            reviewForm.reset();
            showSuccessMessage("Review Submitted!");
        });
    }

    // --- Init ---
    loadReviews();
    updateCartCount();
    updateCartDisplay();
});