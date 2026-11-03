from odoo import fields, models,api, _
from odoo.exceptions import ValidationError
from datetime import date,timedelta


class ServerIssue(models.Model):
    """ Server Issue """
    _name = "server.issue"

    name = fields.Many2one('hr.employee',string="Assign To",required=True, domain="[('department_id.name', 'in', ['Linux','Devops'])]")
    reassign_to = fields.Many2one('hr.employee',string="ReAssign To",domain="[('department_id.name', 'in', ['Linux','Devops'])]")
    is_reassign = fields.Boolean('is Reassign',default=False)
    user_id = fields.Many2one('res.users',string='Created By',readonly=True)
    issue = fields.Text('Issue',required=True)
    state = fields.Selection([('submit','Submitted'),('reassign','Reassigned'),('solve','Solved')],default = 'submit')
    error =  fields.Binary(string="Attach Issue" , attachment=True)
    create_date = fields.Datetime("Creation Date",readonly=True)
    solve_date = fields.Datetime("Solved Date",readonly=True)
    solve_by = fields.Many2one('res.users',string='Solved By',readonly=True)
    reassign_date = fields.Datetime("Reassign Date",readonly=True)
    description = fields.Html('Description')
    project_id = fields.Many2one('project.project','Project')
    ip_address = fields.Char('Server Ip Address')
    priority = fields.Selection([
        ('0', 'Normal'),
        ('1', 'Low'),
        ('2', 'High'),
        ('3', 'Very High')], string="Priority", help='Gives the Priority of Tasks.')

    def issue_solve(self):
        for rec in self:
            rec.solve_by=self.env.user.id
            rec.solve_date = date.today()
            rec.state = 'solve'

    def reassign_issue(self):
        self.reassign_date = date.today()
        self.state = 'reassign'
        sub = self.env.user.employee_id.name + ' assigned you a Ticket.'
        body = """<html lang="en">
                    <body>
                        <div>
                            
                            </br>
                            <p>This mail is regarding """ + self.name.name + """  raised a ticket .</p>
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
                'email_from' :self.env.user.employee_id.work_email or 'aarti@latitudetechnolabs.com',
                'email_to':  self.reassign_to.work_email,
                'auto_delete': False,
                    }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()

    @api.onchange('name','issue')
    def change_name(self):
        if self.state == 'solve':
            raise ValidationError(('Sorry You cannot change Assign TO or Issue once Issue Solved'))
    @api.model
    def create(self,vals):
        vals['user_id']=self.env.user.id
        vals['create_date'] = date.today()
        result = super(ServerIssue, self).create(vals)
        sub = self.env.user.employee_id.name + ' created a New issue in odoo.'
        body = """<html lang="en">
                    <body>
                        <div>
                            
                            </br>
                            <p>This mail is regarding """ + self.env.user.employee_id.name + """  raised a ticket .</p>
                            """+ """ <p> reason :"""+result.issue+"""</p>"""+""" <p>Create Date :"""+str(result.create_date)+"""</p>"""
        body += """
                    </div>
                        <p>Thank you</p>
                    </div>
                </body>
                    </html>"""
        vals = {
                'subject': sub,
                'body_html' : body,
                'email_from' :self.env.user.employee_id.work_email or 'aarti@latitudetechnolabs.com',
                'email_to':  result.name.work_email,
                'auto_delete': False,
                    }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()
        return result
    
    def unlink(self):
        if self.state == "solve" or self.state == "submit":
            is_admin = self.env.user.has_group('server_issues.group_server_issue_admin')  
            if not is_admin:
                raise ValidationError(('You cannot Delete Issue once state is Submitted or Solved'))
        return super(ServerIssue, self).unlink()
    
    def cron_pending_request(self):
        pending_request = self.env['server.issue'].search([('state', '!=', 'solve'), ('create_date', '<=', fields.Datetime.now() - timedelta(hours=24))])
        user_name = []
        for rec in pending_request:
            user_name.append(rec.user_id.name)
        users = self.env['res.users'].search([('groups_id', 'in', [self.env.ref('server_issues.group_server_issue_admin').id])])
        user_email = users.mapped('employee_id').mapped('work_email')
        hr_body = """<html lang="en">
                            <body>
                                <div>
                                    
                                    </br>
                                    <p>This mail is regarding Employee Who have raised ticket before 24hours but still not solved</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                        <thead>
                            <tr >
                                <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                
                            </tr>
                        </thead>
                        <tbody>"""
        for emp in user_name:
            hr_body += """<tr>
                <td style='border: 1px solid #ddd;padding: 10px;'>""" + emp+""" </td>"""
            hr_body += """
            </tr>"""
        hr_body += """</tbody>
            </table>
            </div>
                            <p>Thank you,</p>
                        </div>
                    </body>
                </html>"""
        vals = {
                'subject': 'Regarding server issue raised by Employee',
                'body_html' : hr_body,
                'email_from' :'aarti@latitudetechnolabs.com',
                'email_to': user_email,
                'auto_delete': False,
                    }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()

