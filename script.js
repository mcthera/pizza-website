document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('alert-box');
    const authSection = document.getElementById('auth-section');
    const navAccountLink = document.getElementById('nav-account-link');

    function setButtonLoading(button, label) {
        const originalLabel = button.textContent;
        button.disabled = true;
        button.classList.add('is-processing');
        button.setAttribute('aria-busy', 'true');
        button.innerHTML = `<span class="runner-indicator">🏃‍♂️🍕</span> ${label}`;
        return () => {
            button.textContent = originalLabel;
            button.disabled = false;
            button.classList.remove('is-processing');
            button.removeAttribute('aria-busy');
        };
    }

    // Toggle Account Section visibility via Navbar link
    navAccountLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (authSection.style.display === 'none') {
            authSection.style.display = 'flex';
            authSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            authSection.style.display = 'none';
        }
    });
    
    function showAlert(message, type){
        alertBox.textContent = message;
        alertBox.className = `alert ${type}`;
        authSection.style.display = 'flex';
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const restoreButton = setButtonLoading(registerForm.querySelector('button[type="submit"]'), 'Registering...');
        try {
            const response = await fetch('register.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.status === 'success') {
                showAlert(result.message, 'success');
                registerForm.reset();
            } else {
                showAlert(result.message, 'error');
            }
        } catch (err) {
            showAlert('An error occurred connecting to server.', 'error');
        } finally {
            restoreButton();
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const restoreButton = setButtonLoading(loginForm.querySelector('button[type="submit"]'), 'Signing in...');
        try {
            const response = await fetch('login.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.status === 'success') {
                showAlert(result.message, 'success');
                loginForm.reset();
                localStorage.setItem('pizza_user', JSON.stringify(result.user));
                checkUserSession();
            } else {
                showAlert(result.message, 'error');
            }
        } catch (err) {
            showAlert('An error occurred connecting to the server.', 'error');
        } finally {
            restoreButton();
        }
    });

    const cart = [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    const addToOrderButtons = document.querySelectorAll('.menu-card button');

    addToOrderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            const title = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace('₵', ''));
            
            // Grab custom typed quantity input
            const qtyInput = card.querySelector('.item-qty');
            const quantity = parseInt(qtyInput.value) || 1;

            const existingItem = cart.find(item => item.title === title);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ title, price, quantity });
            }

            qtyInput.value = 1;
            updateCartUI();
        });
    });

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p id="empty-cart-msg" style="text-align:center; color:#666; padding: 1rem;">Your cart is empty. Pick a delicious pizza above!</p>';
            cartTotalPrice.textContent = '₵0.00';
            checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <span><strong>${item.title}</strong> (x${item.quantity})</span>
                <span>₵${itemTotal.toFixed(2)} <button class="remove-btn" data-index="${index}" title="Remove item">🗑️</button></span>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });

        cartTotalPrice.textContent = `₵${total.toFixed(2)}`;
        checkoutBtn.disabled = false;

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }

    checkoutBtn.addEventListener('click', async () => {
        const phoneInput = document.getElementById('customer-phone').value.trim();
        const locationInput = document.getElementById('customer-location').value.trim();

        if (!phoneInput || !locationInput) {
            alert('Please enter your phone number and delivery location.');
            return;
        }

        const totalVal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const userEmail = window.currentUserEmail || 'guest@manupizza.com';

        const restoreCheckoutButton = setButtonLoading(checkoutBtn, 'Processing order...');
        
        try {
            const response = await fetch('checkout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    phone: phoneInput,
                    location: locationInput,
                    cart: cart,
                    total: totalVal
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert(result.message);

                const summaryParts = cart.map(item => `${item.title} (x${item.quantity})`);
                const orderSummaryText = summaryParts.join(', ');
                const whatsappNumber = "233597787700";
                const whatsappMessage = `🍕 *NEW MANU PIZZA ORDER!* 🍕\n\n*Customer:* ${userEmail}\n*Phone:* ${phoneInput}\n*Location:* ${locationInput}\n*Items:* ${orderSummaryText}\n*Total:* ₵${totalVal.toFixed(2)}`;

                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappURL, '_blank');

                cart.length = 0;
                updateCartUI();
                document.getElementById('customer-phone').value = '';
                document.getElementById('customer-location').value = '';
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert('An error occurred connecting to the server.');
        } finally {
            restoreCheckoutButton();
            checkoutBtn.disabled = cart.length === 0;
        }
    });

    function checkUserSession() {
        const savedUser = localStorage.getItem('pizza_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            authSection.innerHTML = `
                <div class="form-card" style="text-align: center; max-width: 500px; margin: 0 auto;">
                    <h2>Welcome, ${user.fullname}! 🍕</h2>
                    <p style="color: #666; margin-bottom: 1.5rem;">Logged in as: <strong>${user.email}</strong></p>
                    <p style="margin-bottom: 1.5rem; color: #28a745; font-weight: bold;">You are ready to order and checkout!</p>
                    <button id="logout-btn" class="btn btn-secondary">Logout</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('pizza_user');
                window.location.reload();
            });
            window.currentUserEmail = user.email;
        }
    }

    checkUserSession();
});