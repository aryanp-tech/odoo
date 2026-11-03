from odoo import fields, models,api


class EmployeeResource(models.Model):
    _name = "employee.resource"

    name = fields.Many2one('hr.employee',string="Employee Name",required=True)
    department = fields.Many2one('hr.department',string="Department")
    gross_salary = fields.Integer('Gross Salary With Bonus')
    next_appraisal = fields.Date('Next appraisal')
    is_dedicate = fields.Boolean('Is Dedicated')
    company_name = fields.Char('Company Name')
    price = fields.Integer('Price')
    start_date = fields.Date('Start Date')
    end_date = fields.Date('End Date')
    work_order = fields.Char('Work Order ')
    project = fields.Many2many('project.project',string='Projects')

    @api.onchange('name')
    def get_department(self):
        for rec in self:
            rec.department = rec.name.department_id