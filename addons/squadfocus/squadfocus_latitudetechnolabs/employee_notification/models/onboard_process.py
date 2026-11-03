from odoo import fields, models, api


class OnboardProcess(models.Model):
    _name  = 'onboard.process'

    name = fields.Many2one('hr.employee','Employee Name')
    probability = fields.Float('Onboarding Percentage',compute='_compute_percentage',readonly = True)
    odoo_access = fields.Boolean('Odoo access need to give ( Documents verification )')
    it_department = fields.Boolean('Confirm about IT Department process (Skype ID, Mail id,OS Ticketing system,Company Rules regulation explained)')
    announcement = fields.Boolean('Welcome announcement on odoo.')
    verification = fields.Boolean('Documents verification on Odoo')
    food = fields.Boolean('Food order ( Lunch Thali + Jain + Non-Jain )')
    employee_details = fields.Boolean('Basic details of employee ( For Employee details sheet )')
    jupiter = fields.Boolean('Jupiter bank account opening (Federal  Bank )')
    pf = fields.Boolean('Form 11(PF) needs to get acknowledge')
    whatsapp = fields.Boolean('Whatsapp group invitation to employee ( Latitude Technolabs group )')
    mentor = fields.Boolean('Ping @Dharak Darji for assigning Mentor to employee')
    nda_sign = fields.Boolean('NDA Sign')
    letter = fields.Boolean('Welcome Letter form CEO')
    welcome_kit = fields.Boolean('Welcome Kit')
    linkedin = fields.Boolean('Onboarded post of linkedIn')

    @api.depends('odoo_access','it_department','announcement','verification','food','employee_details','jupiter','pf','whatsapp','mentor','nda_sign','letter','welcome_kit','linkedin')
    def _compute_percentage(self):
        for res in self: 
            percentage = 0
            field = [res.odoo_access,res.it_department,res.announcement,res.verification,res.food,res.employee_details,res.jupiter,res.pf,res.whatsapp,res.mentor,res.nda_sign,res.letter,res.welcome_kit,res.linkedin]
            value = 100/len(field)
            for rec in field:
                if rec:
                    percentage = percentage+value
            res.probability = percentage
