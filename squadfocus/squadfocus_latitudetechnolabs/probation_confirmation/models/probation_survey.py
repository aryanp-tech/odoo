from odoo import models, fields, api


class SurveyUserInput(models.Model):
    _inherit = 'survey.user_input'

    probation_id = fields.Many2one('probation.employee', string="Probation id",
                                   default=lambda self: self.env.context.get('active_id'))

    @api.model
    def create(self, vals):
        ctx = self.env.context
        if ctx.get('active_id') and ctx.get('active_model') == 'probation.employee':
            vals['probation_id'] = ctx.get('active_id')

        return super(SurveyUserInput, self).create(vals)
