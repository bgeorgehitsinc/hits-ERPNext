// Copyright (c) 2021, Wahni Green Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Ledger Merge', {
  setup: function(frm) {
    frm.set_query("account", function(doc) {
      if (!doc.company) frappe.throw(__('Please set Company'));
      if (!doc.root_type) frappe.throw(__('Please set Root Type'));
      return {
        filters: {
          is_group: 0,
          root_type: doc.root_type,
          company: doc.company
        }
      }
    });

    frm.set_query('account', 'merge_accounts', function(doc, cdt, cdn) {
      if (!doc.company) frappe.throw(__('Please set Company'));
      if (!doc.root_type) frappe.throw(__('Please set Root Type'));
      if (!doc.account) frappe.throw(__('Please set Account'));
			return {
        filters: {
          is_group: 0,
          root_type: doc.root_type,
          name: ["!=", doc.account],
          company: doc.company
        }
      }
		});
  },

	refresh: function(frm) {
    frm.page.hide_icon_group();
	},

  onload_post_render: function(frm) {
		frm.trigger('update_primary_action');
	},

  after_save: function(frm) {
		frm.trigger('update_primary_action');
	},

	update_primary_action: function(frm) {
		if (frm.is_dirty()) {
			frm.enable_save();
			return;
		}
		frm.disable_save();
		if (frm.doc.status !== 'Success') {
			if (!frm.is_new()) {
				let label =
					frm.doc.status === 'Pending' ? __('Start Merge') : __('Retry');
				frm.page.set_primary_action(label, () => frm.events.start_merge(frm));
			} else {
				frm.page.set_primary_action(__('Save'), () => frm.save());
			}
		}
	},

  start_merge: function(frm) {
    console.log('Hi');
    frm.trigger('set_merge_status');
  },

  set_merge_status: function(frm) {
    if (frm.doc.status == "Pending") return;
    let successful_records = 0;
    frm.doc.merge_accounts.forEach((row) => {
			if(row.merged) successful_records += 1;
		});
    let message_args = [successful_records, frm.doc.merge_accounts.length];
    frm.dashboard.set_headline(__('Successfully merged {0} out of {1}.', message_args));
  }
});

frappe.ui.form.on('Ledger Merge Accounts', {
    merge_accounts_add: function(frm, cdt, cdn) {
      frm.trigger('update_primary_action');
    },
    merge_accounts_remove: function(frm, cdt, cdn) {
      frm.trigger('update_primary_action');
    },
    account: function(frm, cdt, cdn) {
      frm.trigger('update_primary_action');
    }
})
