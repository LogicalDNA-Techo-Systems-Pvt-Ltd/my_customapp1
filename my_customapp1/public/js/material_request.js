// frappe.ui.form.on('Material Request', {

//     onload: function(frm) {
//         // Pre-fill 2 rows if empty
//         if (!frm.doc.weight_lists || frm.doc.weight_lists.length === 0) {
//             const broiler_types = ['S/ Broiler', 'B/ Broiler'];

//             broiler_types.forEach(type => {
//                 let row = frm.add_child('custom_weight_lists');
//                 row.broiler_type = type;
//             });

//             frm.refresh_field('custom_weight_lists');
//         }
//     },

    

//     refresh: function(frm) {
        
//         frm.add_custom_button('Bind Weights', function () {

//             const staticData = {
//                 'S/ Broiler': {
//                     range_800_1000: 29,
//                     range_1001_1400: 67,
//                     range_1401_1800: 45,
//                     range_1801_2000: 33
//                 },
//                 'B/ Broiler': {
//                     range_800_1000: 21,
//                     range_1001_1400: 54,
//                     range_1401_1800: 40,
//                     range_1801_2000: 25
//                 }
//             };

//             frm.doc.custom_weight_lists.forEach(row => {
//                 if (staticData[row.name]) {
//                     Object.assign(row, staticData[row.name]);
//                 }
//             });

//             frm.refresh_field('custom_weight_lists');
//         });
//     },

    
// });

frappe.ui.form.on('Material Request', {
    onload: function(frm) {
        // Pre-fill 2 rows if empty
        if (!frm.doc.custom_weight_lists || frm.doc.custom_weight_lists.length === 0) {
            const broiler_types = ['S/ Broiler', 'B/ Broiler'];

            broiler_types.forEach(type => {
                let row = frm.add_child('custom_weight_lists');
                row.broiler_type = type;
            });

            frm.refresh_field('custom_weight_lists');
        }
    },


    refresh: function(frm) {
        frm.add_custom_button('Fetch Weights', function () {
            frm.doc.custom_weight_lists.forEach(row => {
                // Generate random values between 10 and 99
                row.range_800_1000 = Math.floor(Math.random() * 90 + 10);
                row.range_1001_1400 = Math.floor(Math.random() * 90 + 10);
                row.range_1401_1800 = Math.floor(Math.random() * 90 + 10);
                row.range_1801_2000 = Math.floor(Math.random() * 90 + 10);
            });

            frm.refresh_field('custom_weight_lists');
        });
    }
});
