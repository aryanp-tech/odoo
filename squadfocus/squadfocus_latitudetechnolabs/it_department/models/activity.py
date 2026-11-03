from odoo import fields, models


class EquipementActivity(models.Model):

    _name = 'equipment.activity'

    name = fields.Many2one('equipment.category','Category')
    equipment = fields.Many2one('equipment.details','Product Name')
    employee_id = fields.Many2one('hr.employee','Employee Name')
    job_title = fields.Char('Designation')
    assign_date = fields.Datetime(string='Assign Date', required=True, default=fields.Datetime.now)
    responsible = fields.Many2one('hr.employee','Tech')
    reason = fields.Char('Remark')
    prod_from = fields.Selection([('employee','Employee'),('it_department','IT Department'),('vendor','Vendor'),('owner','Owner')],'Product From')
    prod_to = fields.Selection([('employee','Employee'),('it_department','IT Department'),('vendor','Vendor'),('owner','Owner')],'Product To')
    from_employee = fields.Many2one('hr.employee','Employee From')
    to_employee = fields.Many2one('hr.employee','Employee To')
    serial_no = fields.Char('Serial No')
    quantity = fields.Integer('Quantity',default=1)



