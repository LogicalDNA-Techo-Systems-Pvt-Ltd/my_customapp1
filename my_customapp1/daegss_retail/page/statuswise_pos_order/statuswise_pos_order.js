const ORDER_STATUSES = ['Draft', 'Paid', 'In Progress', 'Ready for Delivery', 'Delivered'];
console.log('✅ Enhanced POS Workflow Page script loaded');

frappe.pages['statuswise-pos-order'].on_page_load = function (wrapper) {
	console.log('[Page Load] Status Wise POS Orders page initializing');

	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Status Wise POS Orders',
		single_column: true
	});

	// Add refresh functionality to the page
	page.set_primary_action(__('Refresh'), () => {
		loadPOSOrders();
	}, 'fa fa-refresh');

	// Add secondary action for new POS order
	page.add_action_item(__('New POS Order'), () => {
		frappe.set_route('point-of-sale');
	}, 'fa fa-plus');

	// Add bulk actions
	page.add_action_item(__('Bulk Status Update'), () => {
		showBulkUpdateDialog();
	}, 'fa fa-edit');

	$(page.body).html(`
        <div class="filters" style="margin-bottom: 1rem;">
            <div class="row">
                <div class="col-md-6">
                    <button class="btn btn-primary btn-sm" id="load-pos-btn">
                        <i class="fa fa-refresh"></i> Load POS Orders
                    </button>
                    <button class="btn btn-outline-primary btn-sm" id="load-external-btn">
                        <i class="fa fa-globe"></i> Load External Orders
                    </button>
                </div>
                <div class="col-md-6 text-right">
                    <div class="form-group d-inline-block mr-2">
                        <input type="date" class="form-control form-control-sm d-inline-block" 
                               id="date-filter" style="width: auto;">
                    </div>
                    <div class="form-group d-inline-block">
                        <select class="form-control form-control-sm d-inline-block" 
                                id="customer-filter" style="width: auto;">
                            <option value="">All Customers</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Status Summary Cards -->
        <div class="row mb-3" id="status-summary">
            <!-- Summary cards will be populated here -->
        </div>
        
        <div id="pos-orders-container">
            <div class="text-center py-5">
                <i class="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted">Click "Load POS Orders" to view orders</p>
            </div>
        </div>
    `);

	// Event listeners
	document.getElementById('load-pos-btn').onclick = () => {
		console.log('[UI] Load POS Orders button clicked');
		loadPOSOrders();
	};

	document.getElementById('load-external-btn').onclick = () => {
		console.log('[UI] Load External Orders button clicked');
		loadExternalOrders();
	};

	// Filter event listeners
	document.getElementById('date-filter').onchange = () => {
		if (window.currentOrderData) {
			renderOrders(window.currentOrderData, window.currentOrderSource);
		}
	};

	document.getElementById('customer-filter').onchange = () => {
		if (window.currentOrderData) {
			renderOrders(window.currentOrderData, window.currentOrderSource);
		}
	};

	// Auto-refresh every 30 seconds
	setInterval(() => {
		if (window.currentOrderSource === 'POS') {
			loadPOSOrders(true); // Silent refresh
		}
	}, 30000);

	// Load customers for filter
	loadCustomers();

	// Auto-load POS orders
	setTimeout(() => loadPOSOrders(), 100);
};

async function loadCustomers() {
	try {
		const res = await frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Customer',
				fields: ['name', 'customer_name'],
				order_by: 'customer_name asc',
				limit_page_length: 500
			}
		});

		const customerSelect = document.getElementById('customer-filter');
		if (customerSelect && res.message) {
			res.message.forEach(customer => {
				const option = document.createElement('option');
				option.value = customer.name;
				option.textContent = customer.customer_name || customer.name;
				customerSelect.appendChild(option);
			});
		}
	} catch (e) {
		console.error('[Customers] Error loading customers:', e);
	}
}

async function loadPOSOrders(silent = false) {
	const container = document.getElementById('pos-orders-container');

	if (!silent) {
		showLoading(container, 'Loading POS orders...');
	}

	console.log('[POS Orders] Fetching POS orders...');

	try {
		// Use the custom server method for better filtering
		const dateFilter = document.getElementById('date-filter').value;
		const customerFilter = document.getElementById('customer-filter').value;

		const res = await frappe.call({
			method: 'my_customapp1.pos_workflow.get_pos_orders_by_status',
			args: {
				date_filter: dateFilter || null,
				customer_filter: customerFilter || null
			}
		});

		console.log('[POS Orders] Fetched successfully:', res.message?.length || 0, 'orders');

		// Store data globally for filtering
		window.currentOrderData = res.message || [];
		window.currentOrderSource = 'POS';

		renderOrders(res.message || [], 'POS');
		// renderStatusSummary(res.message || []);

	} catch (e) {
		console.error('[POS Orders] Error loading POS orders:', e);
		if (!silent) {
			showError(container, 'Error loading POS orders: ' + (e.message || 'Unknown error'));
		}
	}
}

async function loadExternalOrders() {
	const container = document.getElementById('pos-orders-container');
	showLoading(container, 'Loading external orders...');
	console.log('[External Orders] Fetching external orders...');

	try {
		const apiEndpoint = frappe.boot.external_orders_api || 'https://api.example.com/orders';

		const response = await fetch(apiEndpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		console.log('[External Orders] Data received:', data?.length || 0, 'orders');

		window.currentOrderData = data || [];
		window.currentOrderSource = 'External';

		renderOrders(data || [], 'External');
		renderStatusSummary(data || []);

	} catch (e) {
		console.error('[External Orders] Error loading external orders:', e);
		showError(container, 'Error loading external orders: ' + (e.message || 'Network error'));
	}
}

function renderStatusSummary(data) {
	const summaryContainer = document.getElementById('status-summary');
	let html = '';

	// Count orders by status
	const statusCounts = {};
	ORDER_STATUSES.forEach(status => {
		statusCounts[status] = data.filter(order => order.status === status).length;
	});

	// Total orders and revenue
	const totalOrders = data.length;
	const totalRevenue = data.reduce((sum, order) => sum + (parseFloat(order.grand_total) || 0), 0);

	// Create summary cards
	html += `
		<div class="col-md-2">
			<div class="card bg-primary text-white">
				<div class="card-body text-center py-2">
					<h4 class="mb-1 text-white">${totalOrders}</h4>
					<small>Total Orders</small>
				</div>
			</div>
		</div>
		<div class="col-md-2">
			<div class="card bg-success text-white">
				<div class="card-body text-center py-2">
					<h4 class="mb-1 text-white">₹${totalRevenue.toFixed(0)}</h4>
					<small>Total Revenue</small>
				</div>
			</div>
		</div>
	`;

	// Add status-specific cards for key statuses
	const keyStatuses = ['Paid', 'In Progress', 'Ready for Delivery'];
	keyStatuses.forEach(status => {
		const count = statusCounts[status];
		const cardClass = getStatusCardClass(status);

		html += `
			<div class="col-md-2">
				<div class="card ${cardClass}">
					<div class="card-body text-center py-2">
						<h4 class="mb-1 text-white">${count}</h4>
						<small>${status}</small>
					</div>
				</div>
			</div>
		`;
	});

	summaryContainer.innerHTML = html;
}

function getStatusCardClass(status) {
	const cardClasses = {
		'Paid': 'bg-info text-white',
		'In Progress': 'bg-warning text-dark',
		'Ready for Delivery': 'bg-primary text-white'
	};
	return cardClasses[status] || 'bg-light';
}

function showLoading(container, message) {
	container.innerHTML = `
		<div class="text-center py-5">
			<div class="spinner-border text-primary" role="status">
				<span class="sr-only">Loading...</span>
			</div>
			<p class="mt-3 text-muted">${message}</p>
		</div>
	`;
}

function showError(container, message) {
	container.innerHTML = `
		<div class="alert alert-danger" role="alert">
			<i class="fa fa-exclamation-triangle"></i> ${message}
		</div>
	`;
}

function renderOrders(data, sourceLabel) {
	console.log(`[Render Orders] Rendering ${data?.length || 0} ${sourceLabel} orders`);

	const container = document.getElementById('pos-orders-container');
	if (!data || !data.length) {
		container.innerHTML = `
			<div class="alert alert-info text-center" role="alert">
				<i class="fa fa-info-circle fa-2x mb-2"></i>
				<p class="mb-0">No ${sourceLabel} orders found.</p>
			</div>
		`;
		return;
	}

	const filteredData = applyFilters(data);
	const statusCount = ORDER_STATUSES.length;

	let html = `
		<div class="d-flex flex-wrap justify-content-start" style="gap: 1rem;">
	`;

	// Create status columns with drag-and-drop support
	ORDER_STATUSES.forEach(status => {
		const statusOrders = filteredData.filter(order => order.status === status);
		const statusClass = getStatusClass(status);

		html += `
			<div class="flex-grow-1" 
				 style="min-width: calc(100% / ${statusCount} - 1rem); max-width: calc(100% / ${statusCount} - 1rem);">
				<div class="card h-100">
					<div class="card-header text-center py-2">
						<strong>${status}</strong>
						<span class="badge badge-dark ml-2">${statusOrders.length}</span>
					</div>
					<div class="card-body p-2 kanban-column" 
						 id="kanban-${status.replace(/\s+/g, '-')}" 
						 data-status="${status}"
						 style="min-height: 200px; max-height: 600px; overflow-y: auto;"
						 ondrop="dropOrder(event)" 
						 ondragover="allowDrop(event)">
					</div>
				</div>
			</div>
		`;
	});

	html += '</div>';
	container.innerHTML = html;

	// Render order cards
	filteredData.forEach(order => {
		const card = createOrderCard(order, sourceLabel);
		const columnId = `kanban-${order.status.replace(/\s+/g, '-')}`;
		const column = document.getElementById(columnId);
		if (column) {
			column.appendChild(card);
		}
	});
}


function applyFilters(data) {
	let filtered = [...data];

	const customerFilter = document.getElementById('customer-filter').value;
	if (customerFilter) {
		filtered = filtered.filter(order => order.customer === customerFilter);
	}

	return filtered;
}

function getStatusClass(status) {
	const statusClasses = {
		'Draft': 'bg-secondary text-white',
		'Paid': 'bg-success text-white',
		'In Progress': 'bg-warning text-dark',
		'Ready for Delivery': 'bg-info text-white',
		'Delivered': 'bg-primary text-white'
	};
	return statusClasses[status] || 'bg-light';
}

function createOrderCard(order, sourceLabel) {
	const card = document.createElement('div');
	card.className = 'kanban-card border rounded p-2 mb-2 bg-white shadow-sm';
	card.draggable = sourceLabel === 'POS'; // Only POS orders can be dragged
	card.dataset.orderId = order.name;
	card.dataset.currentStatus = order.status;

	const customerName = order.customer_name || order.customer || 'Walk-in Customer';
	const amount = Number(order.rounded_total || order.grand_total || 0).toFixed(2);
	const date = order.posting_date ? frappe.datetime.str_to_user(order.posting_date) : '';

	// Add status update buttons for POS orders
	let statusButtons = '';
	if (sourceLabel === 'POS') {
		const allowedTransitions = getNextStatuses(order.status);
		if (allowedTransitions.length > 0) {
			statusButtons = `
				<div class="mt-2 text-center">
					${allowedTransitions.map(status =>
				`<button class="btn btn-sm btn-outline-primary mx-1" 
						         onclick="updateOrderStatus('${order.name}', '${status}', event)">
							${getStatusIcon(status)} Mark as ${status}
						</button>`
			).join('')}
				</div>
			`;
		}
	}

	card.innerHTML = `
		<div class="d-flex justify-content-between align-items-start mb-1">
			<strong class="text-primary">${order.name}</strong>
			<span class="badge badge-outline-secondary">${sourceLabel}</span>
		</div>
		<div class="text-muted small">${customerName}</div>
		<div class="font-weight-bold text-success">₹${amount}</div>
		${date ? `<div class="text-muted small">${date}</div>` : ''}
		${order.owner ? `<div class="text-muted small">By: ${order.owner}</div>` : ''}
		${statusButtons}
	`;

	// Add click handler for card details
	card.onclick = (e) => {
		// Don't trigger if clicking on buttons
		if (e.target.tagName !== 'BUTTON') {
			handleOrderClick(order, sourceLabel);
		}
	};

	// Add drag event handlers for POS orders
	if (sourceLabel === 'POS') {
		card.ondragstart = (e) => {
			e.dataTransfer.setData('text/plain', JSON.stringify({
				orderId: order.name,
				currentStatus: order.status
			}));
		};
	}

	// Add hover effect
	card.onmouseenter = () => card.classList.add('shadow');
	card.onmouseleave = () => card.classList.remove('shadow');

	return card;
}

function getNextStatuses(currentStatus) {
	const workflow = {
		'Draft': ['Paid'],
		'Paid': ['In Progress'],
		'In Progress': ['Ready for Delivery'],
		'Ready for Delivery': ['Delivered'],
		'Delivered': []
	};
	return workflow[currentStatus] || [];
}

function getStatusIcon(status) {
	const icons = {
		'Paid': '💳',
		'In Progress': '🔄',
		'Ready for Delivery': '📦',
		'Delivered': '✅'
	};
	return icons[status] || '▶️';
}

// Drag and Drop Functions
function allowDrop(ev) {
	ev.preventDefault();
}

function dropOrder(ev) {
	ev.preventDefault();
	const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
	const targetColumn = ev.currentTarget;
	const targetStatus = targetColumn.dataset.status;

	if (data.currentStatus !== targetStatus) {
		updateOrderStatus(data.orderId, targetStatus);
	}
}

async function updateOrderStatus(orderId, newStatus, event = null) {
	if (event) {
		event.stopPropagation();
		event.preventDefault();
	}

	try {
		const result = await frappe.call({
			method: 'my_customapp1.pos_workflow.update_order_status',
			args: {
				pos_invoice_name: orderId,
				new_status: newStatus
			}
		});

		if (result.message.success) {
			frappe.show_alert({
				message: `Order ${orderId} updated to ${newStatus}`,
				indicator: 'green'
			});

			// Refresh the orders
			loadPOSOrders();
		} else {
			frappe.show_alert({
				message: result.message.message,
				indicator: 'red'
			});
		}
	} catch (error) {
		console.error('Error updating order status:', error);
		frappe.show_alert({
			message: 'Error updating order status',
			indicator: 'red'
		});
	}
}

function handleOrderClick(order, sourceLabel) {
	console.log('[Order Click] Opening order:', order.name, 'Status:', order.status);

	if (sourceLabel === 'POS') {
		if (order.status === 'Draft') {
			frappe.route_options = { pos_invoice: order.name };
			frappe.set_route('point-of-sale');
		} else {
			frappe.set_route('Form', 'POS Invoice', order.name);
		}
	} else {
		showExternalOrderDialog(order);
	}
}

function showExternalOrderDialog(order) {
	const dialog = new frappe.ui.Dialog({
		title: `External Order: ${order.name}`,
		fields: [
			{
				fieldtype: 'HTML',
				fieldname: 'order_details',
				options: `
					<div class="order-details">
						<p><strong>Customer:</strong> ${order.customer || 'N/A'}</p>
						<p><strong>Amount:</strong> ₹${Number(order.rounded_total || 0).toFixed(2)}</p>
						<p><strong>Status:</strong> <span class="badge badge-primary">${order.status}</span></p>
						<p><strong>Date:</strong> ${order.posting_date || 'N/A'}</p>
					</div>
				`
			}
		],
		primary_action_label: 'Close',
		primary_action: () => dialog.hide()
	});
	dialog.show();
}

function showBulkUpdateDialog() {
	const dialog = new frappe.ui.Dialog({
		title: 'Bulk Status Update',
		fields: [
			{
				fieldtype: 'HTML',
				fieldname: 'instructions',
				options: '<p class="text-muted">Select orders from the kanban board and update their status in bulk.</p>'
			},
			{
				fieldtype: 'Select',
				fieldname: 'target_status',
				label: 'Target Status',
				options: ORDER_STATUSES.join('\n'),
				reqd: 1
			},
			{
				fieldtype: 'Small Text',
				fieldname: 'remarks',
				label: 'Remarks (Optional)'
			}
		],
		primary_action_label: 'Update Selected Orders',
		primary_action: (values) => {
			const selectedOrders = getSelectedOrders();
			if (selectedOrders.length === 0) {
				frappe.msgprint('Please select at least one order');
				return;
			}

			bulkUpdateOrders(selectedOrders, values.target_status, values.remarks);
			dialog.hide();
		}
	});

	dialog.show();
}

function getSelectedOrders() {
	// This would integrate with a selection mechanism
	// For now, return empty array - implement selection UI as needed
	return [];
}

async function bulkUpdateOrders(orderIds, targetStatus, remarks) {
	try {
		const result = await frappe.call({
			method: 'my_customapp1.pos_workflow.bulk_update_status',
			args: {
				invoice_names: orderIds,
				new_status: targetStatus
			}
		});

		frappe.show_alert({
			message: `Updated ${orderIds.length} orders to ${targetStatus}`,
			indicator: 'green'
		});

		loadPOSOrders();
	} catch (error) {
		console.error('Error in bulk update:', error);
		frappe.show_alert({
			message: 'Error updating orders',
			indicator: 'red'
		});
	}
}

// Add custom styles
frappe.require([], () => {
	const style = document.createElement('style');
	style.textContent = `
		.kanban-card {
			transition: all 0.2s ease;
			cursor: pointer;
		}
		.kanban-card:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
		}
		.kanban-card[draggable="true"]:hover {
			cursor: grab;
		}
		.kanban-card[draggable="true"]:active {
			cursor: grabbing;
		}
		.kanban-column {
			background-color: #f8f9fa;
			border-radius: 8px;
			transition: background-color 0.2s ease;
		}
		.kanban-column:hover {
			background-color: #e9ecef;
		}
		.kanban-column.drag-over {
			background-color: #d1ecf1;
			border: 2px dashed #bee5eb;
		}
		.kanban-column:empty::after {
			content: 'No orders';
			display: block;
			text-align: center;
			color: #6c757d;
			padding: 20px;
			font-style: italic;
		}
		.badge-outline-secondary {
			color: #6c757d;
			border: 1px solid #6c757d;
			background: transparent;
		}
		#pos-orders-container .alert {
			border: none;
			border-radius: 8px;
		}
		.status-button {
			transition: all 0.2s ease;
		}
		.status-button:hover {
			transform: scale(1.05);
		}
		.order-card-selected {
			border: 2px solid #007bff !important;
			background-color: #f0f8ff !important;
		}
		.summary-card {
			transition: transform 0.2s ease;
		}
		.summary-card:hover {
			transform: translateY(-2px);
		}
	`;
	document.head.appendChild(style);
});