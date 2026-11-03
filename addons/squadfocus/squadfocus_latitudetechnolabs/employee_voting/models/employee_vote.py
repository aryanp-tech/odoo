from odoo import fields, models,api, _
from odoo.exceptions import ValidationError
from datetime import date,datetime


class EmployeeVoting(models.Model):
    """ Employee Voting """
    _name = "employee.voting"

    name = fields.Many2one('hr.employee',string="Employee Name",required=True)
    user_id = fields.Many2one('res.users',string='Created By',readonly=True)
    description = fields.Text('Description',required=True)
    state = fields.Selection([('draft','Draft'),('submit','Submitted')],default = 'draft')
    create_date = fields.Date("Creation Date",readonly=True)

    def vote_submit(self):
        for rec in self:
            rec.state = 'submit'

    @api.onchange('name','description')
    def change_name(self):
        for rec in self:
            if rec.env.user.employee_id == rec.name:
                raise ValidationError(('You Cannot Give your Own Feedback'))
            if rec.state == 'submit':
                raise ValidationError(('Sorry You cannot change name or description once form submitted'))
    @api.model
    def create(self,vals):
        vote = self.env['employee.voting'].search([('user_id','=',self.env.user.id),('create_date', '=', date.today())])
        if vote:
            raise ValidationError(('Sorry You cannot vote more than one in a single day'))
        else:
            vals['user_id']=self.env.user.id
            vals['create_date'] = date.today()
        result = super(EmployeeVoting, self).create(vals)
        return result
    
    def unlink(self):
        if self.state == "submit":
            is_admin = self.env.user.has_group('employee_voting.group_employee_voting_admin')  
            if not is_admin:
                raise ValidationError(('Sorry You cannot Delete once vote Submit'))
        return super(EmployeeVoting, self).unlink()
