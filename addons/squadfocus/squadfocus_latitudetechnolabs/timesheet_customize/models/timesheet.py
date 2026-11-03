from odoo import api, fields, models
from odoo.exceptions import AccessError, UserError
from datetime import timedelta , datetime
import time
from dateutil import parser
import pytz
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta



class AccountAnalyticLine(models.Model):
    _inherit = 'account.analytic.line'


    upload_file = fields.Binary(string="Upload File" , attachment=True)
    
    def send_email(self):
        datetime_obj = self.date
        if not self.employee_id:
            raise UserError("Please select employee First.")
        project = self.project_id
        if not project:
            raise UserError("Please select Project First.")
        if not self.task_id:
            raise UserError("Please select Task First.")  
              
        list1 = []
        email_to = "aarti@latitudetechnolabs.com"
        if project.user_id.active:
            email_to = project.user_id.login

        subject = "Employee  " + self.employee_id.name + " Submit The Timesheet. "
        for ta in self.task_id:
            list1.append(ta.name)
            val = ','.join(list1)
        body =  "Detail Of Timesheet: " "<br>Date: " + str(datetime_obj) + " <br>Project: " + self.project_id.name + " <br>Task: " + val + " <br>Description: " + self.name + " <br>Hours: " + str(self.unit_amount)

        vals = {
            'subject': subject,
            'body_html' : body,
            'email_from' : self.employee_id.work_email or 'aarti@latitudetechnolabs.com',
            'email_to':  email_to,
            'auto_delete': False,
        }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()
        if vals:
            return {
                'effect': {
                    'fadeout': 'slow',
                    'message': 'Timesheet Submit Successfully',
                    'type': 'rainbow_man',
                }
            }
        return True
        return True


    def _send_mail_cron(self):
        today = datetime.today()
        yesterday = today - timedelta(days = 1)
        email_to = "aarti@latitudetechnolabs.com"
        employees = self.env['hr.employee'].search([('active','!=', False)])
        timesheet = self.env['account.analytic.line'].search([('date','=',yesterday)])
        yes = datetime.now() - timedelta(days=1)
        now_utc = pytz.utc.localize(yes)
        now_utc_date = now_utc.date()
        list_of_employee = []
        for employee in employees:
            tz = pytz.timezone(employee.tz)
            now_tz = now_utc.astimezone(tz)
            start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)  # day start in the employee's timezone
            # start_naive = start_tz.astimezone(pytz.utc).replace(tzinfo=None)

            holidays = self.env['hr.leave'].sudo().search([
                ('employee_id', '=', employee.id),
                ('date_to', '>=', start_tz),
                ('state', 'not in', ('cancel', 'refuse'))
            ])
            
            is_absent = False
            for holiday in holidays:

                date_from = holiday.date_from.date()
                date_to = holiday.date_to.date()
                if date_from <= now_utc_date and date_to >= now_utc_date:
                    is_absent = True    
            
            if is_absent:
                list_of_employee.append(employee)
        times = timesheet.employee_id
        absent = times.concat(*list_of_employee)
        val = employees - absent 

        for value in val:
            body = """<html lang="en">
                            <body>
                                <div>
                                    
                                    </br>
                                    <p>This mail is regarding Employee who still not submited timesheet.</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                        <thead>
                            <tr >
                                <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                
                            </tr>
                        </thead>
                        <tbody>"""
            body += """<tr>
                        <td style='border: 1px solid #ddd;padding: 10px;'>""" + value.name+""" </td>"""
        vals = {
                    'subject': 'Employee not submit the timesheet',
                    'body_html' : body,
                    'email_from' : value.work_email,
                    'email_to':  email_to,
                    'auto_delete': False,
                    }   
        if today.weekday() == 6: 
            time.sleep(1)
        if today.weekday() == 0: 
            time.sleep(1)
        else:
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
            return True


    def _send_mail_employee_cron(self):
        today = datetime.today()
        yesterday = today - timedelta(days = 1)

        employees = self.env['hr.employee'].search([])

        employees = self.env['hr.employee'].search([('active','!=', False)])

        employees = self.env['hr.employee'].search([])
        employees = self.env['hr.employee'].search([('active','!=', False)])
        timesheet = self.env['account.analytic.line'].search([('date','=',yesterday)])
        yes = datetime.now() - timedelta(days=1)
        now_utc = pytz.utc.localize(yes)
        now_utc_date = now_utc.date()
        x = today.weekday()
        list_of_employee = []
        if x == 0 and x == 1 and x == 2 and x == 3 and x == 4:

            for employee in employees:
                tz = pytz.timezone(employee.tz)
                now_tz = now_utc.astimezone(tz)
                start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)  # day start in the employee's timezone
                # start_naive = start_tz.astimezone(pytz.utc).replace(tzinfo=None)

                holidays = self.env['hr.leave'].sudo().search([
                    ('employee_id', '=', employee.id),
                    ('date_to', '>=', start_tz),
                    ('state', 'not in', ('cancel', 'refuse'))
                ])
                
                is_absent = False
                for holiday in holidays:

                    date_from = holiday.date_from.date()
                    date_to = holiday.date_to.date()
                    if date_from <= now_utc_date and date_to >= now_utc_date:
                        is_absent = True    
                
                        if is_absent:
                            times = timesheet.employee_id
                            absent = times.concat(*employee)
                            val = employees - absent 

                            for value in val:
                                body = """<html lang="en">
                                                <body>
                                                    <div>
                                                        
                                                        </br>
                                                        <p>This mail is regarding Employee still not submited timesheet.</p>
                                                        <div class="table-responsive">
                                                        <p>Employee """ + value.name+""" not submit timesheet.please fill the timesheet</p>
                                            <tbody>"""
                                vals = {
                                            'subject': 'Employee not submit the timesheet',
                                            'body_html' : body,
                                            'email_from' : value.work_email,
                                            'email_to':  value.work_email,
                                            'auto_delete': False,
                                            }   
                                if today.weekday() == 6: 
                                    time.sleep(1)
                                if today.weekday() == 0: 
                                    time.sleep(1)
                                else:
                                    mail_id = self.env['mail.mail'].sudo().create(vals)
                                    mail_id.sudo().send()
                                
    def cron_missing_timesheet_hr(self):
        today = fields.Date.today()
        weekday = today.weekday()  # Monday = 0

        # Skip weekends
        if weekday >= 5:
            return True

        Employee = self.env['hr.employee']
        Timesheet = self.env['account.analytic.line']
        Leave = self.env['hr.leave']
        Holiday = self.env['resource.calendar.leaves']

        employees = Employee.search([('active', '=', True)])

        #  Employees who submitted timesheet today
        submitted_emp_ids = Timesheet.search([
            ('date', '=', today),
            ('employee_id', '!=', False),
        ]).mapped('employee_id').ids

        #  Employees on approved leave today
        leave_emp_ids = Leave.search([
            ('state', '=', 'validate'),
            ('date_from', '<=', today),
            ('date_to', '>=', today),
        ]).mapped('employee_id').ids

        #  Public holidays (company calendar)
        public_holiday = Holiday.search([
            ('date_from', '<=', today),
            ('date_to', '>=', today),
        ], limit=1)

        #  Skip if public holiday
        if public_holiday:
            return True

        excluded_emp_ids = set(submitted_emp_ids + leave_emp_ids)

        missing_employees = employees.filtered(
            lambda e: e.id not in excluded_emp_ids
        )

        if not missing_employees:
            return True

        #  Email body
        body = """
        <html>
        <body>
            <p>The following employees have not submitted their timesheet today:</p>
            <ul>
        """

        for emp in missing_employees:
            body += f"<li>{emp.name}</li>"

        body += "</ul></body></html>"

        mail_vals = {
            'subject': f'Timesheet Missing – {today}',
            'body_html': body,
            'email_from': 'aarti@latitudetechnolabs.com',
            'email_to': 'hr@latitudetechnolabs.com',''
            'auto_delete': False,
        }

        self.env['mail.mail'].sudo().create(mail_vals).send()
        return True
