// Form data object to store all input values
let formData = {
    customer: '',
    cp: '',
    classification: '',
    brand: '',
    plate: '',
    year: '',
    service: '',
    notes: '',
    issue: '',
    mechanic: '',
    additionalNotes: ''
};

// Element references
const customerInput = document.getElementById('customer');
const cpInput = document.getElementById('cp');
const classificationInput = document.getElementById('classification');
const brandInput = document.getElementById('brand');
const plateInput = document.getElementById('plate');
const yearSelect = document.getElementById('year');
const serviceSelect = document.getElementById('service');
const notesTextarea = document.getElementById('notes');
const issueTextarea = document.getElementById('issue');
const mechanicSelect = document.getElementById('mechanic');
const additionalNotesTextarea = document.getElementById('additionalNotes');
const addOrderBtn = document.getElementById('addOrder');
const toastElement = document.getElementById('toast');

// Add event listeners to all form elements
customerInput.addEventListener('input', handleInputChange);
cpInput.addEventListener('input', handleInputChange);
classificationInput.addEventListener('input', handleInputChange);
brandInput.addEventListener('input', handleInputChange);
plateInput.addEventListener('input', handleInputChange);
yearSelect.addEventListener('change', handleInputChange);
serviceSelect.addEventListener('change', handleInputChange);
notesTextarea.addEventListener('input', handleInputChange);
issueTextarea.addEventListener('input', handleInputChange);
mechanicSelect.addEventListener('change', handleInputChange);
additionalNotesTextarea.addEventListener('input', handleInputChange);
addOrderBtn.addEventListener('click', handleAddOrder);

// Handle input change events
function handleInputChange(event) {
    const { id, value } = event.target;
    formData[id] = value;
    console.log(`Updated ${id}: ${value}`);
}

// Handle add order button click
function handleAddOrder() {
    // Validate form data
    if (!validateForm()) {
        showToast('Please fill out required fields');
        return;
    }
    
    // Process order (in a real app, this might send data to a server)
    console.log('Adding order with data:', formData);
    showToast('Order added successfully!');
    
    // Optional: Reset form after submission
    // resetForm();
}

// Form validation
function validateForm() {
    // Add your validation logic here
    // Example: Check if customer name is provided
    if (!formData.customer.trim()) {
        return false;
    }
    
    // Add more validation as needed
    
    return true;
}

// Show toast notification
function showToast(message) {
    toastElement.textContent = message;
    toastElement.style.display = 'block';
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toastElement.style.display = 'none';
    }, 3000);
}

// Reset form values
function resetForm() {
    // Reset all form fields
    customerInput.value = '';
    cpInput.value = '';
    classificationInput.value = '';
    brandInput.value = '';
    plateInput.value = '';
    yearSelect.value = '';
    serviceSelect.value = '';
    notesTextarea.value = '';
    issueTextarea.value = '';
    mechanicSelect.value = '';
    additionalNotesTextarea.value = '';
    
    // Reset form data object
    for (const key in formData) {
        formData[key] = '';
    }
    
    console.log('Form reset');
}

// Initialize the form if needed
function initForm() {
    console.log('Vehicle Service Form initialized');
    
    // You can pre-populate fields or perform other initialization here
    // Example: Set current date, load saved data, etc.
}

// Run initialization when the document is fully loaded
document.addEventListener('DOMContentLoaded', initForm);