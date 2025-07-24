console.log("[Custom POS] Injecting custom menu item...");

function addCustomMenuItem() {
    const dropdownMenu = document.querySelector('ul.dropdown-menu.dropdown-menu-right');
    if (!dropdownMenu) {
        console.log("[Custom POS] Dropdown not present yet.");
        return;
    }

    // Check if already added
    if (document.querySelector('#statuswise-pos-order-menu-item')) {
        console.log("[Custom POS] Already added, skipping.");
        return;
    }

    // Find the 'Toggle Recent Orders' item
    const toggleRecentOrdersLi = Array.from(dropdownMenu.children).find(li => {
        const label = li.querySelector('.menu-item-label');
        return label && decodeURIComponent(label.getAttribute('data-label') || '') === "Toggle Recent Orders";
    });

    if (!toggleRecentOrdersLi) {
        console.log("[Custom POS] 'Toggle Recent Orders' not yet found.");
        return;
    }

    // Create custom item
    const newLi = document.createElement('li');
    newLi.classList.add('user-action');
    newLi.id = 'statuswise-pos-order-menu-item';

    const newLink = document.createElement('a');
    newLink.classList.add('grey-link', 'dropdown-item');
    newLink.href = '/app/statuswise-pos-order';
    newLink.target = '_blank';
    newLink.rel = 'noopener noreferrer';
    newLink.innerHTML = `
        <span class="menu-item-label" data-label="Status Wise POS Orders">
            <span>🧾 Status Wise POS Orders</span>
        </span>
    `;

    newLi.appendChild(newLink);
    dropdownMenu.insertBefore(newLi, toggleRecentOrdersLi.nextSibling);
    console.log("[Custom POS] Custom menu item injected!");
}

// Observe DOM mutations
function observeDropdownChanges() {
    const observer = new MutationObserver(() => {
        addCustomMenuItem();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    console.log("[Custom POS] MutationObserver set.");
}

// Start watching after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Custom POS] DOM ready. Setting observer...");
    observeDropdownChanges();
});
