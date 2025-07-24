// pos_custom.js - Add this to your custom app's public/js folder
// This customizes the POS interface to support the workflow

frappe.provide('erpnext.PointOfSale');

// Override POS Invoice creation to set initial status
const originalMakeInvoice = erpnext.PointOfSale.Controller.prototype.make_invoice_doc;

erpnext.PointOfSale.Controller.prototype.make_invoice_doc = function() {
    const invoice = originalMakeInvoice.call(this);
    
    // Set initial status based on payment
    if (invoice.payments && invoice.payments.length > 0) {
        const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid >= invoice.grand_total) {
            invoice.custom_order_status = 'Paid';
        } else {
            invoice.custom_order_status = 'Draft';
        }
    } else {
        invoice.custom_order_status = 'Draft';
    }
    
    return invoice;
};

// Add status indicator to POS interface
frappe.ui.form.on('POS Invoice', {
    refresh: function(frm) {
        if (frm.doc.is_pos && frm.doc.custom_order_status) {
            addStatusIndicator(frm);
        }
        
        // Add status update buttons if not draft
        if (frm.doc.is_pos && frm.doc.custom_order_status !== 'Draft' && !frm.is_new()) {
            addStatusUpdateButtons(frm);
        }
    },
    
    custom_order_status: function(frm) {
        if (frm.doc.is_pos) {
            updateStatusDisplay(frm);
        }
    }
});

function addStatusIndicator(frm) {
    const status = frm.doc.custom_order_status;
    const statusColor = getStatusColor(status);
    
    // Remove existing indicator
    $('.pos-status-indicator').remove();
    
    // Add new indicator
    const indicator = $(`
        <div class="pos-status-indicator" style="
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 1000;
            background: ${statusColor};
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
            📋 ${status}
        </div>
    `);
    
    $('body').append(indicator);
    
    // Auto-hide after 3 seconds if not hovered
    setTimeout(() => {
        if (!indicator.is(':hover')) {
            indicator.fadeOut();
        }
    }, 3000);
}

function addStatusUpdateButtons(frm) {
    const currentStatus = frm.doc.custom_order_status;
    const allowedTransitions = getNextStatuses(currentStatus);
    
    if (allowedTransitions.length > 0) {
        frm.add_custom_button(__('Update Status'), function() {
            showStatusUpdateDialog(frm, allowedTransitions);
        }, __('Actions'));
    }
    
    // Add quick action buttons for common transitions
    allowedTransitions.forEach(status => {
        const buttonText = `Mark as ${status}`;
        frm.add_custom_button(__(buttonText), function() {
            updateStatus(frm, status);
        }, __('Quick Actions'));
    });
}

function showStatusUpdateDialog(frm, allowedStatuses) {
    const dialog = new frappe.ui.Dialog({
        title: 'Update Order Status',
        fields: [
            {
                fieldtype: 'Select',
                fieldname: 'new_status',
                label: 'New Status',
                options: allowedStatuses.join('\n'),
                reqd: 1,
                default: allowedStatuses[0]
            },
            {
                fieldtype: 'Small Text',
                fieldname: 'remarks',
                label: 'Remarks (Optional)',
                description: 'Add any notes about this status change'
            }
        ],
        primary_action_label: 'Update Status',
        primary_action: function(values) {
            updateStatus(frm, values.new_status, values.remarks);
            dialog.hide();
        }
    });
    
    dialog.show();
}

async function updateStatus(frm, newStatus, remarks = '') {
    try {
        // Show loading
        frappe.dom.freeze(__('Updating status...'));
        
        const result = await frappe.call({
            method: 'my_customapp1.pos_workflow.update_order_status',
            args: {
                pos_invoice_name: frm.doc.name,
                new_status: newStatus
            }
        });
        
        if (result.message.success) {
            // Update the form
            frm.set_value('custom_order_status', newStatus);
            frm.save();
            
            // Add comment if remarks provided
            if (remarks) {
                frm.add_comment('Comment', remarks);
            }
            
            frappe.show_alert({
                message: __('Status updated to {0}', [newStatus]),
                indicator: 'green'
            });
            
            // Update status display
            updateStatusDisplay(frm);
            
        } else {
            frappe.show_alert({
                message: result.message.message,
                indicator: 'red'
            });
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
        frappe.show_alert({
            message: __('Error updating status'),
            indicator: 'red'
        });
    } finally {
        frappe.dom.unfreeze();
    }
}

function updateStatusDisplay(frm) {
    const status = frm.doc.custom_order_status;
    
    // Update form title color based on status
    const titleElement = $('.title-text');
    if (titleElement.length) {
        titleElement.css('color', getStatusColor(status));
    }
    
    // Update status indicator
    addStatusIndicator(frm);
    
    // Show workflow progress
    showWorkflowProgress(frm);
}

function showWorkflowProgress(frm) {
    const currentStatus = frm.doc.custom_order_status;
    const statuses = ['Draft', 'Paid', 'In Progress', 'Ready for Delivery', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    
    // Remove existing progress bar
    $('.workflow-progress').remove();
    
    // Create progress bar
    let progressHtml = '<div class="workflow-progress" style="margin: 15px 0;"><div class="progress-steps" style="display: flex; justify-content: space-between; align-items: center;">';
    
    statuses.forEach((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const stepClass = isCompleted ? 'completed' : 'pending';
        const bgColor = isCompleted ? '#28a745' : '#e9ecef';
        const textColor = isCompleted ? 'white' : '#6c757d';
        const borderColor = isCurrent ? '#007bff' : bgColor;
        
        progressHtml += `
            <div class="progress-step ${stepClass}" style="
                background: ${bgColor};
                color: ${textColor};
                border: 2px solid ${borderColor};
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                position: relative;
            ">
                ${index + 1}
                <div style="
                    position: absolute;
                    top: 45px;
                    left: 50%;
                    transform: translateX(-50%);
                    white-space: nowrap;
                    font-size: 10px;
                    color: ${isCurrent ? '#007bff' : '#6c757d'};
                ">${status}</div>
            </div>
        `;
        
        // Add connector line (except for last item)
        if (index < statuses.length - 1) {
            const lineColor = index < currentIndex ? '#28a745' : '#e9ecef';
            progressHtml += `
                <div style="
                    flex: 1;
                    height: 2px;
                    background: ${lineColor};
                    margin: 0 10px;
                "></div>
            `;
        }
    });
    
    progressHtml += '</div></div>';
    
    // Insert progress bar after form toolbar
    $('.form-toolbar').after(progressHtml);
}

function getStatusColor(status) {
    const colors = {
        'Draft': '#6c757d',
        'Paid': '#28a745',
        'In Progress': '#ffc107',
        'Ready for Delivery': '#17a2b8',
        'Delivered': '#007bff'
    };
    return colors[status] || '#6c757d';
}

function getNextStatuses(currentStatus) {
    const workflow = {
        'Draft': ['Paid'],
        'Paid': ['In Progress'],
        'In Progress': ['Ready for Delivery'],
        'Ready for Delivery': ['Delivered'],
        'Delivered': []
    };
    return workflow[currentStatus] || [];
}

// Add notification system for status changes
frappe.realtime.on('pos_order_status_changed', function(data) {
    if (data && data.invoice_name && data.new_status) {
        frappe.show_alert({
            message: __('Order {0} status changed to {1}', [data.invoice_name, data.new_status]),
            indicator: 'blue'
        });
        
        // Refresh current form if it's the same invoice
        const currentForm = cur_frm;
        if (currentForm && currentForm.doc.name === data.invoice_name) {
            currentForm.reload_doc();
        }
    }
});

// Kitchen Display Integration (if needed)
function sendToKitchenDisplay(invoiceName, status) {
    if (status === 'Paid') {
        // Send new order to kitchen
        frappe.call({
            method: 'my_customapp1.kitchen_display.add_order',
            args: {
                invoice_name: invoiceName
            }
        });
    } else if (status === 'Ready for Delivery') {
        // Mark as ready in kitchen display
        frappe.call({
            method: 'my_customapp1.kitchen_display.mark_ready',
            args: {
                invoice_name: invoiceName
            }
        });
    }
}

// Auto-refresh for specific statuses
setInterval(function() {
    if (cur_frm && cur_frm.doc.is_pos && cur_frm.doc.custom_order_status) {
        const status = cur_frm.doc.custom_order_status;
        
        // Auto-refresh for active statuses
        if (['Paid', 'In Progress', 'Ready for Delivery'].includes(status)) {
            // Check for updates every 30 seconds
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'POS Invoice',
                    filters: { name: cur_frm.doc.name },
                    fieldname: 'custom_order_status'
                },
                callback: function(r) {
                    if (r.message && r.message.custom_order_status !== cur_frm.doc.custom_order_status) {
                        cur_frm.reload_doc();
                    }
                }
            });
        }
    }
}, 30000); // 30 seconds

// Export functions for global access
window.posWorkflow = {
    updateStatus,
    getStatusColor,
    getNextStatuses,
    showWorkflowProgress
};