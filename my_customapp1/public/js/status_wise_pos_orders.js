// Remove the DOMContentLoaded event listener - not needed in Frappe
console.log('[Init] Initializing Status Wise POS Orders module');

// Ensure the Frappe pages object is ready
if (!frappe.pages['statuswise-pos-order']) {
    frappe.pages['statuswise-pos-order'] = {};
}

frappe.pages['statuswise-pos-order'].on_page_load = function (wrapper) {
    console.log('[Page Load] Initializing Status Wise POS Orders page');

    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Status Wise POS Orders',
        single_column: true
    });

    $(page.body).html(`
        <div class="filters" style="margin-bottom: 1rem;">
            <button class="btn btn-primary btn-sm" id="load-pos-btn">🔁 Load POS Orders</button>
            <button class="btn btn-outline-primary btn-sm" id="load-external-btn">🌐 Load External Orders</button>
        </div>
        <div id="pos-orders-container"></div>
    `);

    // Use jQuery event handlers instead of direct onclick
    $(page.body).find('#load-pos-btn').on('click', function () {
        console.log('[UI] Load POS Orders button clicked');
        loadPOSOrders();
    });

    $(page.body).find('#load-external-btn').on('click', function () {
        console.log('[UI] Load External Orders button clicked');
        loadExternalOrders();
    });

    console.log('[Auto Load] Loading POS Orders by default');
    loadPOSOrders(); // load POS by default
};

// Also add on_page_show to handle navigation from other pages
frappe.pages['statuswise-pos-order'].on_page_show = function (wrapper) {
    console.log('[Page Show] Status Wise POS Orders page shown');
    // You can add any refresh logic here if needed
};

async function loadPOSOrders() {
    const container = document.getElementById('pos-orders-container');
    if (!container) {
        console.error('[POS Orders] Container not found');
        return;
    }

    container.innerHTML = '<p>Loading POS orders...</p>';
    console.log('[POS Orders] Fetching POS orders...');

    try {
        const res = await frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'POS Invoice',
                fields: ['name', 'customer', 'rounded_total', 'status'],
                filters: [
                    ['status', 'in', ['Draft', 'Paid', 'In Progress', 'Ready for Delivery', 'Delivered']],
                    ['is_pos', '=', 1]
                ],
                order_by: 'creation desc',
                limit_page_length: 100
            }
        });

        console.log('[POS Orders] Fetched successfully:', res.message);
        renderOrders(res.message, 'POS');
    } catch (e) {
        console.error('[POS Orders] Error loading POS orders:', e);
        container.innerHTML = '<p class="text-danger">Error loading POS orders</p>';
    }
}

async function loadExternalOrders() {
    const container = document.getElementById('pos-orders-container');
    if (!container) {
        console.error('[External Orders] Container not found');
        return;
    }

    container.innerHTML = '<p>Loading external orders...</p>';
    console.log('[External Orders] Fetching external orders...');

    try {
        const response = await fetch('https://your.api.com/orders'); // Update with your endpoint
        const data = await response.json();
        console.log('[External Orders] Data received:', data);
        renderOrders(data, 'External');
    } catch (e) {
        console.error('[External Orders] Error loading external orders:', e);
        container.innerHTML = '<p class="text-danger">Error loading external orders</p>';
    }
}

function renderOrders(data, sourceLabel) {
    console.log(`[Render Orders] Rendering ${data?.length || 0} ${sourceLabel} orders`);

    const container = document.getElementById('pos-orders-container');
    if (!container) {
        console.error('[Render Orders] Container not found');
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = `<p>No ${sourceLabel} orders found.</p>`;
        console.warn(`[Render Orders] No ${sourceLabel} orders found`);
        return;
    }

    container.innerHTML = '';
    data.forEach((order, idx) => {
        console.log(`[Render Orders] Rendering order ${idx + 1}:`, order);

        const div = document.createElement('div');
        div.className = 'pos-order-card';
        div.innerHTML = `
            <div class="flex space-between">
                <strong>${order.name}</strong>
                <span class="tag ${sourceLabel === 'POS' ? 'pos-tag' : 'external-tag'}">${order.status}</span>
            </div>
            <div>${order.customer}</div>
            <div><strong>₹${Number(order.rounded_total || 0).toFixed(2)}</strong> <span class="badge badge-light">${sourceLabel}</span></div>
        `;
        container.appendChild(div);
    });

    console.log(`[Render Orders] Done rendering ${sourceLabel} orders`);
}