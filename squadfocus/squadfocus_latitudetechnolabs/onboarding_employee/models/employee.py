from odoo import fields, models,api
from odoo.http import request
from datetime import date


class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    read_only = fields.Boolean(compute="get_user", default=True)

    @api.depends('read_only')
    def get_user(self):
        if self.env.user.has_group('hr.group_hr_manager'):
            self.read_only = True
        else:
            self.read_only = False

    pf_account = fields.Boolean(default='no', string="PF Account")
    uan  = fields.Text(string='Universal Account No')
    image_1920 = fields.Binary("image")
    pan_img = fields.Binary('Pancard')
    aadhar_img = fields.Binary("Aadhar")
    mark_sheet = fields.Binary("10th Marksheet")
    mark_sheet_12 =  fields.Binary("12th Marksheet")
    graduation =  fields.Binary("Graduation or Post Graduation Certificate/Diploma Certificate")
    postgraduation =  fields.Binary("Graduation or Post Graduation Marksheet/Diploma Final Marksheet")
    blood_group = fields.Selection([
        ('a_n','A-'),('a_p','A+'),('b_n','B-'),('b_p','B+'),('o_n','O-'),('o_p','O+'),('ab_n','AB-'),('ab_p','AB+')
    ],'Blood Group')
    form_filling_date = fields.Date(string="Date of Form Filling")
    interview_date = fields.Date(string="Interview Date")
    last_day = fields.Date(string="Last Day")
    employe_period = fields.Char(string="How long were you employed?")
    job_decription = fields.Char(string="Job Designation?")
    leaving = fields.Char(string="Why are you leaving?")
    experence = fields.Char(string="Would you describe your working relationship (with respect to both your particular job and your relationship with fellow workers) as pleasant or unpleasant? What did you like least about working here? What did you like about working here?")
    working_withus = fields.Char(string="Do you feel that your particular job was important and significant in the overall operation of the business? Do you feel you were treated fairly while working with us ?")
    advancement = fields.Char(string="How did you feel about your chances for advancement?")
    suggestions = fields.Char(string="Are there any particular or working conditions that either led to your decision to resign or that you feel are detrimental to a satisfactory working relationship? If so, have you any suggestions on how to eliminate them?")
    working_relationship = fields.Char(string="Are there any particular practices or working conditions that you feel are particularly beneficial to an effective working relationship and that should be maintained? What changes would have to take place for you to come back?")
    policies = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    fair = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    recognition = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    complaints =fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    information = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    busy = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    jobwell = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    Welcomes = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    discipline = fields.Selection([('alwayse', 'alwayse'), ('usually', 'usually'), ('sometime', 'sometime'),
                                     ('never', 'never')
                                     ], default='alwayse', string='Follow policies and procedures')
    department = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Cooperation/teamwork in the department')
    cooperation = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Cooperation with other departments')
    communications = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Communications')
    conditions = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Working Conditions')
    schedule = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Work Schedule')
    jobpay = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Rate of Pay for your job')
    accural = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Amount of paid leave accrual')
    culture = fields.Selection([('excellent', 'excellent'), ('good', 'good'), ('fair', 'fair'),
                                     ('poor', 'poor')
                                     ], default='excellent', string='Working Culture')                                    
    suggession = fields.Char(string="Would you care to make any other comments?")

    mouse = fields.Boolean(string="Mouse")
    keyboard = fields.Boolean(string="key Board")
    headphone = fields.Boolean(string="Head Phone")
    category = fields.Selection([('laptop', 'laptop'), ('desktop', 'desktop'), ('mackmini', 'mackmini'),
                                     ('imac', 'imac'),('laptopanddesktop','laptop and desktop')
                                     ], default='laptop', string='Equipment Category')
    aadhar_no = fields.Char('Aadhar Number')
    pan_no = fields.Char('Pan Number')


class ResUsers(models.Model):
    _inherit = 'res.users'
    onboarding_plan_sent = fields.Boolean()
    
    def action_onbording_process(self):
        user = request.env['res.users'].sudo().browse(request.session.uid)
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        url = base_url + "/employee/form"
        body = """<html lang="en">
                            <body>
                                <div>
                                    
                                    </br>
                                    <p>This mail is regarding Employee Onbording Process.</p>
                                    <p>dear """ + self.name+""" </p>
                                    <p> You have been invited by """ + user.name +""" </p>
                        <tbody>"""
        body += """<tr>
                        
                        <a href="""+ url +""">Accep Invitation</a>
                        </tr>"""
            
        vals = {
                    'subject': 'Employee Onbording Process',
                    'body_html' : body,
                    'email_from' : 'hr@latitudetechnolabs.com',
                    'email_to':  self.email,
                    'auto_delete': False,
                    }   
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()
        self.onboarding_plan_sent = True
        return True

    def action_resignation_process(self):
        user = request.env['res.users'].sudo().browse(request.session.uid)
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        url = base_url + "/employee/resignation"
        url1 = base_url + "/employee/companyproperty"
        body = """<html lang="en">
                            <body>
                                <div>
                                    
                                    </br>
                                    <p>This mail is regarding Employee resignation Process.</p>
                                    <p>dear """ + self.name+""" </p>
                                    <p> You have been invited by """ + user.name +""" </p>
                        <tbody>"""
        body += """<tr>
                        <a href="""+ url +""">Accep Resignation</a>
                    </tr>
                    <tr>
                         <a href="""+ url1 +""">hardware detail</a>
                    </tr>"""
            
        vals = {
                    'subject': 'Employee Onbording Process',
                    'body_html' : body,
                    'email_from' : 'hr@latitudetechnolabs.com',
                    'email_to':  self.email,
                    'auto_delete': False,
                    }   
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()
        return True

class HrResignation(models.Model):
    _inherit = 'hr.resignation'

    @api.onchange('state')
    def onchange_state(self):
        match = self.search([('state', '=', 'approve')])
        list_employee = []
        for i in match:
            if i.approved_revealing_date == date.today():
                list_employee.append(i)
                if list_employee:
                    body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>This mail is regarding Employee resignation request approve.</p>
                                            <div class="table-responsive">
                                            <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                                <thead>
                                    <tr >
                                        <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>"""
        for emp in list_employee:
                body += """<tr>
                                <td style='border: 1px solid #ddd;padding: 10px;'>""" + emp.employee_id.name+""" </td>"""        
        vals = {
                'subject': 'Employee resignation request approve.',
                'body_html' : body,
                'email_from' :'hr@latitudetechnolabs.com',
                'email_to':  'hr@latitudetechnolabs.com ',
                'auto_delete': False,
            }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()
