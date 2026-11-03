from odoo import fields, models,api 
from odoo.exceptions import ValidationError
import base64

class ProbationEmpployees(models.Model):
    _name = 'probation.employee'

    name = fields.Many2one('hr.employee','Employee Name')
    manager_id = fields.Many2one('hr.employee','Manager')
    survey_id = fields.Many2one('survey.survey','Survey Form')
    state = fields.Selection([('draft','Draft'),('mail','Sent Mail'),('meeting','Meeting Done'),('done','Employee Acknowledged'),('rejected','Rejected'),('extend','Probation Extend'),('terminate','Terminated')],default='draft')
    job_title = fields.Char('Job Title')
    department = fields.Many2one('hr.department','Department')
    joining_date = fields.Date('Date of Joining')
    review_from = fields.Date('Review From')
    review_to = fields.Date('Review To')
    prob_count_survey = fields.Integer(string="Count Answers", compute="_compute_completed_survey")
    confirmed_by = fields.Many2one('res.users','Confirmed By')
    probation_period = fields.Integer('Probation Periods')
    extend_date = fields.Date('Probation Extend To')
    extend_period = fields.Integer('Probation Extend Periods')
    reason = fields.Html('Reason')
    is_extend = fields.Boolean('Is Extend',default=False)
    terminate_date = fields.Date('Terminate Date')
    terminate_reason = fields.Text('Terminate Reason')
    last_work_date = fields.Date('Last Working Date')
    is_terminate = fields.Boolean('Is Terminated',default = False)
    def action_survey_answers(self):
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
            'domain': [('state', '=', 'done'), ('probation_id', '=', self.ids[0])],
        }
    
    @api.onchange('name')
    def get_manager(self):
        if self.state != 'draft':
            raise ValidationError("You can't Change Name ")
        self.manager_id = self.name.parent_id.id
        self.department = self.name.department_id.id
        self.job_title = self.name.job_title
        self.joining_date = self.name.joining_date
    
    @api.onchange('review_from','review_to',)
    def get_change_date(self):
        if self.state != 'draft':
            raise ValidationError("You can't Change date")

    def unlink(self):
        for rec in self:
            if rec.state != 'validate':
                raise ValidationError("You can't Delete Processing Record")
        return super(ProbationEmpployees, self).unlink()
    
    def _compute_completed_survey(self):
        for rec in self:
            answers = self.env['survey.user_input'].search([('state', '=', 'done'), ('probation_id', '=', rec.id)])
            rec.prob_count_survey = len(answers)

    def action_done(self):
        view_id = self.env.ref('probation_confirmation.view_confirmation_probation_wizard_form').id
        return {
            'name': 'Confirmation',
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'probation.confirmation',
            'view_id': view_id,
            'target': 'new',
            'context': {'default_message': 'Are you sure you want to proceed?'},
        }

    def action_sent_mail(self):
        survey_id = self.survey_id
        baseurl = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        response = survey_id._create_answer(survey_id=self.survey_id.id,
                                            partner=self.manager_id.user_id.partner_id,
                                            email=self.manager_id.work_email, probation_id=self.ids[0])
        url = response.get_start_url()
        mail_content = "Dear " + self.manager_id.name + "," + "<br>Please fill out the following survey " \
                                                                "related to " + self.name.name + "<br>Click here to access the survey.<br>" + \
                               baseurl + str(url) + "<br>Post your feedback between : " \
                               + str(self.review_from)+"to "+ str(self.review_to)
        values = {'model': 'probation.employee', 'res_id': self.ids[0], 'subject': survey_id.title,
                    'body_html': mail_content, 'parent_id': None, 'email_from': 'hr@latitudetechnolabs.com' ,
                    'auto_delete': False, 'email_to': self.manager_id.work_email}
        result = self.env['mail.mail'].create(values)._send()
        self.state = 'mail'

    def meeting_done(self):
        self.state = 'meeting'

    def action_set_draft(self):
        self.state = 'draft'

    def action_reject(self):
        self.state = 'rejected'
    
    def probation_extend(self):
        view_id = self.env.ref('probation_confirmation.view_extend_probation_wizard_form').id
        return {
            'name': 'Extension',
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'probation.extend',
            'view_id': view_id,
            'target': 'new',
        }
    
    def terminate_wizard(self):
        view_id = self.env.ref('probation_confirmation.view_termination_confirmation_wizard_form').id
        return {
            'name': 'Terminate',
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'termination.confirmation',
            'view_id': view_id,
            'target': 'new',
        }

class TerminationConfirmation(models.TransientModel):
    _name = 'termination.confirmation'

    reason = fields.Html('Termination Reason')
    terminate_date = fields.Date('Extend To')
    last_working_date = fields.Date('Last Working Date')
    

    def termination_action(self):
        prob_emp = self.env['probation.employee'].browse(self.env.context.get('active_ids'))
        prob_emp.write({'state':'terminate','terminate_date':self.terminate_date,'terminate_reason':self.reason,'last_work_date':self.last_working_date,'is_terminate':True})
        report_template_id=self.env.ref('probation_confirmation.action_termination_confirmation')._render_qweb_pdf(self.env.context.get('active_ids'))
        data_record = base64.b64encode(report_template_id[0])
        ir_values = {
            'name': "Termination Letter",
            'type': 'binary',
            'datas': data_record,
            'store_fname': data_record,
            'mimetype': 'application/x-pdf',
            }
        data_id = self.env['ir.attachment'].create(ir_values)
        attachment_ids = [(6, 0, [data_id.id])]
        mail_content = "Dear " + prob_emp.name.name + "," + "<br>I hope this email finds you well.<br> Following our previous communications regarding your probationary period and subsequent extensions, I regret to inform you that your employment with"+prob_emp.name.company_id.name+". is being terminated effective "+str(self.last_working_date)+" after office hours.<br>As per our discussions and reviews, it has been observed that your performance during the probationary period and subsequent extensions did not meet the expectations set by the management. Despite our efforts to provide support and guidance, we have not seen the desired improvement in your performance.<br>Should you have any queries or require further clarification regarding this matter, please do not hesitate to reach out to the HR department.<br>We wish you the best in your future endeavors." 
        values = {'model': 'probation.employee', 'subject': 'Termination of Employment',               'attachment_ids':attachment_ids,'body_html': mail_content, 'parent_id': None,
            'email_from': 'hr@latitudetechnolabs.com','auto_delete': False, 'email_to':prob_emp.name.work_email}
        result = self.env['mail.mail'].create(values)._send()
        return {'type': 'ir.actions.act_window_close'}
    
class ProbationConfirmation(models.TransientModel):
    _name = 'probation.confirmation'

    message = fields.Text('Confirmation Message',readonly=True)

    def confirm_action(self):
        prob_emp = self.env['probation.employee'].browse(self.env.context.get('active_ids'))
        prob_emp.write({'state':'done','confirmed_by':self.env.user.id})
        report_template_id=self.env.ref('probation_confirmation.action_probation_confirmation')._render_qweb_pdf(self.env.context.get('active_ids'))
        data_record = base64.b64encode(report_template_id[0])
        ir_values = {
            'name': "Probation Confirmation Letter",
            'type': 'binary',
            'datas': data_record,
            'store_fname': data_record,
            'mimetype': 'application/x-pdf',
            }
        data_id = self.env['ir.attachment'].create(ir_values)
        attachment_ids = [(6, 0, [data_id.id])]
        mail_content = "Dear " + prob_emp.name.name + "," + "<br>I hope this email finds you well.<br> We are pleased to inform you that following the completion of your "+str(prob_emp.probation_period)+"month probation period at "+prob_emp.name.company_id.name+" the management has conducted a thorough review of your performance. We are pleased to note that your performance has been satisfactory.<br>Your confirmation Letter attached below<br>Thank you" 
        values = {'model': 'probation.employee', 'subject': 'Confirmation of Employment',               'attachment_ids':attachment_ids,'body_html': mail_content, 'parent_id': None,
            'email_from': 'hr@latitudetechnolabs.com','auto_delete': False, 'email_to':prob_emp.name.work_email}
        result = self.env['mail.mail'].create(values)._send()
        return {'type': 'ir.actions.act_window_close'}


class ProbationExtend(models.TransientModel):
    _name = 'probation.extend'

    reason = fields.Html('Extend Reason')
    extend_to = fields.Date('Extend To')
    extend_period = fields.Integer('Probation Extend Periods')

    def extend_action(self):
        prob_emp = self.env['probation.employee'].browse(self.env.context.get('active_ids'))
        prob_emp.write({'state':'extend','extend_date':self.extend_to,'reason':self.reason,'is_extend':True,'extend_period':self.extend_period})
        report_template_id=self.env.ref('probation_confirmation.action_probation_extend')._render_qweb_pdf(self.env.context.get('active_ids'))
        data_record = base64.b64encode(report_template_id[0])
        ir_values = {
            'name': "Probation Extension Letter",
            'type': 'binary',
            'datas': data_record,
            'store_fname': data_record,
            'mimetype': 'application/x-pdf',
            }
        data_id = self.env['ir.attachment'].create(ir_values)
        attachment_ids = [(6, 0, [data_id.id])]
        mail_content = "Dear " + prob_emp.name.name + "," + "<br>I hope this email finds you well.<br>I am writing to inform you that the completion of your "+str(prob_emp.probation_period)+"-month probation period has been assessed by your Team Lead. Unfortunately, based on the evaluation, it has been determined that your performance during this period has not met the expected standards.As a result, the management has decided to extend your probation period by an additional "+ str(self.extend_period) +" months. Your probationary period will now end on "+str(self.extend_to)+".We understand that this may come as disappointing news, but please consider this as an opportunity for further improvement and growth. Your Team Lead will continue to provide you with guidance and support during this time.If you have any questions or require clarification regarding this decision, please feel free to reach out to me or your Team Lead.<br>Thank you for your understanding and cooperation.<br>" 
                               
        values = {'model': 'probation.employee', 'attachment_ids':attachment_ids,'res_id': self.ids[0], 'subject': 'Extension of Probation Period',
                    'body_html': mail_content, 'parent_id': None, 'email_from': 'hr@latitudetechnolabs.com' ,
                    'auto_delete': False, 'email_to': prob_emp.name.work_email}
        result = self.env['mail.mail'].create(values)._send()
        return {'type': 'ir.actions.act_window_close'}