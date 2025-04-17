import frappe
from frappe import _
from frappe.model.document import Document
import requests
import frappe
from frappe import _

@frappe.whitelist()
def get_logged_in_user():
    return frappe.session.user

@frappe.whitelist()
def get_data():
    """Fetch Items from SAP."""
    print("Fetching top 5 items from SAP")

    company_id = 35  # You can make this dynamic if needed

    if company_id == 31:
        s_username = "SAPB1\\M001"
        s_password = "Megal@!234"
        base_url = "https://vmsapb1hana02.centralindia.cloudapp.azure.com:50000/b1s/v1/"
    elif company_id == 35:
        s_username = '{ UserName: "SAPB1\\\\M001", CompanyDB: "MEGALO_TEST" }'
        s_password = 'Megal@!234'
        base_url = "https://vmsapb1hana02.centralindia.cloudapp.azure.com:50000/b1s/v1/"
    else:
        frappe.throw(_("Invalid company ID. No matching SAP credentials found."))

    url = f"{base_url}Items?$top=2"
    print("URL:", url)

    try:
        response = requests.get(
            url,
            auth=(s_username, s_password),
            headers={"Content-Type": "application/json"},
            verify=False  # Only disable this in dev environments
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        frappe.log_error(message=str(e), title=_("SAP Items Fetch Error"))
        frappe.throw(_("Unable to fetch SAP Items. Please check the logs for details."))

   
        