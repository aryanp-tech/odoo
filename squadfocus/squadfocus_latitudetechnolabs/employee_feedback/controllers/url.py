from odoo import http
from odoo.http import request

class UnsubscribeEmployee(http.Controller):

    @http.route("/unsubscribe", methods=["GET"], auth="none", cors="*", csrf=False)
    def unsubscribe_employee(self, feed_id, **kwargs):
        if feed_id:
            feedback = request.env["employee.feedback"].sudo().browse(int(feed_id))
            if feedback:
                feedback.name.lead_id = False
                return "<h1>You have been unsubscribed successfully.</h1>"
        return "<h1>Error: Invalid request.</h1>"
    
    @http.route("/chat", methods=["POST", "GET"], auth="none", cors="*", csrf=False)
    def unsubscribe_employee(self, **kwargs):
        print('Twilio message received!', request.httprequest.form,'ffffffffffffffffff',kwargs.get('Body'))
        return "<h1>Error: Invalid request.</h1>"
    
