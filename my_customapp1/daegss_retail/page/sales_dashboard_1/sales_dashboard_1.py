# import frappe
# from frappe import _
# from datetime import datetime, timedelta
# import random  # Added for generating sample data
# import frappe



# @frappe.whitelist()
# def get_batch_summary_data():
#     # Top Items Summary
    
#     conditions = ""
#     values = {}

#     if date:
#         conditions = "AND DATE(creation) = %(date)s"
#         values["date"] = date
        
#     items_data = frappe.db.sql("""
#         SELECT
#             DATE(creation) AS DATE,
#             item_code,
#             item_name,
#             COUNT(*) AS total_orders,
#             SUM(qty) AS total_qty,
#             AVG(rate) AS avg_rate,
#             SUM(amount) AS total_amount
#         FROM
#             `tabPOS Invoice Item`
#         GROUP BY
#             item_code, item_name
#         HAVING
#             COUNT(*) > 1
#         ORDER BY
#             date ASC;
#     """, as_dict=True)

#     # Overall Summary
#     invoice_summary = frappe.db.sql("""
#         SELECT
#             COUNT(*) AS total_invoices,
#             SUM(grand_total) AS total_amount
#         FROM
#             `tabPOS Invoice`
#         WHERE
#             docstatus = 1
#     """, as_dict=True)

#     return {
#         "top_items": items_data,
#         "invoice_summary": invoice_summary[0] if invoice_summary else {}
#     }

import frappe
from frappe import _

@frappe.whitelist()
def get_batch_summary_data(date=None):
    # Build dynamic WHERE condition
    conditions = ""
    values = {}

    if date:
        conditions = "WHERE DATE(creation) >= %(date)s"
        values["date"] = date

    # Top Items (repeated more than once)
    items_data = frappe.db.sql(f"""
        SELECT
            DATE(creation) AS date,
            item_code,
            item_name,
            COUNT(*) AS total_orders,
            SUM(qty) AS total_qty,
            AVG(rate) AS avg_rate,
            SUM(amount) AS total_amount
        FROM
            `tabPOS Invoice Item`
        {conditions}
        GROUP BY
            item_code, item_name
        HAVING
            COUNT(*) > 1
        ORDER BY
            date ASC
        LIMIT 5
    """, values, as_dict=True)

     # Invoice Summary with date filter if provided
    invoice_summary = frappe.db.sql(f"""
        SELECT
            COUNT(*) AS total_invoices,
            SUM(grand_total) AS total_amount
        FROM
            `tabPOS Invoice`
        WHERE
            docstatus = 1
            { "AND DATE(creation) >= %(date)s" if date else "" }
    """, values, as_dict=True)

    return {
        "top_items": items_data,
        "invoice_summary": invoice_summary[0] if invoice_summary else {}
    }

@frappe.whitelist()
def get_inward_data():
    return frappe.db.sql("""
        SELECT
            mr.name AS demand_id,
            mr.transaction_date AS demand_date,
            COUNT(mri.item_code) AS item_count,
            mr.status,
            mr.schedule_date AS due_date,
            '-' AS received_date
        FROM `tabMaterial Request` mr
        INNER JOIN `tabMaterial Request Item` mri ON mr.name = mri.parent
        WHERE mr.docstatus = 1
          AND mr.material_request_type = 'Material Transfer'
          AND mri.qty > (
              SELECT IFNULL(SUM(sed.qty), 0)
              FROM `tabStock Entry Detail` sed
              INNER JOIN `tabStock Entry` se ON se.name = sed.parent
              WHERE se.docstatus = 1
                AND se.purpose = 'Material Transfer'
                AND sed.material_request = mr.name
                AND sed.item_code = mri.item_code
          )
        GROUP BY mr.name, mr.transaction_date, mr.status, mr.schedule_date
        ORDER BY mr.transaction_date DESC
    """, as_dict=True)
