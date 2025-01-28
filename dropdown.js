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

    if (query.trim() === '') {
        dropdown.style.display = 'none'; // Hide dropdown if query is empty
        return;
    }

    const filtered = medicines.filter(medicine => medicine.toLowerCase().startsWith(query));
    if (filtered.length > 0) {
        dropdown.style.display = 'block'; // Show dropdown if there are matches
        filtered.forEach(item => {
            const li = document.createElement('li'); // Create a new list item
            li.textContent = item; // Set the text content to the medicine name
            li.addEventListener('click', () => {
                input.value = item; // Set the input value to the selected medicine
                dropdown.style.display = 'none'; // Hide the dropdown
            });
            dropdown.appendChild(li); // Append the list item to the dropdown
        });
    } else {
        dropdown.style.display = 'none'; // Hide dropdown if no matches are found
    }
}

// Initialize the script when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchMedicines(); // Fetch medicines from the server

    const input = document.getElementById('medicine'); // Get the input element
    input.addEventListener('input', () => filterDropdown(input)); // Attach event listener for filtering
});
