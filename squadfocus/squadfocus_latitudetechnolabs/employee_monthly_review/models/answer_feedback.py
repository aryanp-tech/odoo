from odoo import models,fields


class AnswerFeedback(models.Model):
    
    _name = 'answer.feedback'


    name = fields.Many2one('hr.employee','Name')
    feedback = fields.Html('Feedback')
    parent_id = fields.Many2one('hr.employee','Parent Name')
    state = fields.Selection([('draft','Draft'),('done','Done')],default='draft')

    def set_done(self):
        self.state ='done'