
// Main application script

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('SharedBid app initializing...');
  
  // Initialize services
  AuthService.init();
  ProductService.init();
  
  // Setup the router
  Router.init();
  
  // Setup global event listeners
  setupGlobalEvents();
  
  console.log('SharedBid app initialized successfully');
});

function setupGlobalEvents() {
  // Check authentication status and update UI accordingly
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    console.log('User logged in:', currentUser.name);
    // User is logged in, we can modify the navbar or other elements
    const appElement = document.getElementById('app');
    
    // Create navbar if it doesn't exist yet
    if (!document.querySelector('.navbar')) {
      const navbar = createNavbar(currentUser);
      document.body.insertBefore(navbar, appElement);
    }
  } else {
    console.log('No user logged in');
  }
}

function createNavbar(user) {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  
  const container = document.createElement('div');
  container.className = 'container navbar-content';
  
  // Logo
  const logoLink = document.createElement('a');
  logoLink.href = '#/';
  logoLink.className = 'logo';
  
  const logoIcon = document.createElement('div');
  logoIcon.className = 'logo-icon';
  logoIcon.textContent = 'SB';
  
  logoLink.appendChild(logoIcon);
  logoLink.appendChild(document.createTextNode('SharedBid'));
  
  // Navigation links
  const nav = document.createElement('div');
  nav.className = 'nav-links';
  
  if (user) {
    // Home link based on user role
    const homeLink = document.createElement('a');
    homeLink.href = user.role === 'seller' ? '#/seller' : '#/bidder';
    homeLink.textContent = 'Home';
    homeLink.className = 'btn btn-outline';
    nav.appendChild(homeLink);
    
    // Profile/logout dropdown
    const profileButton = document.createElement('button');
    profileButton.className = 'btn btn-outline';
    profileButton.textContent = user.name;
    profileButton.addEventListener('click', () => {
      AuthService.logout();
    });
    nav.appendChild(profileButton);
  } else {
    // Login/register links for logged out users
    const loginLink = document.createElement('a');
    loginLink.href = '#/login';
    loginLink.textContent = 'Login';
    loginLink.className = 'btn btn-outline';
    
    const registerLink = document.createElement('a');
    registerLink.href = '#/register';
    registerLink.textContent = 'Register';
    registerLink.className = 'btn btn-primary';
    
    nav.appendChild(loginLink);
    nav.appendChild(registerLink);
  }
  
  container.appendChild(logoLink);
  container.appendChild(nav);
  navbar.appendChild(container);
  
  return navbar;
}
