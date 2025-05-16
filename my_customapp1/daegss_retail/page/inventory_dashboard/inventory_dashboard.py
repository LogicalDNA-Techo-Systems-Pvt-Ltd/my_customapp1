import frappe
from frappe import _
from datetime import datetime, timedelta
import random  # Added for generating sample data

# @frappe.whitelist()
# def get_top_5_moving_items():
#     data = frappe.db.sql("""
#         SELECT
#             DATE(i.creation) AS item_date,
#             bi.item_code,
#             i.item_name,
#             SUM(CASE WHEN se.purpose = 'Material Receipt' THEN bi.qty ELSE 0 END) AS inward,
#             SUM(CASE WHEN se.purpose = 'Material Issue' THEN bi.qty ELSE 0 END) AS outward,
#             SUM(bi.qty * (CASE 
#                             WHEN se.purpose = 'Material Receipt' THEN 1 
#                             WHEN se.purpose = 'Material Issue' THEN -1 
#                             ELSE 0 
#                           END)) AS balance
#         FROM
#             `tabStock Entry Detail` bi
#         INNER JOIN
#             `tabStock Entry` se ON se.name = bi.parent
#         INNER JOIN
#             `tabItem` i ON i.name = bi.item_code
#         WHERE
#             se.docstatus = 1
#         GROUP BY
#             bi.item_code
#         ORDER BY
#             SUM(CASE WHEN se.purpose = 'Material Receipt' THEN bi.qty ELSE 0 END) +
#             SUM(CASE WHEN se.purpose = 'Material Issue' THEN bi.qty ELSE 0 END)
#             DESC,
#             item_date ASC
#         LIMIT 5
#     """, as_dict=True)

#     return data


# @frappe.whitelist()
# def get_top_5_moving_items(from_date=None, to_date=None):
    
#     conditions = ""
#     values = {}

#     if from_date and to_date:
#         conditions += " AND se.posting_date BETWEEN %(from_date)s AND %(to_date)s"
#         values.update({
#             "from_date": from_date,
#             "to_date": to_date
#         })
        
#     return frappe.db.sql("""
#         SELECT
#             bi.item_code,
#             i.item_name,
#             SUM(CASE WHEN se.purpose = 'Material Receipt' THEN bi.qty ELSE 0 END) AS inward,
#             SUM(CASE WHEN se.purpose = 'Material Issue' THEN bi.qty ELSE 0 END) AS outward,
#             SUM(bi.qty * (CASE 
#                             WHEN se.purpose = 'Material Receipt' THEN 1 
#                             WHEN se.purpose = 'Material Issue' THEN -1 
#                             ELSE 0 
#                           END)) AS balance
#         FROM `tabStock Entry Detail` bi
#         INNER JOIN `tabStock Entry` se ON se.name = bi.parent
#         INNER JOIN `tabItem` i ON i.name = bi.item_code
#         WHERE se.docstatus = 1
#         {conditions}
#         GROUP BY bi.item_code
#         ORDER BY inward DESC
#         LIMIT 5
#     """, as_dict=True)


@frappe.whitelist()
def get_top_5_moving_items(from_date=None, to_date=None):
    conditions = ""
    values = {}

    if from_date and to_date:
        conditions += " AND se.posting_date BETWEEN %(from_date)s AND %(to_date)s"
        values.update({
            "from_date": from_date,
            "to_date": to_date
        })

    query = f"""
        SELECT
            bi.item_code,
            i.item_name,
            SUM(CASE WHEN se.purpose = 'Material Receipt' THEN bi.qty ELSE 0 END) AS inward,
            SUM(CASE WHEN se.purpose = 'Material Issue' THEN bi.qty ELSE 0 END) AS outward,
            SUM(bi.qty * (CASE 
                            WHEN se.purpose = 'Material Receipt' THEN 1 
                            WHEN se.purpose = 'Material Issue' THEN -1 
                            ELSE 0 
                          END)) AS balance
        FROM `tabStock Entry Detail` bi
        INNER JOIN `tabStock Entry` se ON se.name = bi.parent
        INNER JOIN `tabItem` i ON i.name = bi.item_code
        WHERE se.docstatus = 1
        {conditions}
        GROUP BY bi.item_code
        ORDER BY inward DESC
        LIMIT 5
    """

    return frappe.db.sql(query, values, as_dict=True)

    
# @frappe.whitelist()
# def get_top_5_moving_items2():
    
#     data = frappe.db.sql("""
#         SELECT 
#             i.item_code,
#             i.item_name,
#             0 AS inward,
#             0 AS outward,
#             0 AS balance
#         FROM `tabItem` i
#         WHERE i.item_code NOT IN (
#             SELECT DISTINCT bi.item_code
#             FROM `tabStock Entry Detail` bi
#             INNER JOIN `tabStock Entry` se ON se.name = bi.parent
#             WHERE se.docstatus = 1
#         )
#         ORDER BY i.creation DESC
#         LIMIT 5
#     """, as_dict=True)
#     return data



@frappe.whitelist()
def get_top_5_moving_items2(from_date=None, to_date=None):
    conditions = ""
    values = {}

    if from_date and to_date:
        conditions += " AND se.posting_date BETWEEN %(from_date)s AND %(to_date)s"
        values.update({
            "from_date": from_date,
            "to_date": to_date
        })

    query = f"""
        SELECT 
            i.item_code,
            i.item_name,
            0 AS inward,
            0 AS outward,
            0 AS balance
        FROM `tabItem` i
        WHERE i.item_code NOT IN (
            SELECT DISTINCT bi.item_code
            FROM `tabStock Entry Detail` bi
            INNER JOIN `tabStock Entry` se ON se.name = bi.parent
            WHERE se.docstatus = 1
            {conditions}
        )
        ORDER BY i.creation DESC
        LIMIT 5
    """

    return frappe.db.sql(query, values, as_dict=True)


# @frappe.whitelist()
# def get_inventory_register(from_date=None, to_date=None):
# 	"""
# 	Returns a list of all stock items with:
# 	    • total inward qty (Material Receipt + Material Transfer IN)
# 	    • total outward qty (Material Issue + Material Transfer OUT)
# 	    • current balance (tabBin.actual_qty)

# 	If from_date / to_date are supplied, inward- and outward-totals are
# 	restricted to that posting-date window; the balance is always the live
# 	stock on hand in `tabBin`.
# 	"""

# 	# ------------------------------------------------------------------
# 	# Build optional date filter
# 	# ------------------------------------------------------------------
# 	date_condition = ""
# 	values = {}
# 	if from_date and to_date:
# 		date_condition = "AND se.posting_date BETWEEN %(from_date)s AND %(to_date)s"
# 		values.update({"from_date": from_date, "to_date": to_date})

# 	# ------------------------------------------------------------------
# 	# Compose query
# 	# ------------------------------------------------------------------
# 	query = f"""
# 		SELECT
# 			it.item_code,
# 			it.item_name,

# 			-- total inward qty in the window
# 			IFNULL((
# 				SELECT SUM(sed.qty)
# 				FROM `tabStock Entry Detail` sed
# 				INNER JOIN `tabStock Entry` se_on ON se_on.name = sed.parent
# 				WHERE se_on.docstatus = 1
# 				  AND se_on.purpose IN ('Material Receipt', 'Material Transfer')
# 				  AND sed.t_warehouse IS NOT NULL
# 				  AND sed.item_code = it.item_code
# 				  {date_condition}
# 			), 0) AS inward,

# 			-- total outward qty in the window
# 			IFNULL((
# 				SELECT SUM(sed.qty)
# 				FROM `tabStock Entry Detail` sed
# 				INNER JOIN `tabStock Entry` se_on ON se_on.name = sed.parent
# 				WHERE se_on.docstatus = 1
# 				  AND se_on.purpose IN ('Material Issue', 'Material Transfer')
# 				  AND sed.s_warehouse IS NOT NULL
# 				  AND sed.item_code = it.item_code
# 				  {date_condition}
# 			), 0) AS outward,

# 			-- live balance (all warehouses aggregated)
# 			IFNULL((
# 				SELECT SUM(bin.actual_qty)
# 				FROM `tabBin` bin
# 				WHERE bin.item_code = it.item_code
# 			), 0) AS balance

# 		FROM `tabItem` it
# 		WHERE it.is_stock_item = 1
# 		ORDER BY it.item_code
# 	"""

# 	return frappe.db.sql(query, values, as_dict=True)


@frappe.whitelist()
def get_inventory_register(from_date=None, to_date=None):
    conditions = ""
    values = {}

    if from_date and to_date:
        conditions += " AND se.posting_date BETWEEN %(from_date)s AND %(to_date)s"
        values.update({
            "from_date": from_date,
            "to_date": to_date
        })

    query = f"""
        SELECT
            bi.item_code,
            i.item_name,
            SUM(CASE WHEN se.purpose = 'Material Receipt' THEN bi.qty ELSE 0 END) AS inward,
            SUM(CASE WHEN se.purpose = 'Material Issue' THEN bi.qty ELSE 0 END) AS outward,
            SUM(bi.qty * (CASE 
                            WHEN se.purpose = 'Material Receipt' THEN 1 
                            WHEN se.purpose = 'Material Issue' THEN -1 
                            ELSE 0 
                          END)) AS balance
        FROM `tabStock Entry Detail` bi
        INNER JOIN `tabStock Entry` se ON se.name = bi.parent
        INNER JOIN `tabItem` i ON i.name = bi.item_code
        WHERE se.docstatus = 1
        {conditions}
        GROUP BY bi.item_code
        ORDER BY i.item_name
    """

    return frappe.db.sql(query, values, as_dict=True)
