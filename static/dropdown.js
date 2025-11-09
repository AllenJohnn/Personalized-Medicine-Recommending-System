let medicines = []; // This will be dynamically populated with medicines

// Fetch the medicines list from the server
async function fetchMedicines() {
    try {
        const response = await fetch('/medicines'); // Call the /medicines endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        medicines = await response.json(); // Parse the JSON response
    } catch (error) {
        console.error("Error fetching medicines:", error);
    }
}

// Filter and display dropdown items
function filterDropdown(input) {
    const dropdown = document.querySelector('.dropdown'); // Get the dropdown element
    const query = input.value.toLowerCase(); // Convert input to lowercase for case-insensitive matching
    dropdown.innerHTML = ''; // Clear previous dropdown content

    // Show a message if no search query is entered
    if (query.trim() === '') {
        dropdown.style.display = 'none'; // Hide dropdown if query is empty
        return;
    }

    // Filter medicines based on query
    const filtered = medicines.filter(medicine => medicine.toLowerCase().startsWith(query));
    
    // Show dropdown or show no results message
    if (filtered.length > 0) {
        dropdown.style.display = 'block'; // Show dropdown if there are matches
        filtered.forEach(item => {
            const li = document.createElement('li'); // Create a new list item
            li.textContent = item; // Set the text content to the medicine name
            li.classList.add('dropdown-item'); // Add a class for styling
            li.addEventListener('click', () => {
                input.value = item; // Set the input value to the selected medicine
                dropdown.style.display = 'none'; // Hide the dropdown
            });
            dropdown.appendChild(li); // Append the list item to the dropdown
        });
    } else {
        const noResults = document.createElement('li');
        noResults.textContent = "No results found"; // Show "No results found" message
        noResults.classList.add('no-results');
        dropdown.appendChild(noResults);
        dropdown.style.display = 'block'; // Display the dropdown with the message
    }
}

// Function to add a success or error message to the UI
function displayFeedback(message, type = 'error') {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    if (type === 'success') {
        feedbackMessage.classList.remove('error-message');
        feedbackMessage.classList.add('success-message');
    } else {
        feedbackMessage.classList.remove('success-message');
        feedbackMessage.classList.add('error-message');
    }
}

// Initialize the script when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchMedicines(); // Fetch medicines from the server

    const input = document.getElementById('medicine'); // Get the input element
    input.addEventListener('input', () => filterDropdown(input)); // Attach event listener for filtering
    input.addEventListener('focus', () => {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown.children.length > 0) {
            dropdown.style.display = 'block'; // Display dropdown on focus
        }
    });

    input.addEventListener('blur', () => {
        const dropdown = document.querySelector('.dropdown');
        setTimeout(() => {
            dropdown.style.display = 'none'; // Hide dropdown after input loses focus
        }, 200); // Delay to allow for clicking dropdown items
    });
});

