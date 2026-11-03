from odoo import http
from odoo.http import request


class PublicAPIController(http.Controller):

    @http.route('/api/whatsapp/', methods=['GET'], auth='none', cors='*', csrf=False)
    def create_leave(self,**kwargs):
        challenge = kwargs.get('challenge')
        if challenge:
            return challenge
        return "Api Called"
        
       

