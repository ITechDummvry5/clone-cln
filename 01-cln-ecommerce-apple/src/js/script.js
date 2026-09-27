/* SIZE SELECTION */
document.querySelectorAll('.options button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.options button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

/* QUANTITY */
const minusBtn = document.querySelector('.quantity button:first-child');
const plusBtn  = document.querySelector('.quantity button:last-child');
const qtyInput = document.querySelector('.quantity input');

minusBtn.addEventListener('click', () => {
    let value = parseInt(qtyInput.value);
    if (value > 1) qtyInput.value = value - 1;
});

plusBtn.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
});

/* COUPON */
const basePrice = 14.00;
const priceEl = document.getElementById('price');
const couponSelect = document.getElementById('couponSelect');
const discountText = document.getElementById('discountText');

couponSelect.addEventListener('change', () => {
    const discount = parseInt(couponSelect.value);
    let finalPrice = basePrice;

    if (discount > 0) {
        finalPrice = basePrice - (basePrice * discount / 100);
        discountText.textContent = `(${discount}% OFF)`;
    } else {
        discountText.textContent = '';
    }

    priceEl.textContent = finalPrice.toFixed(2);
});

/* COLOR SELECTION + MULTI-VIEW IMAGES */
const productImg = document.getElementById('productImg');
const colorButtons = document.querySelectorAll('.colors span');
const controlsView = document.querySelector('.controls-view');

let currentImages = [];

// Function to generate view dots
function createViewDots(images) {
    controlsView.innerHTML = ''; // clear existing dots
    images.forEach((imgSrc, i) => {
        const dot = document.createElement('span');
        dot.classList.add('btn');
        if(i === 0) dot.classList.add('active'); // front default
        dot.addEventListener('click', () => {
            productImg.src = imgSrc;
            controlsView.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
            dot.classList.add('active');
        });
        controlsView.appendChild(dot);
    });
}

// Initialize default color (blue)
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all colors
        colorButtons.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        // Determine images for selected color
        let colorClass = btn.classList[0]; // c1, c2, c3, c4
        switch(colorClass) {
            case 'c1': // red
                currentImages = ["assets/images/image-red.png","view/image-red1.png","view/image-red2.png"];
                break;
            case 'c2': // yellow
                currentImages = ["assets/images/image-yellow.png","view/image-yellow1.png","view/image-yellow2.png"];
                break;
            case 'c3': // white
                currentImages = ["assets/images/image-white.png","view/image-white1.png","view/image-white2.png"];
                break;
            case 'c4': // blue
                currentImages = ["assets/images/image-blue.png","view/image-blue1.png","view/image-blue2.png"];
                break;
        }

        productImg.src = currentImages[0]; // default front
        createViewDots(currentImages);
    });
});

// Set initial view for default color (blue)
currentImages = ["assets/images/image-blue.png","view/image-blue1.png","view/image-blue2.png"];
createViewDots(currentImages);
productImg.src = currentImages[0];
