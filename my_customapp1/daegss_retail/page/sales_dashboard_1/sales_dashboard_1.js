frappe.pages['sales-dashboard-1'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Sales Dashboard',
		single_column: true
	});

	page.main.append(`
        <div class="container-fluid broiler-batch-summary">
            <!-- Page Header -->

			<div class="page-header row mb-4">
				<div class="col-md-6">
					<h1 class="page-title">Sales Dashboard</h1>
				</div>
				<div class="col-md-6 text-right">
					<div class="btn-group print-export-options">
						<input type="date" id="date-picker" class="form-control mr-2" />
						<button id="print-page" class="btn btn-outline-secondary">
							<i class="fa fa-print"></i> Print
						</button>
					</div>
				</div>
			</div>

			 <!-- Performance Tiles Section -->
            <div class="section performance-tiles mb-4">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Performance Metrics</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <div class="tile tile-placed-qty">
                                    <span>Order Today</span>
                                    <div class="tile-value" id="placed-quantity">0</div>
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <div class="tile tile-live-qty">
                                    <span>Order Value Today</span>
                                    <div class="tile-value" id="live-quantity">0</div>
                                </div>
                            </div>
							 <div class="col-md-3 mb-3">
                                <div class="tile tile-live-qty">
                                    <span>Order This Week</span>
                                    <div class="tile-value" id="live-quantity2">0</div>
                                </div>
                            </div>
							 <div class="col-md-3 mb-3">
                                <div class="tile tile-live-qty">
                                    <span>Order Value This Week</span>
                                    <div class="tile-value" id="live-quantity3">0</div>
                                </div>
                            </div>
                            
                        </div>
                        
                    </div>
                </div>
            </div>


           <!-- Top 5 Fast Moving Items Section -->
			<div class="section daily-transactions mb-4">
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">Top 5 Selling Item</h3>
					</div>
					<div class="card-body">
						<div class="table-responsive">
							<table id="fast-moving-table" class="table table-striped">
								<thead>
									<tr>
										<th>Date</th>
										<th>Item Number</th>
										<th>Item Name</th>
										<th>Total Order</th>
										<th>Total Quantity</th>
										<th>Total Amount</th>
										
									</tr>
								</thead>
								<tbody id="fast-moving-body">
									<!-- Fast moving items will be dynamically populated -->
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<!-- Pending Inward Section -->
			<div class="section pending-inward mb-4">
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">Pending Inward</h3>
					</div>
					<div class="card-body">
						<div class="table-responsive">
							<table id="pending-inward-table" class="table table-bordered">
								<thead>
									<tr>
										<th>DEMAND ID</th>
										<th>DEMAND DATE</th>
										<th>ITEM COUNT</th>
										<th>STATUS</th>
										<th>DUE DATE</th>
										<th>RECEIVED DATE</th>
									</tr>
								</thead>
								<tbody id="pending-inward-body">
									<!-- Pending Inward data will be dynamically populated -->
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>


		

        </div>

        <style>
            .tile span {
                font-weight: var(--weight-medium);
                color: var(--text-muted);
                text-transform: uppercase;
                font-size: var(--text-tiny);
                margin-top: var(--margin-xs);
            }

           .card-body {
                justify-content: center;  /* Centers content horizontally */
                align-items: center;      /* Centers content vertically */
                height: 100%;             /* Ensures that the container has a defined height */
            }

            
            /* Performance Tiles Styling */
            .tile {
                border: 1px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                min-height: 84px;
                padding: var(--number-card-padding);
            }

            .tile-value {
                font-size: var(--text-2xl);
                font-weight: var(--weight-semibold);
                letter-spacing: 0.01em;
                line-height: var(--text-line-height-3xl);
                color: var(--text-color);
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                padding-top: var(--padding-md);
            }

            /* Responsive Adjustments */
            @media (max-width: 768px) {
                .tile {
                    margin-bottom: 15px;
                }
            }

            /* Print Styles */
            @media print {
                .print-export-options {
                    display: none;
                }
                .card {
                    border: 1px solid #ddd;
                }
                .row {
                    display: flex;
                }
            }
        </style>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.5/xlsx.full.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>

    `);

	$(document).ready(function () {

		const today = new Date().toISOString().split("T")[0];
		$('#date-picker').val(""); // Don't preselect today, keep it empty

		// Clear date input on page load
		$('#date-picker').val('');

		// Load all data by default
		fetchBatchData();

		fetchBatchData2();

		// Trigger fetch on date change
		$('#date-picker').on('change', function () {
			const selectedDate = $(this).val();
			if (selectedDate) {
				fetchBatchData(selectedDate);
				fetchBatchData2(selectedDate);
			}
		});

		// Export Functionality
		$('#print-page').on('click', () => window.print());

		$('#download-pdf').on('click', generatePDF);
		$('#download-excel').on('click', generateExcel);


	});

	// ✅ This runs EVERY TIME the user opens or returns to the page
	frappe.pages['sales-dashboard-1'].on_page_show = function () {
		$('#date-picker').val(''); // Clear selected date
		fetchBatchData(selectedDate = null);               // Load default data
		fetchBatchData2(selectedDate = null); 
	};

	// Fetch Batch Data
	function fetchBatchData(selectedDate) {
		frappe.call({
			method: "my_customapp1.daegss_retail.page.sales_dashboard_1.sales_dashboard_1.get_batch_summary_data",
			args: {
				date: selectedDate // pass selected date or null
			},
			callback: function (response) {
				const data = response.message;
				const tableBody = $('#fast-moving-body');
				tableBody.empty(); // Clear previous data
				// Populate Daily Transactions
				// Update Performance Tiles

				if (
					data.top_items.length === 0 &&
					data.invoice_summary.total_invoices === 0 &&
					data.invoice_summary.total_amount === null
				) {
					tableBody.append(`
						<tr>
							<td colspan="6" class="text-center">No data available</td>
						</tr>
					`);
					updatePerformanceTiles(data.invoice_summary || {});
					return;
				}
				updatePerformanceTiles(data.invoice_summary || {});
				populateDailyTransactions(data.top_items || []);
			}
		});
	}

	// Fetch Batch Data
	function fetchBatchData2(selectedDate) {
		frappe.call({
			method: "my_customapp1.daegss_retail.page.sales_dashboard_1.sales_dashboard_1.get_inward_data",
			args: {
				date: selectedDate // pass selected date or null
			},
			callback: function (response) {
				const data = response.message;
				const tableBody = $('#pending-inward-body');
				tableBody.empty(); // Clear previous data
				// Populate Daily Transactions
				// Update Performance Tiles

				if (data.length === 0) {
					tableBody.append(`
						<tr>
							<td colspan="6" class="text-center">No data available</td>
						</tr>
					`);
				
					return;
				}
			
				populateDailyTransactions2(data || []);
			}
		});
	}

	// Update Performance Tiles
	function updatePerformanceTiles(data) {


		$('#placed-quantity').text(data.total_invoices || 0);
		$('#live-quantity').text(data.total_amount || 0);

	}


	// Populate Daily Transactions
	function populateDailyTransactions(transactions) {
		const transactionBody = $('#fast-moving-body');
		transactionBody.empty();

		transactions.forEach(transaction => {
			transactionBody.append(`
				<tr>
					<td>${transaction.date}</td>
					<td>${transaction.item_code}</td>
					<td>${transaction.item_name}</td>
					<td>${transaction.total_orders}</td>
					<td>${transaction.total_qty}</td>
					<td>${transaction.total_amount.toFixed(2)}</td>
					
				</tr>
			`);
		});
	}

	// Populate Daily Transactions
	function populateDailyTransactions2(transactions) {
		const transactionBody = $('#pending-inward-body');
		transactionBody.empty();

		transactions.forEach(transaction => {
			transactionBody.append(`
				<tr>
					<td>${transaction.demand_id}</td>
					<td>${transaction.demand_date}</td>
					<td>${transaction.item_count}</td>
					<td>${transaction.status}</td>
					<td>${transaction.due_date}</td>
					<td>${transaction.received_date}</td>
					
				</tr>
			`);
		});
	}
}