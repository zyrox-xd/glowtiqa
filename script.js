document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------- CONFIGURATION ---------------- //
    const RAZORPAY_KEY_ID = "rzp_live_RelYBJxzCUWKj3"; 
    const EMAILJS_SERVICE_ID = "service_h64g36k";  
    const EMAILJS_TEMPLATE_ID = "template_df8ic0r"; 
    // ----------------------------------------------- //

    // Product Data
    const products = {
        cream: {
            id: 1,
            name: "Glowtiqa Advance Whitening Cream",
            price: 2000,
            originalPrice: 2999,
            image: "gtiqa.jpg"
        },
        soap: {
            id: 2,
            name: "Glowtiqa Skin Whitening Soap",
            price: 1,
            originalPrice: 999,
            image: "soap.jpg"
        },
    };

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('glowtiqaCart')) || [];
    
    // --- Element Selectors ---
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
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');
    
    // Product 1 (Cream) Elements
    const increaseCream = document.getElementById('increaseCream');
    const decreaseCream = document.getElementById('decreaseCream');
    const creamQuantity = document.getElementById('creamQuantity');
    const addCreamToCart = document.getElementById('addCreamToCart');
    
    // Product 2 (Soap) Elements
    const increaseSoap = document.getElementById('increaseSoap');
    const decreaseSoap = document.getElementById('decreaseSoap');
    const soapQuantity = document.getElementById('soapQuantity');
    const addSoapToCart = document.getElementById('addSoapToCart');
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    const allLinks = document.querySelectorAll('a[href^="#"]');
    
    // Update cart count
    function updateCartCount() {
        if (!cartCount) return;
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    }
    
    // Update cart display
    function updateCartDisplay() {
        if (!cartItems || !cartTotal) return;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
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
        
        // Add event listeners to NEW cart items
        addCartItemListeners();
    }

    // Helper to add listeners to dynamic cart items
    function addCartItemListeners() {
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                decreaseQuantity(itemId);
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                increaseQuantity(itemId);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cart-item').dataset.id);
                removeFromCart(itemId);
            });
        });
    }
    
    // Add to cart
    function addToCart(product, quantity = 1) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
        
        // Show success message
        showSuccessMessage();
        
        // Open Cart Sidebar automatically
        if (cartSidebar) cartSidebar.classList.add('active');
    }
    
    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
    
    // Increase quantity
    function increaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
            updateCartCount();
            updateCartDisplay();
        }
    }
    
    // Decrease quantity
    function decreaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                removeFromCart(productId);
                return;
            }
            localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
            updateCartCount();
            updateCartDisplay();
        }
    }
    
    // Show success message
    function showSuccessMessage() {
        if (!successMessage) return;
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    }
    
    // Mobile navigation toggle with overlay
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            if (mobileNav) mobileNav.classList.add('active');
            if (navOverlay) navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', closeMobileMenu);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileMenu);
    }
    
    function closeMobileMenu() {
        if (mobileNav) mobileNav.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Close menu when clicking on links
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Cart sidebar functionality
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if (cartSidebar) cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            if (cartSidebar) cartSidebar.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // ---------------------------------------------------------
    // RAZORPAY + EMAILJS INTEGRATION LOGIC
    // ---------------------------------------------------------
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!'); 
                return;
            }

            // 1. GET USER INPUTS
            const custName = document.getElementById('custName').value;
            const custPhone = document.getElementById('custPhone').value;
            const custAddress = document.getElementById('custAddress').value;

            // 2. VALIDATE INPUTS
            if (!custName || !custPhone || !custAddress) {
                alert("Please fill in your Name, Phone Number, and Shipping Address before paying.");
                return; // Stop here if empty
            }

            // 3. PREPARE ORDER DATA
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            // Create a readable list of items
            const itemsDescription = cart.map(item => `• ${item.name} (Qty: ${item.quantity})`).join('\n');

            // Check if Razorpay Key is set
            if(!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID") {
                alert("Developer Error: Please set your RAZORPAY_KEY_ID in script.js");
                return;
            }

            // 4. RAZORPAY OPTIONS
            var options = {
                "key": RAZORPAY_KEY_ID, 
                "amount": totalAmount * 100, // Amount in paise
                "currency": "INR",
                "name": "Glowtiqa Paris",
                "description": "Skincare Order",
                "image": "logo_v2.png", 
                "prefill": {
                    "name": custName,
                    "contact": custPhone
                },
                "theme": { "color": "#b68d40" },
                
                // 5. SUCCESS HANDLER
                "handler": function (response){
                    
                    // Change button text to show processing
                    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Order...';
                    checkoutBtn.disabled = true;

                    // Prepare data for EmailJS Template
                    // KEYS MUST MATCH EMAILJS TEMPLATE VARIABLES
                    var templateParams = {
                        customer_name: custName,
                        customer_phone: custPhone,
                        shipping_address: custAddress,
                        order_items: itemsDescription,
                        total_amount: totalAmount,
                        payment_id: response.razorpay_payment_id
                    };

                    // Send Email
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                        .then(function() {
                            // SUCCESS!
                            alert("Order Successful! We have received your order details.");
                            
                            // Clear Cart
                            cart = [];
                            localStorage.setItem('glowtiqaCart', JSON.stringify(cart));
                            updateCartCount();
                            updateCartDisplay();
                            
                            // Reset UI
                            checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay Now';
                            checkoutBtn.disabled = false;
                            if (cartSidebar) cartSidebar.classList.remove('active');
                            document.body.style.overflow = 'auto';
                            
                            // Clear form fields
                            document.getElementById('custName').value = '';
                            document.getElementById('custPhone').value = '';
                            document.getElementById('custAddress').value = '';
                            
                            // Reload page
                            window.location.href = "#hero";

                        }, function(error) {
                            // FAILED TO SEND EMAIL
                            console.error('EmailJS Error:', error);
                            alert("Payment received (ID: " + response.razorpay_payment_id + "), but there was an error sending your order details. Please take a screenshot and contact us on WhatsApp!");
                            checkoutBtn.disabled = false;
                        });
                }
            };
            
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
                alert("Payment Failed. " + response.error.description);
            });
            rzp1.open();
        });
    }
    
    // Product quantity controls
    if (increaseCream) {
        increaseCream.addEventListener('click', () => {
            if (creamQuantity) creamQuantity.value = parseInt(creamQuantity.value) + 1;
        });
    }
    
    if (decreaseCream) {
        decreaseCream.addEventListener('click', () => {
            if (creamQuantity && parseInt(creamQuantity.value) > 1) {
                creamQuantity.value = parseInt(creamQuantity.value) - 1;
            }
        });
    }
    
    if (increaseSoap) {
        increaseSoap.addEventListener('click', () => {
            if (soapQuantity) soapQuantity.value = parseInt(soapQuantity.value) + 1;
        });
    }
    
    if (decreaseSoap) {
        decreaseSoap.addEventListener('click', () => {
            if (soapQuantity && parseInt(soapQuantity.value) > 1) {
                soapQuantity.value = parseInt(soapQuantity.value) - 1;
            }
        });
    }
    
    // Add to cart buttons
    if (addCreamToCart) {
        addCreamToCart.addEventListener('click', () => {
            const quantity = creamQuantity ? parseInt(creamQuantity.value) : 1;
            addToCart(products.cream, quantity);
        });
    }
    
    if (addSoapToCart) {
        addSoapToCart.addEventListener('click', () => {
            const quantity = soapQuantity ? parseInt(soapQuantity.value) : 1;
            addToCart(products.soap, quantity);
        });
    }
    
    // Smooth scrolling
    allLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                closeMobileMenu();
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                closeMobileMenu();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation to elements when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.product-section, .description-section, .about-section, .testimonial-card, .soap-container, .review-item').forEach(el => {
        observer.observe(el);
    });
    
    // Review system with localStorage
    function loadReviews() {
        const reviews = getStoredReviews();
        
        if (reviews.length === 0) {
            // Add sample reviews if none exist
            const sampleReviews = [
                {
                    id: 1,
                    name: "Sarah Johnson",
                    email: "sarah@example.com",
                    rating: 5,
                    text: "I've been using both Glowtiqa products for 3 months and the results are amazing! My dark spots have faded significantly and my skin has never looked brighter. Highly recommend!",
                    date: "March 15, 2024"
                },
                {
                    id: 2,
                    name: "Michael Tan",
                    email: "michael@example.com",
                    rating: 4,
                    text: "The cleansing soap is incredible! It leaves my skin feeling fresh without any dryness. Combined with the whitening cream, it's the perfect skincare routine. Only wish the cream came in a larger size.",
                    date: "February 18, 2025"
                },
                {
                    id: 3,
                    name: "Priya Sharma",
                    email: "priya@example.com",
                    rating: 5,
                    text: "After just 4 weeks of using Glowtiqa, my friends started asking me what I was doing differently. My skin feels softer and looks years younger! Will definitely purchase again.",
                    date: "January 10, 2023"
                }
            ];
            
            localStorage.setItem('glowtiqaReviews', JSON.stringify(sampleReviews));
            displayReviews(sampleReviews);
        } else {
            displayReviews(reviews);
        }
    }
    
    function getStoredReviews() {
        const reviewsJSON = localStorage.getItem('glowtiqaReviews');
        return reviewsJSON ? JSON.parse(reviewsJSON) : [];
    }
    
    function displayReviews(reviews) {
        if (!reviewsList) return;
        
        // Sort reviews by rating (highest first) and then by date (newest first)
        reviews.sort((a, b) => {
            if (b.rating !== a.rating) {
                return b.rating - a.rating;
            }
            return new Date(b.date) - new Date(a.date);
        });
        
        reviewsList.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review our products!</p>';
            return;
        }
        
        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item animate';
            
            // Create stars HTML
            let starsHTML = '';
            for (let i = 0; i < 5; i++) {
                if (i < review.rating) {
                    starsHTML += '★';
                } else {
                    starsHTML += '☆';
                }
            }
            
            reviewItem.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <h4>${review.name}</h4>
                        <div class="review-date">${review.date}</div>
                    </div>
                    <div class="review-stars">
                        ${starsHTML}
                    </div>
                </div>
                <div class="review-text">
                    ${review.text}
                </div>
            `;
            
            reviewsList.appendChild(reviewItem);
        });
    }
    
    // Review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reviewerName').value;
            const email = document.getElementById('reviewerEmail').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            const reviewText = document.getElementById('reviewText').value;
            
            if (!rating) {
                alert('Please select a rating');
                return;
            }
            
            const reviews = getStoredReviews();
            
            const newReview = {
                id: Date.now(), // Simple ID based on timestamp
                name: name,
                email: email,
                rating: parseInt(rating.value),
                text: reviewText,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };
            
            reviews.unshift(newReview);
            localStorage.setItem('glowtiqaReviews', JSON.stringify(reviews));
            displayReviews(reviews);
            reviewForm.reset();
            
            // Use the non-blocking success message
            if (successMessage) {
                successMessage.querySelector('span').textContent = 'Review submitted successfully!';
                showSuccessMessage();
            } else {
                alert('Thank you for your review!'); // Fallback
            }
        });
    }

    // --- Initial Page Load ---
    loadReviews();
    updateCartCount();
    updateCartDisplay();

});