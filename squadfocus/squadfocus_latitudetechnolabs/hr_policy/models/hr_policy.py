from odoo import models,fields,api,_
from odoo.exceptions import UserError


class HrPolicy(models.Model):
    _name = 'hr.policy'

    name = fields.Char('Name')
    policy = fields.Html('Policy')
    acknowledgement_ids = fields.One2many('hr.policy.acknowledgment', 'policy_id', string='Acknowledgements')
    is_acknowledged = fields.Boolean('Is Acknowledged', compute='_compute_is_acknowledged')

    @api.depends('acknowledgement_ids')
    def _compute_is_acknowledged(self):
        for policy in self:
            policy.is_acknowledged = self.env['hr.policy.acknowledgment'].search_count([
                ('policy_id', '=', policy.id),
                ('employee_id', '=', self.env.user.employee_id.id)
            ]) > 0

    def action_acknowledge(self):
        acknowledgment = self.env['hr.policy.acknowledgment'].search([
            ('policy_id', '=', self.id),
            ('employee_id', '=', self.env.user.employee_id.id)
        ])
        if acknowledgment:
            raise UserError('You have already acknowledged this policy.')
        self.env['hr.policy.acknowledgment'].create({
            'policy_id': self.id,
            'employee_id': self.env.user.employee_id.id
        })
        return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'type': 'success',
                    'message': _("Policy acknowledged successfully!"),
                    'next': {'type': 'ir.actions.act_window_close'},
                }
            }
class HrPolicyAcknowledgment(models.Model):
    _name = 'hr.policy.acknowledgment'
    _description = 'HR Policy Acknowledgment'

    policy_id = fields.Many2one('hr.policy', string='Policy', required=True)
    employee_id = fields.Many2one('hr.employee', string='Employee', required=True)
    acknowledged_date = fields.Datetime('Acknowledged Date', default=fields.Datetime.now)