app_name = "my_customapp1"
app_title = "DAEGSS RETAIL"
app_publisher = "THE MANISH"
app_description = "SALES AND PR"
app_email = "manish28@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "my_customapp1",
# 		"logo": "/assets/my_customapp1/logo.png",
# 		"title": "DAEGSS RETAIL",
# 		"route": "/my_customapp1",
# 		"has_permission": "my_customapp1.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/my_customapp1/css/my_customapp1.css"
# app_include_js = "/assets/my_customapp1/js/my_customapp1.js"

# app_include_js = "/public/js/custom_pos.js"
# app_include_js = "/assets/my_customapp1/js/pos_dashboard.js"

app_include_css = ["/assets/my_customapp1/css/custom.css"]

app_include_js = [
    # "/assets/my_customapp1/js/pos_dashboard.js",
    # "/assets/my_customapp1/js/status_wise_pos_orders.js",
    "/assets/my_customapp1/js/pos_custom.js",
    "/assets/my_customapp1/js/custom_pos_extension.js"
]


doctype_js = {"Material Request": "public/js/material_request.js"}


# include js, css files in header of web template
# web_include_css = "/assets/my_customapp1/css/my_customapp1.css"
# web_include_js = "/assets/my_customapp1/js/my_customapp1.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "my_customapp1/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "my_customapp1/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "my_customapp1.utils.jinja_methods",
# 	"filters": "my_customapp1.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "my_customapp1.install.before_install"
# after_install = "my_customapp1.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "my_customapp1.uninstall.before_uninstall"
# after_uninstall = "my_customapp1.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "my_customapp1.utils.before_app_install"
# after_app_install = "my_customapp1.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "my_customapp1.utils.before_app_uninstall"
# after_app_uninstall = "my_customapp1.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "my_customapp1.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
    "Sales Invoice": "my_customapp1.overrides.custom_sales_invoice.CustomSalesInvoice"
}

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
    "POS Invoice": {
        "validate": "my_customapp1.pos_workflow.validate_pos_invoice",
        "on_submit": "my_customapp1.pos_workflow.on_pos_invoice_submit",
        "on_payment_completion": "my_customapp1.pos_workflow.on_payment_completion",
    }
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"my_customapp1.tasks.all"
# 	],
# 	"daily": [
# 		"my_customapp1.tasks.daily"
# 	],
# 	"hourly": [
# 		"my_customapp1.tasks.hourly"
# 	],
# 	"weekly": [
# 		"my_customapp1.tasks.weekly"
# 	],
# 	"monthly": [
# 		"my_customapp1.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "my_customapp1.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "my_customapp1.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "my_customapp1.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["my_customapp1.utils.before_request"]
# after_request = ["my_customapp1.utils.after_request"]

# Job Events
# ----------
# before_job = ["my_customapp1.utils.before_job"]
# after_job = ["my_customapp1.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"my_customapp1.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# website_route_rules = [
#     {"from_route": "/login", "to_route": "login"}
# ]


website_context = {"favicon": "/assets/my_customapp1/images/DC_LOGO.png"}
