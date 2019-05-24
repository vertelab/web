'use strict';

odoo.define('web_switch_company_warning.widget', function (require) {
    var Widget = require('web.Widget');
    var UserMenu = require('web.UserMenu');
    //Show a big banner in the top of the page if the company has been
    //changed in another tab or window (in the same browser)

    if (!window.SharedWorker) {
        //not supported
        return;
    }
    var SwitchCompanyWarningWidget = Widget.extend({
        template:'web_switch_company_warning.warningWidget',
        init: function() {
            this._super();
            var self = this;
            var w = new SharedWorker('/web_switch_company_warning/static/src/js/switch_company_warning_worker.js');
            w.port.addEventListener('message', function (msg) {
                if (msg.data.type !== 'newCtx') {
                    return;
                }
                if(msg.data.newCtx === self.generateSignature()) {
                    self.$el.hide();
                } else {
                    self.$el.show();
                }
            });
            w.port.start();
            w.port.postMessage(this.generateSignature());
        },
        generateSignature: function() {
            return [this.session.company_id, this.session.db].join();
        }
    });

    UserMenu.include({
        init: function(parent) {
            this._super(parent);
            var switchCompanyWarning = new SwitchCompanyWarningWidget();
            // Choose where to append depending on whether web_responsive is installed or not
            if (document.getElementById('oe_main_menu_navbar')) {
                switchCompanyWarning.appendTo('#oe_main_menu_navbar');
            } else {
                switchCompanyWarning.insertAfter('.main-nav');
            }
        }

    });

    return SwitchCompanyWarningWidget;
});

