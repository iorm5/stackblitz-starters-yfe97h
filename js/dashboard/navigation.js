export function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      showSection(section);
      updateActiveNavItem(item);
    });
  });
}

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const selectedSection = document.getElementById(`${sectionId}Section`);
  if (selectedSection) {
    selectedSection.classList.add('active');
  }
}

function updateActiveNavItem(selectedItem) {
  // Remove active class from all items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to selected item
  selectedItem.classList.add('active');
}