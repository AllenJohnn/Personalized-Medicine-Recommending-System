document.addEventListener("DOMContentLoaded", function() {
    const medicineItems = document.querySelectorAll('.medicine-item');
    
    medicineItems.forEach(item => {
        item.addEventListener('click', function() {
            const medicineName = item.getAttribute('data-text');
            showMedicineOptions(medicineName);
        });
    });

    function showMedicineOptions(medicine) {
        const modal = createModal(medicine);
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Close the modal when clicking outside of the modal content
        modal.addEventListener('click', function(e) {
            if (!modal.querySelector('.modal-content').contains(e.target)) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    function createModal(medicine) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        
        const content = `
            <div class="modal-content">
                <h2>Options for: ${medicine}</h2>
                <button class="close-btn">&times;</button>
                <ul>
                    <li><a href="https://www.google.com/search?q=${encodeURIComponent(medicine)}" target="_blank">Search Google</a></li>
                    <li><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(medicine)}" target="_blank">Watch Videos</a></li>
                </ul>
            </div>
        `;
        
        modal.innerHTML = content;
        
        // Close the modal when clicking the close button
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        return modal;
    }
});
