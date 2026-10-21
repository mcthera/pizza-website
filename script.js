document.addEventListener('DOMContentLoaded', () => {

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
        const nameInput = document.getElementById('customer-name').value.trim();
        const phoneInput = document.getElementById('customer-phone').value.trim();
        const locationInput = document.getElementById('customer-location').value.trim();

        if (!nameInput || !phoneInput || !locationInput) {
            alert('Please fill in your Full Name, Phone Number, and Delivery Location.');
            return;
        }

        const totalVal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const restoreCheckoutButton = setButtonLoading(checkoutBtn, 'Processing order...');
        
        try {
            const response = await fetch('checkout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: nameInput,
                    phone: phoneInput,
                    location: locationInput,
                    cart: cart,
                    total: totalVal
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                const summaryParts = cart.map(item => `${item.title} (x${item.quantity})`);
                const orderSummaryText = summaryParts.join(', ');
                const whatsappNumber = "233597787700";
                
                // Formatted WhatsApp message with Customer Name, Phone & Location
                const whatsappMessage = `🍕 *NEW MANU PIZZA ORDER!* 🍕\n\n*Name:* ${nameInput}\n*Phone:* ${phoneInput}\n*Location:* ${locationInput}\n*Items:* ${orderSummaryText}\n*Total:* ₵${totalVal.toFixed(2)}`;

                // Redirect directly on mobile phones to bypass popup blockers
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                
                // Reset Cart and Form Inputs
                cart.length = 0;
                updateCartUI();
                document.getElementById('customer-name').value = '';
                document.getElementById('customer-phone').value = '';
                document.getElementById('customer-location').value = '';

                window.location.href = whatsappURL;
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
});