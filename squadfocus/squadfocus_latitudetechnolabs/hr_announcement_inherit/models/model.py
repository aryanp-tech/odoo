from odoo import api, fields, models

class HrAnnouncementTable(models.Model):
    _inherit = 'hr.announcement'

    requested_date = fields.Date(default=fields.Date.context_today)
    date_start = fields.Date(default=fields.Date.context_today)
    date_end = fields.Date(default=fields.Date.context_today)

    def approve(self):
        if self.state:
            body = """<html lang="en">
                                            <body>
                                                <div>
                                                    
                                                    </br>
                                                    <div class="table-responsive">
                                                    <p>Dear All, </p>
                                                    <p>Hope you all are doing well, </p>
                                                    <p>This is just to inform you all. We will have """ + self.announcement_reason + """ on  """ +str(self.date_start)+ """</p>
                                                    <p>Thanks & Regards</p>
                                                    <p>HR Department</p>
                                        <tbody>"""
            vals = {
                                        'subject': 'General Announcement',
                                        'body_html' : body,
                                        'email_from' : 'aarti@latitudetechnolabs.com',
                                        'email_to':  'staff@latitudetechnolabs.com,staff@latitudetechnolabs.org',
                                        'auto_delete': False,
                                        }   
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
            self.state = 'approved'