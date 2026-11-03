from odoo import models,fields


class MonthlyFeedback(models.Model):

    _name = 'monthly.feedback'

    name = fields.Many2one('hr.employee','Name')
    create_date = fields.Date('Created Date')
    employee_ids = fields.Many2many('hr.employee',string='Employees')
    state = fields.Selection([('draft','Draft'),('done','Done')],default='draft')

    def set_done(self):
        for employee in self.employee_ids:
            answer = self.env['answer.feedback'].create({'name':employee.id,'parent_id':self.name.id})

    def action_answer_feedback(self):
        
        return {
            'model': 'ir.actions.act_window',
            'name': 'Answers',
            'type': 'ir.actions.act_window',
            'view_mode': 'tree,form',
            'res_model': 'answer.feedback',
            'domain': [('parent_id', '=', self.name.id)],
        }