
// Authentication Service
const AuthService = {
  // Initial mock users (similar to original app)
  initialUsers: [
    {
      id: '1',
      name: 'John Seller',
      email: 'seller@example.com',
      password: 'password123', // In a real app, passwords would be hashed
      role: 'seller',
      avatar: 'https://i.pravatar.cc/150?u=seller'
    },
    {
      id: '2',
      name: 'Jane Bidder',
      email: 'bidder@example.com',
      password: 'password123',
      role: 'bidder',
      avatar: 'https://i.pravatar.cc/150?u=bidder'
    }
  ],

  // Get all users from localStorage
  getUsers() {
    const savedUsers = localStorage.getItem('auctionUsers');
    return savedUsers ? JSON.parse(savedUsers) : this.initialUsers;
  },

  // Save users to localStorage
  saveUsers(users) {
    localStorage.setItem('auctionUsers', JSON.stringify(users));
  },

  // Initialize users if not already in localStorage
  init() {
    if (!localStorage.getItem('auctionUsers')) {
      this.saveUsers(this.initialUsers);
    }
    
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  },

  // Login method
  login(email, password, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.role === role);
        
        if (user && user.password === password) {
          // Remove password before storing in session
          const { password, ...safeUser } = user;
          localStorage.setItem('currentUser', JSON.stringify(safeUser));
          resolve(safeUser);
        } else {
          reject(new Error('Invalid credentials or user not found'));
        }
      }, 500); // Simulate API delay
    });
  },

  // Register method
  register(name, email, password, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
          reject(new Error('User already exists'));
        } else {
          const newUser = {
            id: `user_${Date.now()}`,
            name,
            email,
            password,
            role,
            avatar: `https://i.pravatar.cc/150?u=${role}`
          };
          
          users.push(newUser);
          this.saveUsers(users);
          
          // Remove password before storing in session
          const { password: _, ...safeUser } = newUser;
          localStorage.setItem('currentUser', JSON.stringify(safeUser));
          resolve(safeUser);
        }
      }, 500); // Simulate API delay
    });
  },

  // Logout method
  logout() {
    localStorage.removeItem('currentUser');
    window.location.hash = '#/login';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('currentUser') !== null;
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  AuthService.init();
});

// Event listeners for auth forms
document.addEventListener('submit', (event) => {
  // Login form handling
  if (event.target.id === 'login-form') {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    AuthService.login(email, password, role)
      .then(user => {
        showToast(`Welcome back, ${user.name}!`, 'success');
        
        // Redirect based on role
        setTimeout(() => {
          window.location.hash = user.role === 'seller' ? '#/seller' : '#/bidder';
        }, 500);
      })
      .catch(error => {
        showToast(error.message, 'error');
      });
  }
  
  // Register form handling
  if (event.target.id === 'register-form') {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    AuthService.register(name, email, password, role)
      .then(user => {
        showToast(`Welcome to SharedBid, ${user.name}!`, 'success');
        
        // Redirect based on role
        setTimeout(() => {
          window.location.hash = user.role === 'seller' ? '#/seller' : '#/bidder';
        }, 500);
      })
      .catch(error => {
        showToast(error.message, 'error');
      });
  }
});

// Auth toggle buttons
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('auth-toggle-btn')) {
    const role = event.target.getAttribute('data-role');
    const roleInput = document.getElementById('role');
    
    if (roleInput) {
      roleInput.value = role;
      
      // Toggle active class
      document.querySelectorAll('.auth-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
    }
  }
});
