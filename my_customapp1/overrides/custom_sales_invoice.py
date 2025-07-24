from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice

class CustomSalesInvoice(SalesInvoice):
    def set_status(self, update=False, status=None):
        # Use custom status if available
        if self.custom_status:
            self.status = self.custom_status
        else:
            super().set_status(update, status)
