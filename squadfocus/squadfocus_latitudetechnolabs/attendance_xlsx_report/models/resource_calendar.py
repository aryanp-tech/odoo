from odoo import fields, models,api 


class ResourceCalender(models.Model):
    _inherit = 'resource.calendar'

    start_hour = fields.Float('Start From')
    