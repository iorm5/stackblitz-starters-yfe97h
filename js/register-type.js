document.addEventListener('DOMContentLoaded', () => {
    initializeTypeSelection();
});

function initializeTypeSelection() {
    const typeCards = document.querySelectorAll('.type-card');
    const backButton = document.querySelector('.back-btn');
    
    // Handle back button
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Handle card selection
    typeCards.forEach(card => {
        const userType = card.dataset.type;
        const button = card.querySelector('.type-btn');
        
        // Handle card click
        card.addEventListener('click', () => {
            window.location.href = `register.html?type=${userType}`;
        });
        
        // Handle button click
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            window.location.href = `register.html?type=${userType}`;
        });
    });
}