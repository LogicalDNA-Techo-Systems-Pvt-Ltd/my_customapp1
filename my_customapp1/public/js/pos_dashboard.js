frappe.pages['pos-dashboard'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'RETAIL',
		single_column: true
	});
}



// Render HTML Template
$(frappe.render_template("pos_dashboard_template", {})).appendTo(page.body);

// Call backend and render data
frappe.call({
	method: "my_customapp1.api.get_pos_dashboard_data",
	callback: function (r) {
		if (r.message) {
			render_pos_dashboard(r.message);
		}
	}
});


function render_pos_dashboard(data) {
    $('#orders_today').text("Orders Today: " + data.orders_today);
    $('#value_today').text("Value Today: ₹" + data.value_today);

    let $table = $('#top_items_table');
    data.top_items.forEach(item => {
        $table.append(`
            <tr>
                <td>${item.item_name}</td>
                <td>${item.total_qty}</td>
                <td>${item.total_value}</td>
            </tr>
        `);
    });
}

