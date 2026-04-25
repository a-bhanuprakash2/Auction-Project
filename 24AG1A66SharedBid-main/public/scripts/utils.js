
// Utility Functions

// Format currency
function formatCurrency(amount) {
  return '$' + amount.toLocaleString();
}

// Format date to relative time (1 hour ago, 2 days ago, etc.)
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
}

// Calculate time remaining
function formatTimeRemaining(endTimeString) {
  const endTime = new Date(endTimeString);
  const now = new Date();
  
  if (endTime <= now) {
    return 'Ended';
  }
  
  const diffInSeconds = Math.floor((endTime - now) / 1000);
  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else {
    return `${minutes}m left`;
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  // Check if toast container exists
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Create product card HTML
function createProductCard(product) {
  const isExpired = new Date(product.endTime) < new Date();
  const hasCollaborativeBidding = !!product.collaborativeBidding;
  
  const cardHtml = `
    <div class="product-card" data-id="${product.id}">
      <div style="position: relative;">
        <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
        ${product.status === 'sold' ? '<span class="badge badge-danger" style="position: absolute; top: 10px; right: 10px;">Sold</span>' : ''}
        ${hasCollaborativeBidding ? '<span class="badge badge-primary" style="position: absolute; top: 10px; left: 10px;">Collaborative</span>' : ''}
      </div>
      
      <div class="product-content">
        <div class="product-header">
          <h3 class="product-title">${product.title}</h3>
          <span class="product-price">${formatCurrency(product.currentBid)}</span>
        </div>
        
        <div class="product-info">
          <span>Base: ${formatCurrency(product.basePrice)}</span>
          <span>${product.bidsCount} bids</span>
        </div>
        
        <p class="product-description">${product.description}</p>
        
        <div class="product-footer">
          <span class="${isExpired ? 'expired' : 'time-remaining'}">${formatTimeRemaining(product.endTime)}</span>
          
          <div>
            <a href="#/product/${product.id}" class="btn btn-primary btn-sm">View & Bid</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return cardHtml;
}

// Create bid history item HTML
function createBidHistoryItem(bid) {
  return `
    <div class="bid-history-item">
      <div class="bid-info">
        <span class="bidder-name">${bid.bidderName}</span>
        <span class="bid-amount">${formatCurrency(bid.amount)}</span>
      </div>
      <div class="bid-time">${formatRelativeTime(bid.timestamp)}</div>
    </div>
  `;
}

// Create modal/dialog
function createModal(id, title, content, onSubmit = null) {
  // Create the modal elements
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'dialog-overlay';
  modal.style.display = 'none';
  
  const dialogContent = `
    <div class="dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">${title}</h2>
      </div>
      <div class="dialog-body">
        ${content}
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline modal-cancel">Cancel</button>
        <button class="btn btn-primary modal-submit">Submit</button>
      </div>
    </div>
  `;
  
  modal.innerHTML = dialogContent;
  
  // Add event listeners
  modal.querySelector('.modal-cancel').addEventListener('click', () => {
    closeModal(id);
  });
  
  if (onSubmit) {
    modal.querySelector('.modal-submit').addEventListener('click', onSubmit);
  }
  
  // Add to DOM
  document.body.appendChild(modal);
  
  return modal;
}

// Open modal
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Create stat card HTML
function createStatCard(title, value, description) {
  return `
    <div class="stat-card">
      <div class="stat-value">${value}</div>
      <div class="stat-title">${title}</div>
      ${description ? `<div class="stat-description">${description}</div>` : ''}
    </div>
  `;
}
