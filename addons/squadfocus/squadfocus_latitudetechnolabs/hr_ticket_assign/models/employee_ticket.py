from odoo import fields, models,api, _
from odoo.exceptions import ValidationError
from datetime import date,timedelta


class EmployeeTicket(models.Model):
    """ Employee Ticket Assign """
    _name = "employee.ticket"
    _rec_name = 'user_id'

    topic = fields.Selection([('general','General Enquiry'),('hr_related','HR Related'),
                ('jupiter','HR Related/Jupiter Account Related'),('hr_related','HR Related/Nova Health Insurance Related'),('it_related','IT Department Help'),('access_issue','Report a Problem/Access Issue')],default = 'general')
    user_id = fields.Many2one('res.users',string='Created By',readonly=True)
    issue = fields.Html('Issue',required=True)
    state = fields.Selection([('submit','Submitted'),('solve','Solved')],default = 'submit')
    create_date = fields.Datetime("Creation Date",readonly=True)
    solve_date = fields.Datetime("Solved Date",readonly=True)
    description = fields.Binary('Image',attachment=True)
    reassign_to = fields.Many2one('hr.employee',string="ReAssign To",domain="[('job_title', 'in', ['Odoo Developer'])]")
    is_reassign = fields.Boolean('is Reassign',default=False)
    reassign_date = fields.Date('Reassign Date')
    

    def issue_solve(self):
        for rec in self:
            rec.solve_date = date.today()
            rec.state = 'solve'

    def reassign_issue(self):
        self.reassign_date = date.today()
        sub = self.env.user.employee_id.name + ' assigned you a Ticket.'
        body = """<html lang="en">
                    <body>
                        <div>
                            
                            </br>
                            <p>This mail is regarding """ + self.user_id.employee_id.name + """  raised a ticket .</p>
                            """+ """ <p> reason :"""+self.issue+"""</p>"""+""" <p>Create Date :"""+str(self.create_date)+"""</p>"""
        body += """
                    </div>
                        <p>Thank you</p>
                    </div>
                </body>
                    </html>"""
        vals = {
                'subject': sub,
                'body_html' : body,
                'email_from' :'hr@latitudetechnolabs.com',
                'email_to':  'rashmiranjan.s@latitudetechnolabs.org',
                'auto_delete': False,
                    }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()
    
  
    @api.model
    def create(self,vals):
        vals['user_id']=self.env.user.id
        vals['create_date'] = date.today()
        
        sub = self.env.user.employee_id.name + ' created a New issue in odoo.'
        body = """<html lang="en">
                    <body>
                        <div>
                            
                            </br>
                            <p>This mail is regarding """ + self.env.user.employee_id.name + """  raised a ticket .</p>
                            """+ """ <p> reason :"""+vals['issue']+"""</p>"""+""" <p>Create Date :"""+str(date.today())+"""</p>"""
        body += """
                    </div>
                        <p>Thank you</p>
                    </div>
                </body>
                    </html>"""
        if vals['topic'] == 'it_related':
            mail_vals = {
                'subject': sub,
                'body_html' : body,
                'email_from' :self.env.user.employee_id.work_email or 'aarti@latitudetechnolabs.com',
                'email_to':  'smit.p@latitudetechnolabs.org',
                'auto_delete': False,
                    }
        else:
            mail_vals = {
                'subject': sub,
                'body_html' : body,
                'email_from' :self.env.user.employee_id.work_email or 'aarti@latitudetechnolabs.com',
                'email_to':  'hr@latitudetechnolabs.com',
                'auto_delete': False,
                    }
        mail_id = self.env['mail.mail'].sudo().create(mail_vals)
        mail_id.sudo().send()
    
        result = super(EmployeeTicket, self).create(vals)
        return result
    
    
    
    def unlink(self):
        if self.state == "solve" or self.state == "submit":
            is_admin = self.env.user.has_group('hr.group_hr_manager')  
            if not is_admin:
                raise ValidationError(('You cannot Delete Issue once state is Submitted or Solved'))
        return super(EmployeeTicket, self).unlink()
    
    