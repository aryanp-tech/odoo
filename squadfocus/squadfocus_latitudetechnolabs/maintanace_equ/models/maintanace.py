
from odoo import api, fields, models, tools


class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    ram = fields.Char("RAM")
    processor = fields.Char("PROCESSOR")
