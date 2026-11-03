from odoo import fields, models,api, _
from datetime import date
import time
import base64
from odoo.exceptions import ValidationError

class HrSendLetter(models.Model):
    """ Send Letter"""
    _name = "hr.send.letter"


    name = fields.Char(string="name")
    email = fields.Char('Email')
    pay_period = fields.Selection(
        [('monthly', 'Monthly'), ('quarterly', 'Quarterly'), ('yearly', 'Yearly')],
        string="Pay Period", default='monthly', required=True)
    salary = fields.Float("Salary")
    bonus = fields.Float("Bonus")
    incentive = fields.Float("Incentive")
    job_title = fields.Char("Job Title")
    date = fields.Date("date")
    company_id = fields.Many2one('res.company',"Company")
    parent_id = fields.Many2one("hr.employee",'parent')
    joining_date = fields.Date("Joining Date")

    def send_offer_letter(self):
        if self.email:
            report_template_id = self.env.ref('offer_letter.action_employee_offer_letter')._render_qweb_pdf(self.id)
            data_record = base64.b64encode(report_template_id[0])
            ir_values = {
                'name': "Employee Offer Letter",
                'type': 'binary',
                'datas': data_record,
                'store_fname': data_record,
                'mimetype': 'application/x-pdf',
            }
            data_id = self.env['ir.attachment'].create(ir_values)
            template = self.env.ref('offer_letter.send_email_offer_letter')
            template.attachment_ids = [(6, 0, [data_id.id])]
            email_values = {'email_to': self.email,
                            'email_from': 'hr@latitudetechnolabs.com'}
            template.send_mail(self.id, email_values=email_values, force_send=True)
            template.attachment_ids = [(3, data_id.id)]
            return True
        else:
            raise ValidationError("Enter Email to send Offer letter")
        
class HrExpirenceLetter(models.Model):
    _name = "hr.expirence.letter"

    name= fields.Char("Employee Name")
    designation = fields.Char('Designation')
    download_date = fields.Date('Download Date')
    email = fields.Char('Email')
    gender = fields.Selection([('his','His'),('her','Her')],'Gender')
    company_id = fields.Many2one('res.company','Company Address')
    start_date = fields.Date('Start Date')
    end_date = fields.Date('Last Working Day')

    def send_experience_letter(self):
        if self.email:
            report_template_id = self.env.ref('offer_letter.action_expirence_letter')._render_qweb_pdf(self.id)
            data_record = base64.b64encode(report_template_id[0])
            ir_values = {
                'name': "Employee Experience Letter",
                'type': 'binary',
                'datas': data_record,
                'store_fname': data_record,
                'mimetype': 'application/x-pdf',
            }
            data_id = self.env['ir.attachment'].create(ir_values)
            template = self.env.ref('offer_letter.send_email_experience_letter')
            template.attachment_ids = [(6, 0, [data_id.id])]
            email_values = {'email_to': self.email,
                            'email_from': 'hr@latitudetechnolabs.com'}
            template.send_mail(self.id, email_values=email_values, force_send=True)
            template.attachment_ids = [(3, data_id.id)]
            return True
        else:
            raise ValidationError("Configure Employee's Email to send Experience letter")

class HrEmployee(models.Model):
    _inherit = "hr.employee"

    last_day = fields.Date("Last Day")
    tag = fields.Char("Tag",compute='_compute_gender')
    tags = fields.Char("Tags",compute='_compute_gender')
    tages = fields.Char("Tags",compute='_compute_gender')

    @api.onchange('gender')
    def _compute_gender(self):
        for gender in self:
            if gender.gender == 'female':
                gender.tag = 'her'
                gender.tags = 'she'
                gender.tages = 'her'
            else:
                gender.tag = 'him'
                gender.tags = 'he'
                gender.tages = 'his'
            

class ResCompany(models.Model):
    _inherit = 'res.company'


    sign = fields.Binary('Signature')
    header_img = fields.Binary('Header Image')



