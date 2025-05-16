frappe.pages['inventory-dashboard'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Inventory Dashboard',
		single_column: true
	});

	page.main.append(`
        <div class="container-fluid broiler-batch-summary">
            <!-- Page Header -->
            <div class="page-header row mb-4">
                <div class="col-md-6">
                    <h1 class="page-title">Inventory Dashboard</h1>
                </div>
				<div class="col-md-6 text-right">
					 <div class="form-inline print-export-options">
                <label for="from-date" class="mr-2">From Date:</label>
                <input type="date" id="from-date" class="form-control mr-3" />

                <label for="to-date" class="mr-2">To Date:</label>
                <input type="date" id="to-date" class="form-control mr-3" />

                <button id="print-page" class="btn btn-outline-secondary">
                    <i class="fa fa-print"></i> Print
                </button>
            </div>
        		</div>
            </div>
          

           <!-- Top 5 Fast Moving Items Section -->
			<div class="section daily-transactions mb-4">
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">Top 5 Fast Moving Item</h3>
					</div>
					<div class="card-body">
						<div class="table-responsive">
							<table id="fast-moving-table" class="table table-striped">
								<thead>
									<tr>										
										<th>Item Code</th>
										<th>Item Name</th>
										<th>Inward</th>
										<th>Outward</th>
										<th>Balance</th>
									</tr>
								</thead>
								<tbody id="top-5-moving-items">
									<!-- Fast moving items will be dynamically populated -->
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

		<!-- Top 5 Non Moving Items Section -->
		<div class="section daily-transactions mb-4">
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Top 5 Non Moving Item</h3>
				</div>
				<div class="card-body">
					<div class="table-responsive">
						<table id="non-moving-table" class="table table-striped">
							<thead>
								<tr>
								
									<th>Item Code</th>
									<th>Item Name</th>
									<th>Inward</th>
									<th>Outward</th>
									<th>Balance</th>
								</tr>
							</thead>
							<tbody id="non-moving-body">
								<!-- Non-moving items will be dynamically populated -->
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<!-- Inventory Register Section -->
		<div class="section inventory-register mb-4">
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Inventory Register</h3>
				</div>
				<div class="card-body">
					<div class="table-responsive">
						<table id="inventory-register-table" class="table table-striped">
							<thead>
								<tr>										
									<th>Item Code</th>
									<th>Item Name</th>
									<th>Inward</th>
									<th>Outward</th>
									<th>Balance</th>
								</tr>
							</thead>
							<tbody id="inventory-register-body">
								<!-- Inventory register data will be dynamically populated -->
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

		fetchBatchData3();

		// Trigger fetch on either date change
		$('#from-date, #to-date').on('change', function () {
			const fromDate = $('#from-date').val();
			const toDate = $('#to-date').val();

			if (fromDate && toDate) {
				fetchBatchData(fromDate, toDate);
				fetchBatchData2(fromDate, toDate);
				fetchBatchData3(fromDate, toDate);
			}
		});


		// Export Functionality
		$('#print-page').on('click', () => window.print());

		$('#download-pdf').on('click', generatePDF);
		$('#download-excel').on('click', generateExcel);


	});

	// Fetch Batch Data
	function fetchBatchData(fromDate, toDate) {
		frappe.call({
			method: "my_customapp1.daegss_retail.page.inventory_dashboard.inventory_dashboard.get_top_5_moving_items",
			args: {
				from_date: fromDate,
				to_date: toDate
			},
			callback: function (response) {
				const data = response.message;
				const tableBody = $('#top-5-moving-items');
				tableBody.empty();
				// Populate Daily Transactions
				populateDailyTransactions(data);
			}
		});
	}

	// Fetch Batch Data
	function fetchBatchData2(fromDate, toDate) {
		frappe.call({
			method: "my_customapp1.daegss_retail.page.inventory_dashboard.inventory_dashboard.get_top_5_moving_items2",
			args: {
				from_date: fromDate,
				to_date: toDate
			},

			callback: function (response) {
				const data = response.message;
				const tableBody = $('#non-moving-body');
				tableBody.empty();

				if (data.length == 0) {
					tableBody.append(`
						<tr>
							<td colspan="6" class="text-center">No data available</td>
						</tr>
					`);

					return;
				}

				// Populate Daily Transactions
				populateDailyTransactions2(data);
			}
		});
	}

	// Fetch Batch Data
	function fetchBatchData3(fromDate, toDate) {
		frappe.call({
			method: "my_customapp1.daegss_retail.page.inventory_dashboard.inventory_dashboard.get_inventory_register",
			args: {
				from_date: fromDate,
				to_date: toDate
			},

			callback: function (response) {
				const data = response.message;
				const tableBody = $('#inventory-register-body');
				tableBody.empty();

				if (data.length == 0) {
					tableBody.append(`
						<tr>
							<td colspan="6" class="text-center">No data available</td>
						</tr>
					`);

					return;
				}

				// Populate Daily Transactions
				populateDailyTransactions3(data);
			}
		});
	}

	// Populate Daily Transactions
	function populateDailyTransactions(transactions) {
		const transactionBody = $('#top-5-moving-items');
		transactionBody.empty();

		transactions.forEach(transaction => {
			transactionBody.append(`
					<tr>
					
						<td>${transaction.item_code}</td>
						<td>${transaction.item_name}</td>
						<td>${transaction.inward}</td>
						<td>${transaction.outward}</td>
						<td>${transaction.balance}</td>
					
					</tr>
				`);
		});
	}

	// ✅ This runs EVERY TIME the user opens or returns to the page
	frappe.pages['inventory-dashboard'].on_page_show = function () {

		$('#from-date').val(''); // Clear selected date
		$('#to-date').val(''); // Clear selected date
		fetchBatchData(fromDate = null, toDate = null);
		fetchBatchData2(fromDate = null, toDate = null);
		fetchBatchData3(fromDate = null, toDate = null);  // Load default data

	};

	// Populate Daily Transactions
	function populateDailyTransactions2(transactions) {
		const transactionBody = $('#non-moving-body');
		transactionBody.empty();

		transactions.forEach(transaction => {
			transactionBody.append(`
					<tr>					
						<td>${transaction.item_code}</td>
						<td>${transaction.item_name}</td>
						<td>${transaction.inward}</td>
						<td>${transaction.outward}</td>
						<td>${transaction.balance}</td>					
					</tr>
				`);
		});
	}

	// Populate Daily Transactions
	function populateDailyTransactions3(transactions) {
		const transactionBody = $('#inventory-register-body');
		transactionBody.empty();

		transactions.forEach(transaction => {
			transactionBody.append(`
					<tr>
						<td>${transaction.item_code}</td>
						<td>${transaction.item_name}</td>
						<td>${transaction.inward}</td>
						<td>${transaction.outward}</td>
						<td>${transaction.balance}</td>
					</tr>
				`);
		});
	}
}