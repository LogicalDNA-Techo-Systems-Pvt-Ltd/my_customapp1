# my_customapp1/pos_workflow.py
import frappe
from frappe import _
from frappe.utils import now, today

# Define the status workflow
POS_STATUS_WORKFLOW = {
    "Draft": ["Paid"],
    "Paid": ["In Progress"],
    "In Progress": ["Ready for Delivery"],
    "Ready for Delivery": ["Delivered"],
    "Delivered": [],  # Final state
}


def validate_pos_invoice(doc, method):
    """Validate POS Invoice status transitions"""
    if not doc.is_new():
        old_doc = frappe.get_doc("POS Invoice", doc.name)
        if old_doc.custom_order_status != doc.custom_order_status:
            validate_status_transition(
                old_doc.custom_order_status, doc.custom_order_status
            )


def validate_status_transition(from_status, to_status):
    """Validate if status transition is allowed"""
    if from_status and to_status:
        allowed_transitions = POS_STATUS_WORKFLOW.get(from_status, [])
        if to_status not in allowed_transitions:
            frappe.throw(
                _("Invalid status transition from {0} to {1}").format(
                    from_status, to_status
                )
            )


def on_pos_invoice_submit(doc, method):
    """Handle POS Invoice submission"""
    if doc.is_pos and not doc.custom_order_status:
        # Set initial status based on payment
        if doc.outstanding_amount <= 0:
            doc.custom_order_status = "Paid"
        else:
            doc.custom_order_status = "Draft"
        doc.save()


def on_payment_completion(doc, method):
    """Handle payment completion"""
    if (
        doc.is_pos
        and doc.custom_order_status == "Draft"
        and doc.outstanding_amount <= 0
    ):
        doc.custom_order_status = "Paid"
        doc.save()


@frappe.whitelist()
def update_order_status(pos_invoice_name, new_status):
    """Update POS Invoice status with validation"""
    try:
        doc = frappe.get_doc("POS Invoice", pos_invoice_name)

        # Check permissions
        if not frappe.has_permission("POS Invoice", "write", doc):
            frappe.throw(_("No permission to update this order"))

        # Validate transition
        validate_status_transition(doc.custom_order_status, new_status)

        # Update status
        old_status = doc.custom_order_status
        doc.custom_order_status = new_status
        doc.add_comment(
            "Info", _("Status changed from {0} to {1}").format(old_status, new_status)
        )
        doc.save()

        # Log the status change
        create_status_log(pos_invoice_name, old_status, new_status)

        return {"success": True, "message": _("Status updated successfully")}

    except Exception as e:
        frappe.log_error(f"Error updating POS Invoice status: {str(e)}")
        return {"success": False, "message": str(e)}


def create_status_log(pos_invoice_name, old_status, new_status):
    """Create a log entry for status changes"""
    try:
        log_doc = frappe.get_doc(
            {
                "doctype": "POS Order Status Log",
                "pos_invoice": pos_invoice_name,
                "old_status": old_status,
                "new_status": new_status,
                "changed_by": frappe.session.user,
                "change_time": now(),
            }
        )
        log_doc.insert(ignore_permissions=True)
    except Exception as e:
        frappe.log_error(f"Error creating status log: {str(e)}")


@frappe.whitelist()
def get_allowed_transitions(current_status):
    """Get allowed status transitions for current status"""
    return POS_STATUS_WORKFLOW.get(current_status, [])


@frappe.whitelist()
def get_pos_orders_by_status(status=None, date_filter=None, customer_filter=None):
    """Get POS orders filtered by status and other criteria"""
    filters = [["is_pos", "=", 1], ["docstatus", "=", 1]]  # Only submitted invoices

    if status:
        filters.append(["custom_order_status", "=", status])

    if date_filter:
        filters.append(["posting_date", "=", date_filter])

    if customer_filter:
        filters.append(["customer", "=", customer_filter])

    fields = [
        "name",
        "customer",
        "customer_name",
        "rounded_total",
        "grand_total",
        "custom_order_status as status",
        "posting_date",
        "posting_time",
        "owner",
        "modified",
    ]

    return frappe.get_list(
        "POS Invoice", filters=filters, fields=fields, order_by="creation desc"
    )


@frappe.whitelist()
def bulk_update_status(invoice_names, new_status):
    """Bulk update status for multiple invoices"""
    if isinstance(invoice_names, str):
        invoice_names = frappe.parse_json(invoice_names)

    results = []
    for name in invoice_names:
        result = update_order_status(name, new_status)
        results.append({"invoice": name, "result": result})

    return results
