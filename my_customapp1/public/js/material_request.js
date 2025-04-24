frappe.ui.form.on('Material Request', {
    // onload: function(frm) {
    //     // Pre-fill 2 rows if empty
    //     if (!frm.doc.weight_lists || frm.doc.weight_lists.length === 0) {
    //         const broiler_types = ['S/ Broiler', 'B/ Broiler'];

    //         broiler_types.forEach(type => {
    //             let row = frm.add_child('custom_weight_lists');
    //             row.broiler_type = type;
    //         });

    //         frm.refresh_field('custom_weight_lists');
    //     }
    // },

    onload: function(frm) {
        // Only populate if table is empty
        if (!frm.doc.custom_weight_lists || frm.doc.custom_weight_lists.length === 0) {
            const static_data = [
                {
                    broiler_type: 'S/ Broiler',
                    weight_800_1000: 29,
                    weight_1000_1100: 67
                },
                {
                    broiler_type: 'B/ Broiler',
                    weight_800_1000: 15,
                    weight_1000_1100: 42
                }
            ];

            static_data.forEach(data => {
                let row = frm.add_child('custom_weight_lists'); // use your exact fieldname
                row.broiler_type = data.broiler_type;
                row.weight_800_1000 = data.weight_800_1000;
                row.weight_1000_1100 = data.weight_1000_1100;
            });

            frm.refresh_field('custom_weight_lists');
        }
    }

    // refresh: function(frm) {
        
    //     frm.add_custom_button('Bind Weights', function () {
    //         const staticData = {
    //             'S/ Broiler': {
    //                 weight_800_1000: 29,
    //                 weight_1001_1400: 67,
    //                 weight_1401_1800: 45,
    //                 weight_1801_2000: 33
    //             },
    //             'B/ Broiler': {
    //                 weight_800_1000: 21,
    //                 weight_1001_1400: 54,
    //                 weight_1401_1800: 40,
    //                 weight_1801_2000: 25
    //             }
    //         };

    //         frm.doc.custom_weight_lists.forEach(row => {
    //             if (staticData[row.name]) {
    //                 Object.assign(row, staticData[row.name]);
    //             }
    //         });

    //         frm.refresh_field('custom_weight_lists');
    //     });
    // },

    
});
