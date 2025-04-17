frappe.pages['point-of-sale'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Point of Sale',
        single_column: true
    });

    wrapper.innerHTML = `
        <div style="padding: 20px;">
            <button class="btn btn-primary" id="click-me">Click Me</button>
            <div id="response-area" style="margin-top: 10px;"></div>
        </div>
    `;

    document.getElementById('click-me').onclick = function () {
        frappe.call({
            method: 'my_customapp1.api.get_logged_in_user',
            callback: function (r) {
                if (r.message) {
                    document.getElementById('response-area').innerHTML = 
                        `<b>Logged-in User:</b> ${r.message}`;
                }
            }
        });
    };
};
