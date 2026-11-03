from odoo import fields, models,api, _
from odoo.exceptions import ValidationError


class EquipmentCategory(models.Model):
    """ Equipment Category"""
    _name = "equipment.category"

    name = fields.Char('Product Name')
    category = fields.Selection([('laptop','Laptop'),('mouse','Mouse'),('keyboard','Keyboard'),
                                 ('screen','Screen'),('headphone','Headphone'),('cpu','CPU'),
                                 ('webcam','Webcam'),('others','Others'),],string = 'Category')
    quantity = fields.Integer('Total Quantity',compute = 'get_stock_quantity')
    avail_quantity = fields.Integer('Available Quantity',compute = 'get_available_quantity')
    tag_code  = fields.Char('Latitude Tagging No')

    @api.onchange('name')
    def get_available_quantity(self):
        for rec in self:
            count = self.env['equipment.details'].search_count([('category.name', '=', rec.name),('state', '=', 'available')])
            rec.avail_quantity = count

    @api.depends('name')
    def get_stock_quantity(self):
        for rec in self:

            count = self.env['equipment.details'].search_count([('category.name', '=', rec.name)])
            self.quantity = count
    
    @api.onchange('category')
    def get_name(self):
        self.name = self.category

    def action_open_filtered_records(self):
        return {
            'name': _('Filtered Records'),
            'type': 'ir.actions.act_window',
            'res_model': 'equipment.details', 
            'view_mode': 'tree,form',
            'domain': [('category.name', '=', self.name)],
            'context': {'search_default_category_id': 1}, 
        }


class EquipmentDetails(models.Model):

    """ Equipment Details"""
    _name = "equipment.details"


    name = fields.Char('Full Latitude Tagging Code',compute='get_full_tagging',store=True)
    tag_no = fields.Char('Latitude Tagging No')
    tagging_name = fields.Char('Tagging Name')
    comp_name = fields.Char('Asset Company Name')
    category = fields.Many2one('equipment.category',string='Category')
    details = fields.Char('Product Name')
    serial_no = fields.Char('Seriel No')
    processor = fields.Char('Processor')
    ram = fields.Char('RAM')
    rom = fields.Char('ROM')
    use_by = fields.Many2one('hr.employee','Use By',default = False)
    asset_id = fields.Many2one('asset.details')
    state = fields.Selection([('not_available','Not Available'),('available','Available'),('rejected','Rejected')],default='available')
    
    @api.depends('category', 'tag_no')
    def get_full_tagging(self):
        for rec in self:
            if rec.category.tag_code == False:
                rec.name = rec.details
            elif rec.category.tag_code and rec.tag_no:
                rec.name = rec.category.tag_code + str(rec.tag_no)

    @api.onchange('category')
    def get_tagging(self):
        for rec in self:
            if rec.category:
                rec.tagging_name = rec.category.tag_code

    def set_reject(self):
        for rec in self:
            rec.state = 'rejected'

    def set_available(self):
        for rec in self:
            rec.state = 'available'
        
