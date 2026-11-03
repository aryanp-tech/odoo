from odoo import api, fields, models


class Applicant(models.Model):
    _inherit = "hr.applicant"


    last_name = fields.Char(string="Last Name")
    year_of_exp = fields.Selection([
        ('fresher', 'Fresher'),
        ('6_months_or_above', '6 Month and Above'),
        ('1_year_and_above', '1 Year and Above'),
        ('2_year_and_above', '2 year and Above'),
        ('3_year_and_above', '3 year and Above'),
        ('4_year_and_above', '4 year and Above'),
        ('5_year_and_above', '5 year and Above'),
        ('6_year_and_above', '6 year and Above'),
        ('7_year_and_above', '7 year and Above'),
        ('8_year_and_above', '8 year and Above'),
        ('9_year_and_above', '9 year and Above'),
        ('10_year_and_above', '10 year and Above'),

    ],'Year Of Experience', default='fresher')
    ctc_salary = fields.Float("CTC Salary", tracking=True)
    linkedin_profile = fields.Char("Linkedin Profile")
    attachment_url = fields.Char("Resume Url")


class Attachment(models.Model):
    _inherit = 'ir.attachment'    
