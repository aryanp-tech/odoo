from odoo import fields, models,api
from datetime import datetime, timedelta


class HrEmployee(models.Model):
    _name = 'employee.feedback'

    name = fields.Many2one('hr.employee','Employee Name')
    lead_id = fields.Many2one('hr.employee','Tech Lead')
    survey_id = fields.Many2one('survey.survey',"Survey Id")
    expiry_date = fields.Date('Expiry Date')
    create_date = fields.Date('Create Date')
    emp_count_survey = fields.Integer(string="Count Answers", compute="_compute_completed_survey")

    def action_employee_feedback(self):
        tree_res = self.env['ir.model.data'].get_object_reference('survey', 'survey_user_input_view_tree')
        tree_id = tree_res and tree_res[1] or False
        form_res = self.env['ir.model.data'].get_object_reference('survey', 'survey_user_input_view_form')
        form_id = form_res and form_res[1] or False
        return {
            'model': 'ir.actions.act_window',
            'name': 'Answers',
            'type': 'ir.actions.act_window',
            'view_mode': 'form,tree',
            'res_model': 'survey.user_input',
            'views': [(tree_id, 'tree'), (form_id, 'form')],
            'domain': [('state', '=', 'done'), ('feedback_id', '=', self.ids[0])],
        }
    def _compute_completed_survey(self):
        for rec in self:
            answers = self.env['survey.user_input'].search([('state', '=', 'done'), ('feedback_id', '=', rec.id)])
            rec.emp_count_survey = len(answers)
    def cron_manager_feedback(self):
        employees = self.env['hr.employee'].search([])
        for rec in employees:
            if rec.lead_id.user_id.partner_id:
                survey = self.env['survey.survey'].search([('title','=','Weekly Feedback')])
                feedback = self.env['employee.feedback'].create({'name':rec.id,'lead_id':rec.lead_id.id,'survey_id':survey.id,'create_date':datetime.now().date(),
                                                      'expiry_date':datetime.now().date() + timedelta(days=7)})
                baseurl = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
                response = survey._create_answer(survey_id=feedback.survey_id.id,
                                                    partner=feedback.lead_id.user_id.partner_id,
                                                    deadline=feedback.expiry_date,
                                                    email=feedback.lead_id.work_email, feedback_id=feedback.ids[0])
                url = response.get_start_url()
                mail_content = "Dear " + feedback.lead_id.name + "," + "<br>Please fill out the following survey " \
                                                                        "related to " + feedback.name.name + "<br>Click here to access the survey.<br>" + \
                                    baseurl + str(url) + "<br>Post your response till : " \
                                    + str(feedback.expiry_date)+"<br>Click here to Unsubscribe.<br>"+baseurl+'/unsubscribe/?feed_id='+str(feedback.id)
                values = {'model': 'employee.feedback', 'res_id': feedback.ids[0], 'subject': survey.title+'for '+feedback.name.name,
                            'body_html': mail_content, 'parent_id': None, 'email_from': 'hr@latitudetechnolabs.com' ,
                            'auto_delete': False, 'email_to': feedback.lead_id.work_email}
                result = self.env['mail.mail'].create(values)._send()



