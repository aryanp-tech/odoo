from odoo import api, fields, models, tools, SUPERUSER_ID


class BussinessDevelopment(models.Model):
    _name = "bussiness.development"
    _description = "BDE"

    parent_id = fields.Many2one('hr.employee', 'Employee', store=True, readonly=False)
    department_id = fields.Many2one('hr.department', 'Department',related='parent_id.department_id')
    description = fields.Text("Description")
    user_id = fields.Many2one('hr.employee',"Recruiter")
    client = fields.Char('Client')
    state = fields.Selection([('first_interview', 'First Interview'), ('second_interview', 'Second Interview'), ('rejected', 'Rejected'), ('hired', 'Hired')],
        string='Status', required=True, tracking=True,  default='draft')
    