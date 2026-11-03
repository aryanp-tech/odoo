from calendar import weekday
import datetime 
from datetime import date , timedelta, datetime, time
from odoo import fields, models,api ,_
import calendar
from odoo.exceptions import ValidationError,UserError
from dateutil import parser
import pytz
from odoo.http import request
from dateutil.relativedelta import relativedelta
import numpy as np
import pandas as pd
from openpyxl import Workbook
import io
import base64

class ResourceCalender(models.Model):
    _inherit = 'resource.calendar'

    no_checkin_cron_id = fields.Many2one('ir.cron', groups="base.user_root")
    manager_id = fields.Many2one('hr.employee')
    hr_leave_type_id = fields.Many2one('hr.leave.type')
    working_hour_start = fields.Datetime('Working Hours Starts On')
    end_time = fields.Datetime('Working Hour Ends On')

    def write(self, values):
        is_admin = self.env.user.has_group('hr.group_hr_manager') 
        if not is_admin:
            if values:
                raise UserError(_('You Cannot Change Work hours'))
        cron = self.env['ir.cron'].search([('name','=',self.name)])
        if cron:
            if 'name' in values:
                cron.write({'name':values['name']})
            if 'working_hour_start' in values:
                cron.write({'nextcall':datetime.strptime(values['working_hour_start'], '%Y-%m-%d %H:%M:%S')+ timedelta(minutes=30)})
        result = super(ResourceCalender, self).write(values)            
        return result
    
    @api.model
    def create(self, vals):
        is_admin = self.env.user.has_group('hr.group_hr_manager')  
        if not is_admin:
            raise UserError(_('You Cannot Change Work hours'))
        res = super(ResourceCalender, self).create(vals)
        if res.working_hour_start:
            model = self.env['ir.model'].search([('name','=','Employee')])
            cron = self.env['ir.cron'].create({
                'name':res.name,
                'model_id': model.id,
                'interval_number':1,
                'interval_type': 'days',
                'active':True,
                'numbercall':-1,
                'nextcall':res.working_hour_start + timedelta(minutes=30),
                'code':'model.cron_checkin_as_absent()'
            })
        return res
    
    def unlink(self):
        for rec in self:
            cron = self.env['ir.cron'].search([('name','=',rec.name)])
            if cron:
                cron.unlink()
            return super(ResourceCalender, self).unlink()

   
class HrLeaveTypes(models.Model):
    """ Extend model to add multilevel approval """
    _inherit = 'hr.leave.type'

    day = fields.Char("Number Of Days")


class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    probabtion = fields.Boolean("Probabtion")
    is_send = fields.Boolean("send", default=True)
    warn_time = fields.Integer('Warning Time', invisible= True)
    probability = fields.Float('Personal Information',compute='_compute_profile',readonly = True)
    mentor_id  = fields.Many2one('hr.employee','Mentor Name')
    lead_id = fields.Many2one('hr.employee','Tech Lead')
    miss_attend_ids = fields.Many2many('missed.attendance',string='Missed Attendances',compute='_compute_missed_attendances')

    # Work From Office employees punch in on the biometric device and are
    # enforced there (hr_zk_attendance gates their check-in/check-out), so they
    # are excluded from the attendance warning and daily report crons below.
    # Only 'wfh' and 'wfr' employees are processed.
    _WFO_WORKING_TYPE = 'wfo'

    def _attendance_cron_employees(self):
        """Active employees the attendance warning/report crons should process.

        Excludes Work From Office staff. Employees whose working_type is unset
        stay included on purpose: Odoo renders '!=' as
        "working_type != 'wfo' OR working_type IS NULL", so a blank field means
        the employee is still warned rather than silently skipped.
        """
        return self.search([
            ('active', '=', True),
            ('working_type', '!=', self._WFO_WORKING_TYPE),
        ])

    def cron_first_half_attendance_warning(self):
        today = fields.Date.today()
        now = fields.Datetime.now()

        # Weekday check
        if now.weekday() > 4:
            return

        all_holidays = self.env['public.holidays'].search([])
        holiday_dates = (all_holidays.mapped('holidays_line')).mapped('leave_date')

        if today in holiday_dates:
            return


        attendance_obj = self.env['hr.attendance']
        leave_obj = self.env['hr.leave']
        wfh_leave = self.env['hr.leave.type'].search(
            [('name', '=', 'Work From Home')], limit=1
        )

        for emp in self._attendance_cron_employees():
            tz = pytz.timezone(emp.tz or 'UTC')

            start_day = datetime.combine(today, time.min)
            noon = datetime.combine(today, time(12, 0, 0))

            start_day_utc = tz.localize(start_day).astimezone(pytz.utc).replace(tzinfo=None)
            noon_utc = tz.localize(noon).astimezone(pytz.utc).replace(tzinfo=None)

            # Leave check (exclude WFH)
            leave = leave_obj.search([
                ('employee_id', '=', emp.id),
                ('state', '=', 'validate'),
                ('holiday_status_id', '!=', wfh_leave.id),
                ('date_from', '<=', noon_utc),
                ('date_to', '>=', start_day_utc),
            ], limit=1)

            if leave:
                continue

            # Attendance before 12 PM
            attendance = attendance_obj.search([
                ('employee_id', '=', emp.id),
                ('check_in', '>=', start_day_utc),
                ('check_in', '<', noon_utc),
            ], limit=1)

            if not attendance:
                self.env['mail.mail'].sudo().create({
                    'subject': 'First Half Attendance Missing',
                    'body_html': f"""
                        <p>Dear {emp.name},</p>
                        <p>You have not checked in for the <b>first half</b> today.</p>
                        <p>This may result in <b>Loss of Pay</b>.</p>
                        <p>Regards,<br/>HR Team</p>
                    """,
                    'email_from': 'aarti@latitudetechnolabs.com',
                    'email_to': emp.work_email,
                }).send()


    def cron_second_half_attendance_warning(self):
        today = fields.Date.today()
        now = fields.Datetime.now()

        if now.weekday() > 4:
            return

        all_holidays = self.env['public.holidays'].search([])
        holiday_dates = (all_holidays.mapped('holidays_line')).mapped('leave_date')

        if today in holiday_dates:
            return


        attendance_obj = self.env['hr.attendance']
        leave_obj = self.env['hr.leave']
        wfh_leave = self.env['hr.leave.type'].search(
            [('name', '=', 'Work From Home')], limit=1
        )

        for emp in self._attendance_cron_employees():
            tz = pytz.timezone(emp.tz or 'UTC')

            start_day = datetime.combine(today, time.min)
            noon = datetime.combine(today, time(12, 0))
            five_pm = datetime.combine(today, time(17, 0))

            start_day_utc = tz.localize(start_day).astimezone(pytz.utc).replace(tzinfo=None)
            noon_utc = tz.localize(noon).astimezone(pytz.utc).replace(tzinfo=None)
            five_pm_utc = tz.localize(five_pm).astimezone(pytz.utc).replace(tzinfo=None)

            leave = leave_obj.search([
                ('employee_id', '=', emp.id),
                ('state', '=', 'validate'),
                ('holiday_status_id', '!=', wfh_leave.id),
                ('date_from', '<=', five_pm_utc),
                ('date_to', '>=', start_day_utc),
            ], limit=1)

            att_first = attendance_obj.search([
                ('employee_id', '=', emp.id),
                ('check_in', '<', noon_utc),
            ], limit=1)

            att_second = attendance_obj.search([
                ('employee_id', '=', emp.id),
                ('check_in', '>=', noon_utc),
                ('check_in', '<=', five_pm_utc),
            ], limit=1)

            # Full-day leave → skip
            if leave and not leave.request_unit_half:
                continue

            warn = False

            if leave and leave.request_unit_half:
                if leave.request_date_from_period == 'am' and not att_second:
                    warn = True
                elif leave.request_date_from_period == 'pm' and not att_first:
                    warn = True
            elif not leave and not att_second:
                warn = True

            if warn:
                self.env['mail.mail'].sudo().create({
                    'subject': 'Second Half Attendance Missing',
                    'body_html': f"""
                        <p>Dear {emp.name},</p>
                        <p>You have not marked attendance for the <b>second half</b> today.</p>
                        <p>Please regularize to avoid <b>LOP</b>.</p>
                        <p>Regards,<br/>HR Team</p>
                    """,
                    'email_from': 'aarti@latitudetechnolabs.com',
                    'email_to': emp.work_email,
                }).send()

    def cron_attendance_final_report(self):
        today = fields.Date.today()
        now = fields.Datetime.now()

        if now.weekday() > 4:
            return

        all_holidays = self.env['public.holidays'].search([])
        holiday_dates = (all_holidays.mapped('holidays_line')).mapped('leave_date')

        if today in holiday_dates:
            return


        attendance_obj = self.env['hr.attendance']
        leave_obj = self.env['hr.leave']
        wfh_leave = self.env['hr.leave.type'].search(
            [('name', '=', 'Work From Home')], limit=1
        )

        full_day, first_half, second_half = [], [], []

        for emp in self._attendance_cron_employees():
            tz = pytz.timezone(emp.tz or 'UTC')

            start_day = datetime.combine(today, time.min)
            noon = datetime.combine(today, time(12, 0))
            five_pm = datetime.combine(today, time(17, 0))

            start_day_utc = tz.localize(start_day).astimezone(pytz.utc).replace(tzinfo=None)
            noon_utc = tz.localize(noon).astimezone(pytz.utc).replace(tzinfo=None)
            five_pm_utc = tz.localize(five_pm).astimezone(pytz.utc).replace(tzinfo=None)

            leave = leave_obj.search([
                ('employee_id', '=', emp.id),
                ('state', '=', 'validate'),
                ('holiday_status_id', '!=', wfh_leave.id),
                ('date_from', '<=', five_pm_utc),
                ('date_to', '>=', start_day_utc),
            ], limit=1)

            att_first = attendance_obj.search([
                ('employee_id', '=', emp.id),
                ('check_in', '<', noon_utc),
            ], limit=1)

            att_second = attendance_obj.search([
                ('employee_id', '=', emp.id),
                ('check_in', '>=', noon_utc),
                ('check_in', '<=', five_pm_utc),
            ], limit=1)

            if leave:
                continue

            if not att_first and not att_second:
                full_day.append(emp.name)
            elif not att_first:
                first_half.append(emp.name)
            elif not att_second:
                second_half.append(emp.name)

        body = f"""
            <p><b>Attendance Report – {today}</b></p>

            <h4>Full Day Absent</h4>
            <ul>{''.join(f'<li>{e}</li>' for e in full_day) or '<li>None</li>'}</ul>

            <h4>First Half Absent</h4>
            <ul>{''.join(f'<li>{e}</li>' for e in first_half) or '<li>None</li>'}</ul>

            <h4>Second Half Absent</h4>
            <ul>{''.join(f'<li>{e}</li>' for e in second_half) or '<li>None</li>'}</ul>
        """

        self.env['mail.mail'].sudo().create({
            'subject': f'Attendance Non-Compliance Report – {today}',
            'body_html': body,
            'email_from': 'aarti@latitudetechnolabs.com',
            'email_to': 'hr@latitudetechnolabs.com,sanjay.j@latitudetechnolabs.com,jay@latitudetechnolabs.com',
            'auto_delete': False,
        }).send()




    def download_wfh_report(self):        
        workbook = Workbook()
        worksheet = workbook.active
        headers = ['Employee Name', 'Designation', 'WFH Allocation','Extra Wfh Allocation' ,'Wfh Used','Avail Balance']
        for col, header in enumerate(headers, start=1):
            worksheet.cell(row=1, column=col, value=header)
        employees = self.env['hr.employee'].search([])
        for row_num, employee in enumerate(self, start=3):
            wfh = self.env['hr.leave.type'].search([('name','=','Work From Home')])
            wfh_taken = self.env['hr.leave'].search([
                ('holiday_status_id', '=',wfh.id),
                ('employee_id', '=', employee.id),
                ('state', '=', 'validate')]).mapped('number_of_days')
            wfh_allocate = self.env['hr.leave.allocation'].search([
                ('holiday_status_id', '=',wfh.id),
                ('employee_id', '=', employee.id),
                ('state', '=', 'validate')]).mapped('number_of_days_display')
            
            worksheet.cell(row=row_num, column=1, value=employee.name)
            worksheet.cell(row=row_num, column=2, value=employee.department_id.name)
            worksheet.cell(row=row_num, column=3, value=sum(wfh_allocate))
            if sum(wfh_allocate) >8:
                worksheet.cell(row=row_num, column=4, value=sum(wfh_allocate)-8)
            else:
                worksheet.cell(row=row_num, column=4, value=0)
            worksheet.cell(row=row_num, column=5, value=sum(wfh_taken))
            worksheet.cell(row=row_num, column=6, value=sum(wfh_allocate)-sum(wfh_taken))
        
        excel_buffer = io.BytesIO()
        workbook.save(excel_buffer)
        excel_buffer.seek(0)
        file_data = base64.b64encode(excel_buffer.read())
        file_name = 'wfh_data.xlsx'

        attachment = self.env['ir.attachment'].create({
            'name': file_name,
            'type': 'binary',
            'datas': file_data,
            'store_fname': file_name,
            'mimetype': 'application/vnd.ms-excel',
        })

        return {
            'type': 'ir.actions.act_url',
            'url': '/web/content/%s?download=true' % (attachment.id),
            'target': 'self',  
        }
       
    

    def _compute_missed_attendances(self):
        for employee in self:
            employee.miss_attend_ids = self.env['missed.attendance'].search([('employee_id', '=', employee.id)])
    @api.depends('private_email','gender','birthday','country_id',
                 'place_of_birth','marital','emergency_contact','certificate','study_field',)
    def _compute_profile(self):
        for rec in self:
            field = [rec.private_email,rec.gender,
                     rec.birthday,rec.country_id,rec.place_of_birth,
                     rec.marital,rec.emergency_contact,rec.certificate,rec.blood_group,
                     rec.study_field,rec.aadhar_img,rec.pan_img,rec.pan_no,
                     rec.aadhar_no,rec.graduation,rec.mark_sheet]
            percent = 100/len(field)
            count = 0
            for ls in field:
                if ls:
                    count = count+percent
            rec.probability = count

    def cron_update_profile(self):
        active_employees = self.env['hr.employee'].search([('active','=', True)])
        employees = {}
        for rec in active_employees:
            if rec.probability != 100:
                employees[rec]=[]
                fields = [
                    ('Private Email', rec.private_email),
                    ('Gender', rec.gender),
                    ('Date Of Birthday', rec.birthday),
                    ('Nationality (Country)	', rec.country_id),
                    ('Country of Birth', rec.place_of_birth),
                    ('Marital Status', rec.marital),
                    ('Emergency Contact', rec.emergency_contact),
                    ('Certificate Level', rec.certificate),
                    ('Field of Study School', rec.study_field),
                    ('Blood Group', rec.blood_group),
                    ('Aadhar', rec.aadhar_img),
                    ('Pan Card', rec.pan_img),
                    ('Aadhar No', rec.aadhar_no),
                    ('Pan No', rec.pan_no),
                    ('10th Marksheet', rec.mark_sheet),
                    ('Graduation Certificate', rec.graduation)
                    ]                
                for field_name, field_value in fields:
                    if not field_value:
                        employees[rec].append(field_name)
        for employee in employees:
            if employee.work_email:
                if employees[employee]:
                    hr_body = """<html lang="en">
                                <body>
                                    <div>
                                        </br>
                                        <p>Alert! Mandatory Fields you have to set in Odoo Profile</p>
                                        <div class="table-responsive">
                                        <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                                        <thead>
                                            <tr >
                                                <th style='border: 1px solid #ddd;padding: 10px;'>Field Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>"""
                    for fld in employees[employee]:
                        hr_body += """<tr>
                            <td style='border: 1px solid #ddd;padding: 10px;'>""" + fld+""" </td>"""
                    hr_body += """
                    </tr>"""
                    hr_body += """</tbody>
                        </table>
                        </div>
                        <p><a href="https://hr.latitudetechnolabs.com/employee/form">Click here To Add Personal Details</a></p>
                                        <p>Thank you,</p>
                                    </div>
                                </body>
                            </html>"""
                    vals = {
                            'subject': 'Urgent: Pending Fields in Odoo',
                            'body_html' : hr_body,
                            'email_from' :'aarti@latitudetechnolabs.com',
                            'email_to': employee.work_email,
                            'auto_delete': False,
                                }
                    template = self.env.ref('employee_notification.employee_profile_update_mail')
                    self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=vals)

    def cron_upcoming_employee_leave(self):
        today = date.today()
        work_from_home = self.env['hr.leave.type'].search([('name','=','Work From Home')])
        leaves = self.env['hr.leave'].search([("request_date_from", ">", today),("state", "=", 'validate'),("holiday_status_id", "!=", work_from_home.id)])
        all_holidays = self.env['public.holidays'].search([])
        holiday_lines = (all_holidays.mapped('holidays_line')).mapped('leave_date')
        if today not in holiday_lines:
            if leaves:
                body = """<html lang="en">
                                            <body>
                                                <div>
                                                    
                                                    </br>
                                                    <p>Employees are absent on Upcoming days.</p>
                                                    <div class="table-responsive">
                                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                                        <thead>
                                            <tr >
                                                <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                                <th style='border: 1px solid #ddd;padding: 10px;'>StartDate</th>
                                                <th style='border: 1px solid #ddd;padding: 10px;'>EndDate</th>
                                                
                                            </tr>
                                        </thead>
                                        <tbody>"""
                for emp in leaves:

                    body += """<tr><td style='border: 1px solid #ddd;padding: 10px;'>""" + emp.employee_id.name+ """</td>"""
                    body += """<td style='border: 1px solid #ddd;padding: 10px;'>""" + str(emp.request_date_from) + """</td>"""
                    body += """<td style='border: 1px solid #ddd;padding: 10px;'>"""+ str(emp.request_date_to) + """</td>"""
                body += """</tr>"""
                body += """</tbody>
                                </table>
                                </div>
                                        <p>Thank you,</p>
                                            </div>
                                        </body>
                                    </html>"""
                vals = {
                        'subject': 'Employees are leave on Upcoming days.',
                        'body_html' : body,
                        'email_from' :'aarti@latitudetechnolabs.com',
                        'email_to':  'staff@latitudetechnolabs.com,staff@latitudetechnolabs.org',
                        'auto_delete': False}
                mail_id = self.env['mail.mail'].sudo().create(vals)
                mail_id.sudo().send()

    def write(self, values):
        is_admin = self.env.user.has_group('hr.group_hr_manager') 
        if not is_admin:
            if self.env.user.employee_id != self:
                raise UserError(_('You Cannot Change profile details of other Employee'))
            if 'resource_calendar_id' in values:
                raise UserError(_('You Cannot Change Work hours'))
        result = super(HrEmployee, self).write(values)            
        return result

    @api.model
    def create(self,vals):
        res = super(HrEmployee, self).create(vals)
        casual_leave = self.env['hr.leave.type'].search([('name','=','Casual Leave 2026')])
        sick_leave = self.env['hr.leave.type'].search([('name','=','Sick Leave 2026')])
        work_from_home = self.env['hr.leave.type'].search([('name','=','Work From Home')])
        for rec in work_from_home:
            if rec.company_id.name == res.company_id.name:
                wfh_allocate = self.env['hr.leave.allocation'].create({
                    'name':'Work From Home',
                    'holiday_status_id':rec.id,
                    'number_of_days':3,
                    'holiday_type':'employee',
                    'employee_id':res.id,
                    'allocation_type':'regular',
                    'notes':'WFH Assigned in Probation Period',
                    'state':'validate'
                })
        for rec in casual_leave:
            if rec.company_id.name == res.company_id.name:
                cl_allocate = self.env['hr.leave.allocation'].create({
                    'name':'Casual Leave 2026',
                    'holiday_status_id':rec.id,
                    'number_of_days':3,
                    'holiday_type':'employee',
                    'employee_id':res.id,
                    'allocation_type':'regular',
                    'notes':'Till Probation Period Complete CL Given',
                    'state':'validate'
                })
        for rec in sick_leave:
            if rec.company_id.name == res.company_id.name:
                sl_allocation = self.env['hr.leave.allocation'].create({
                    'name':'Sick Leave',
                    'holiday_status_id':rec.id,
                    'number_of_days':3,
                    'holiday_type':'employee',
                    'employee_id':res.id,
                    'allocation_type':'regular',
                    'notes':'Till Probation Period Complete Sick Leave Given',
                    'state':'validate'
                })
        return res
        
    def employee_leave(self):
        today = date.today()
        sevenday = today + timedelta(days = 7)
        leaves = self.env['hr.leave'].search([("request_date_to", ">", today)])
        list_of_employee = []
        delta =  sevenday - today
        for leave in leaves:
            list_date = []
            delta1 =  leave.request_date_to - leave.request_date_from
            for i in range(delta1.days + 1):
                week = leave.request_date_from + timedelta(days=i)
                list_date.append(week)
            for i in range(delta.days + 1):
                day = today + timedelta(days=i)
                if day in list_date:
                    if leave not in list_of_employee:
                        list_of_employee.append(leave)
        if list_of_employee:
            body = """<html lang="en">
                                        <body>
                                            <div>  
                                                </br>
                                                <p>This mail regarding employee are absent next seven days.</p>
                                                <div class="table-responsive">
                                                <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                                    <thead>
                                        <tr >
                                            <th style='border: 1px solid #ddd;padding: 10px;'>Name StartDate EndDate</th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>"""
            for emp in list_of_employee:
                body += """<tr>
                                            <td style='border: 1px solid #ddd;padding: 10px;'>""" + emp.employee_id.name+""" """ + str(emp.request_date_from)+ """ """ + str(emp.request_date_to) + """</td>"""
            body += """
                                        </tr>"""
            body += """</tbody>
                                        </table>
                                        </div>
                                                        <p>Thank you,</p>
                                                    </div>
                                                </body>
                                            </html>"""
            vals = {
                                'subject': 'This mail regarding employee are absent next seven days.',
                                'body_html' : body,
                                'email_from' :'aarti@latitudetechnolabs.com',
                                'email_to':  'aarti@latitudetechnolabs.com',
                                'auto_delete': False,
                            }
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
       
    def cron_send_absent_emails(self):
        now = fields.Datetime.now()
        x = now.weekday()
        now_utc = pytz.utc.localize(now)
        now_utc_date = now_utc.date()
        list_of_employee = []
        work_from_home = self.env['hr.leave.type'].search([('name','=','Work From Home')])
        work_home = self.env['hr.leave'].search([('holiday_status_id','=',work_from_home.id),('date_from',"<=",now),('date_to',">=",now),('state','=','validate')])
        total_leaves = {'full_day':[],'morning':[],'noon':[],'work_home':[]}
        creation = {'full_day':[],'morning':[],'noon':[],'work_home':[]}
        all_holidays = self.env['public.holidays'].search([])
        holidays = (all_holidays.mapped('holidays_line')).mapped('leave_date')
        if now_utc_date not in holidays:
            for emp in work_home:
                if emp.employee_id.company_id.name == 'Latitude Creations':
                    if emp not in creation['work_home']:
                        creation['work_home'].append(emp.employee_id)
                if emp not in total_leaves['work_home']:
                    total_leaves['work_home'].append(emp.employee_id)
            if x == 0 or x == 1 or x == 2 or x == 3 or x == 4:
                for employee in self.env['hr.employee'].search([(('active','=', True))]):
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)
                    holidays = self.env['hr.leave'].sudo().search([
                        ('employee_id', '=', employee.id),
                        ('date_to', '>=', start_tz),
                        ('state', 'not in', ['cancel', 'refuse']),
                        ('holiday_status_id','!=',work_from_home.id),
                        ('name','!=','Not checkin is equivalent to being absent'),])
                    is_absent = False
                    for holiday in holidays:
                        date_from = holiday.date_from.date()
                        date_to = holiday.date_to.date()
                        if date_from <= now_utc_date and date_to >= now_utc_date:
                            is_absent = True
                            if holiday.request_unit_half:
                                if holiday.employee_id.company_id.name == 'Latitude Creations':
                                    if holiday.request_date_from_period == 'am':
                                        creation['morning'].append(employee)
                                    else:
                                        creation['noon'].append(employee)
                                if holiday.request_date_from_period == 'am':
                                    total_leaves['morning'].append(employee)
                                else:
                                    total_leaves['noon'].append(employee)
                            else:
                                total_leaves['full_day'].append(employee)
                                if holiday.employee_id.company_id.name == 'Latitude Creations':
                                    creation['full_day'].append(employee)
                    if is_absent:
                        list_of_employee.append(employee)

                if list_of_employee:
                    body = """<html lang="en">
                                <body>
                                    <div>
                                        </br>
                                        <p>This mail is regarding Employee are absent .</p>"""
                    for leave in total_leaves:
                        if leave == 'full_day':
                            body += """<br/><h4>Full-Day Absent employees</h4>"""
                            for emp in total_leaves[leave]:
                                body += """
                                    <p>""" + emp.name+""" </p>"""
                        if leave == 'morning':
                            body += """<br/><h4>First Half Absent Employees:-</h4>"""
                            for emp in total_leaves[leave]:
                                body += """
                                    <p>""" + emp.name+""" </p>"""
                        if leave == 'noon':
                            body += """<br/><h4>Second Half Absent Employees:-</h4>"""
                            for emp in total_leaves[leave]:
                                body += """<p>""" + emp.name+""" </p>"""
                    body += """
                        <br/>
                        <br/>
                        </div><p>Thank you,</p></div>
                                </body>
                            </html>"""
                    email_values = {'body_html': body,
                                    'email_to': 'staff@latitudetechnolabs.com,staff@latitudetechnolabs.org', }
                    template = self.env.ref('employee_notification.email_is_absent')
                    self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=email_values)

                    if creation:
                        body = """<html lang="en">
                                    <body>
                                        <div>
                                            </br>
                                            <p>Regarding Latitude Creatiion Employees are absent and Doing Work From Home</p>"""
                        for leave in creation:
                            if leave == 'full_day':
                                body += """<br/><h4>Full-Day Absent employees</h4>"""
                                for emp in creation[leave]:
                                    body += """
                                        <p>""" + emp.name+""" </p>"""
                            if leave == 'morning':
                                body += """<br/><h4>First Half Absent Employees:-</h4>"""
                                for emp in creation[leave]:
                                    body += """
                                        <p>""" + emp.name+""" </p>"""
                            if leave == 'noon':
                                body += """<br/><h4>Second Half Absent Employees:-</h4>"""
                                for emp in creation[leave]:
                                    body += """<p>""" + emp.name+""" </p>"""
                            if leave == 'work_home':
                                body += """<br/><h4>Work From Home Employees:-</h4>"""
                                for emp in creation[leave]:
                                    body += """<p>""" + emp.name+""" </p>"""
                        body += """
                            <br/>
                            <br/>
                            </div><p>Thank you,</p></div>
                                    </body>
                                </html>"""
                        
                        email_values = {'body_html': body,
                                        'email_to': 'kalpesh.v@latitudetechnolabs.org'}
                        template = self.env.ref('employee_notification.email_is_absent')
                        self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=email_values)

                if total_leaves['work_home']:
                    body = """<html lang="en">
                                <body>
                                    <div>
                                        </br>
                                        <p>This mail is regarding Employee Doing Work from home today.</p>"""
        
                    body += """<br/><h4>Work From Home Employees:-</h4>"""
                    for emp in total_leaves['work_home']:
                        body += """<p>""" + emp.name+""" </p>"""
                    body += """
                        <br/>
                        <br/>
                        </div><p>Thank you,</p></div>
                                </body>
                            </html>"""
                    
                    email_values = {'body_html': body,
                                    'email_to': 'staff@latitudetechnolabs.com,staff@latitudetechnolabs.org',
                                    }
                    template = self.env.ref('employee_notification.email_work_from_home')
                    self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=email_values)


    def cron_absent_send_manager(self):
        now = fields.Datetime.now()
        x = now.weekday()        
        now_utc = pytz.utc.localize(now)
        now_utc_date = now_utc.date()
        all_holidays = self.env['public.holidays'].search([])
        holidays =(all_holidays.mapped('holidays_line')).mapped('leave_date')
        if now_utc_date not in holidays:
            if x == 0 or x == 1 or x == 2 or x == 3 or x == 4:
                leaves = self.env['hr.leave'].sudo().search([('state', '=', 'confirm')])
                managers = {}
                for leave in leaves:
                    if leave.employee_id.active:
                        if leave.employee_id.parent_id:
                            managers[leave.employee_id.parent_id] =[]
                for leave in leaves:
                    if leave.employee_id.active:
                        if leave.employee_id.parent_id:
                            managers[leave.employee_id.parent_id].append(leave.employee_id.name)
                if managers:
                    for rec in managers:
                        hr_body = """<html lang="en">
                            <body>
                                <div>
                                    </br>
                                    <p>Employees applying for leave request so you have to Approve/Refuse this requests.</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                                    <thead>
                                        <tr >
                                            <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>"""
                        for emp in set(managers[rec]):
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
                                'subject': 'Important: Pending Leave Request - Action Required',
                                'body_html' : hr_body,
                                'email_from' :'aarti@latitudetechnolabs.com',
                                'email_to': rec.work_email,
                                'auto_delete': False,
                                    }
                        mail_id = self.env['mail.mail'].sudo().create(vals)
                        mail_id.sudo().send()

    def cron_not_checkin_as_absent(self, record_id=False):
        Shift = self.browse([record_id])
        HRAttandance = self.env['hr.attendance'].search([])
        today = date.today()
        now = fields.Datetime.now()
        x = now.weekday()
        now_utc = pytz.utc.localize(now)
        now_utc_date = now_utc.date()
        all_holidays = self.env['public.holidays'].search([])
        holidays = (all_holidays.mapped('holidays_line')).mapped('leave_date')
        unpaid = self.env['hr.leave.type'].search([('name',"=","Unpaid Leave")])
        if x == 0 or x == 1 or x == 2 or x == 3 or x == 4:
            if now_utc_date not in holidays:
                now_utc = pytz.utc.localize(now)
                days_ids = Shift.attendance_ids
                list_of_employees=[]
                now_utc_date = now_utc.date()
                for employee in self.env['hr.employee'].search([('active','=', True)]):
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)  
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
                        list_of_employees.append(employee)
                for i in days_ids:
                    curweekday = datetime.today().weekday()
                    if int(curweekday) == int(i.dayofweek) and i.day_period == 'morning':
                        emp_start = i.hour_from
                list_of_employee = []
                for employee in self.env['hr.employee'].search([('active','=', True)]):
                    if employee.is_absent:
                        continue
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)  # day start in the employee's timezone
                    start_naive = start_tz.astimezone(pytz.utc).replace(tzinfo=None)
                    att_rec = HRAttandance.search([('employee_id' , '=', employee.id),('check_in', '>=', start_naive)])
                    if not att_rec:
                        for day in employee.resource_calendar_id.attendance_ids:
                            if int(day.dayofweek) == x and day.day_period == 'morning':
                                if float(datetime.now(pytz.timezone('Asia/Kolkata')).time().strftime('%H.%M')) >= day.hour_from+1:                               
                                    list_of_employee.append(employee)

                s = set(list_of_employees)
                temp3 = [x for x in list_of_employee if x not in s]
                all_emp = [x.name for x in list_of_employee if x not in s]
                if temp3:
                    for emp in temp3:
                        first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                        last_day_of_month = first_day_of_month.replace(month=first_day_of_month.month+1) - timedelta(days=1)
                        attend = self.env['missed.attendance'].create({'name':'Missed Check In','employee_id':emp.id,'miss_date':datetime.today()})
                        missed_attend = self.env['missed.attendance'].search_count([('employee_id', '=', emp.id), ('miss_date', '>=', first_day_of_month), ('miss_date', '<=', last_day_of_month)])
                        if missed_attend >=5:
                            leave = self.env['hr.leave'].create({
                                                        'name': 'Absent Due to 5times missed checkin and checkout in a month -Checkin',
                                                        'employee_id': emp.id,
                                                        'holiday_status_id': unpaid.id,
                                                        'request_date_from': date.today(),
                                                        'date_from': date.today(),
                                                        'request_date_to': date.today(),
                                                        'date_to': date.today(),
                                                        'number_of_days': 1,
                                                        })
                            miss_atten =self.env['missed.attendance'].search([('employee_id', '=', emp.id), ('miss_date', '>=', first_day_of_month), ('miss_date', '<=', last_day_of_month)])
                            for rec in miss_atten:
                                rec.unlink()
                            
                        else:
                            leave = self.env['hr.leave'].create({
                                                                'name': 'Not checkin is equivalent to being absent',
                                                                'employee_id': emp.id,
                                                                'holiday_status_id': unpaid.id,
                                                                'request_date_from': today,
                                                                'date_from': today,
                                                                'request_date_to': today,
                                                                'date_to': today,
                                                                'number_of_days': 1,
                                                            })

                    hr_body = """<html lang="en">
                            <body>
                                <div>
                                    
                                    </br>
                                    <p>This mail is regarding Employee late  check in as absent.</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                        <thead>
                            <tr >
                                <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                
                            </tr>
                        </thead>
                        <tbody>"""
                    for emp in all_emp:

                        hr_body += f"""
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 10px;">{emp}</td>
                        </tr>
                            """

                    hr_body += """</tbody>
                        </table>
                        </div>
                                        <p>Thank you,</p>
                                    </div>
                                </body>
                            </html>"""
                    vals = {
                            'subject': 'Regarding employee taken leave for not checkin till now.',
                            'body_html' : hr_body,
                            'email_from' :'aarti@latitudetechnolabs.com',
                            'email_to': 'hr@latitudetechnolabs.com',
                            'auto_delete': False,
                                }
                    mail_id = self.env['mail.mail'].sudo().create(vals)
                    mail_id.sudo().send()

    def cron_not_checkin_remainder(self, record_id=False):
        Shift = self.browse([record_id])
        HRAttandance = self.env['hr.attendance'].search([])
        now = fields.Datetime.now()
        x = now.weekday()
        now_utc = pytz.utc.localize(now)
        now_utc_date = now_utc.date()
        all_holidays = self.env['public.holidays'].search([])
        holidays = (all_holidays.mapped('holidays_line')).mapped('leave_date')
        if x == 0 or x == 1 or x == 2 or x == 3 or x == 4:
            if now_utc_date not in holidays:
                now_utc = pytz.utc.localize(now)
                list_of_employees=[]
                now_utc_date = now_utc.date()
                for employee in self.env['hr.employee'].search([('active','=', True)]):
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)  # day start in the employee's timezone
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
                        list_of_employees.append(employee)
                list_of_employee = []
                for employee in self.env['hr.employee'].search([('active','=', True)]):
                    if employee.is_absent:
                        continue
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0) 
                    start_naive = start_tz.astimezone(pytz.utc).replace(tzinfo=None)
                    att_rec = HRAttandance.search([('employee_id' , '=', employee.id),('check_in', '>=', start_naive)])
                    if not att_rec:
                        for day in employee.resource_calendar_id.attendance_ids:
                            if int(day.dayofweek) == x and day.day_period == 'morning':
                                if float(datetime.now(pytz.timezone('Asia/Kolkata')).time().strftime('%H.%M')) >= day.hour_from+0.15:                               
                                    list_of_employee.append(employee)

                s = set(list_of_employees)
                temp3 = [x for x in list_of_employee if x not in s]
                if temp3:
                    for emp in temp3:
                       
                        body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>This mail is regarding """ + emp.name+ """ is not Check in till now.</p>
                                            <p>this is last remainder mail</p>
                                            """
                        body += """
                                    </div>
                                        <p>Thank you</p>
                                    </div>
                                </body>
                                    </html>"""
                        vals = {
                                'subject': 'Remainder!! As you have not check in till now.',
                                'body_html' : body,
                                'email_from' :'aarti@latitudetechnolabs.com',
                                'email_to':  emp.work_email,
                                
                                    }
                        template = self.env.ref('employee_notification.email_not_checkin_remainder')
                    
                        self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=vals)

                        # mail_id = self.env['mail.mail'].sudo().create(vals)
                        # mail_id.sudo().send()

    def cron_checkin_lop_created(self, record_id=False):
        Shift = self.browse([record_id])
        HRAttandance = self.env['hr.attendance'].search([])
        now = fields.Datetime.now()
        x = now.weekday()
        now_utc = pytz.utc.localize(now)
        now_utc_date = now_utc.date()
        all_holidays = self.env['public.holidays'].search([])
        holidays = (all_holidays.mapped('holidays_line')).mapped('leave_date')
        if x == 0 or x == 1 or x == 2 or x == 3 or x == 4:
            if now_utc_date not in holidays:
                now_utc = pytz.utc.localize(now)
                list_of_employees=[]
                now_utc_date = now_utc.date()
                for employee in self.env['hr.employee'].search([('active','=', True)]):
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0)  # day start in the employee's timezone
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
                        list_of_employees.append(employee)
                list_of_employee = []
                for employee in self.env['hr.employee'].search([('active','=', True)]):
                    if employee.is_absent:
                        continue
                    tz = pytz.timezone(employee.tz)
                    now_tz = now_utc.astimezone(tz)
                    start_tz = now_tz + relativedelta(hour=0, minute=0,second=0) 
                    start_naive = start_tz.astimezone(pytz.utc).replace(tzinfo=None)
                    att_rec = HRAttandance.search([('employee_id' , '=', employee.id),('check_in', '>=', start_naive)])
                    if not att_rec:
                        for day in employee.resource_calendar_id.attendance_ids:
                            if int(day.dayofweek) == x and day.day_period == 'morning':
                                if float(datetime.now(pytz.timezone('Asia/Kolkata')).time().strftime('%H.%M')) >= day.hour_from+0.30:                               
                                    list_of_employee.append(employee)

                s = set(list_of_employees)
                temp3 = [x for x in list_of_employee if x not in s]
                if temp3:
                    for emp in temp3:
                       
                        body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>This mail is regarding """ + emp.name+ """ is not Check in till now.</p>
                                            <p>this is last remainder mail</p>
                                            """
                        body += """
                                    </div>
                                        <p>Thank you</p>
                                    </div>
                                </body>
                                    </html>"""
                        vals = {
                                'subject': 'Remainder!! Lop Created As you have not check in till now.',
                                'body_html' : body,
                                'email_from' :'aarti@latitudetechnolabs.com',
                                'email_to':  emp.work_email,
                                
                                    }
                        template = self.env.ref('employee_notification.email_not_checkin_email_create')
                    
                        self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=vals)

    def allocate_cl_sl_leaves(self):
        """Allocate leaves to employees who have completed probation."""
        leave_type_casual = self.env['hr.leave.type'].search([('name', '=', 'Casual Leave 2026')], limit=1)
        leave_type_sick = self.env['hr.leave.type'].search([('name', '=', 'Sick Leave 2026')], limit=1)
        if not leave_type_casual or not leave_type_sick:
            raise ValidationError(_("Leave types 'Casual Leave' or 'Sick Leave' not found. Please create them."))
        employees = self.env['hr.employee'].search([('probabtion',"!=", True),('active','=', True)])
        for employee in employees:
            casual_leave = self.env['hr.leave.allocation'].create({
                'name': 'Casual Leave Allocation for 2026',
                'holiday_status_id': leave_type_casual.id,
                'employee_id': employee.id,
                'number_of_days': 10,
                'state': 'validate'
            })
            sick_leave = self.env['hr.leave.allocation'].create({
                'name': 'Sick Leave Allocation for 2026',
                'holiday_status_id': leave_type_sick.id,
                'employee_id': employee.id,
                'number_of_days': 8,
                'state': 'validate'
            })
    
    def cron_checkout_remainder(self, record_id=False):
        HRAttandance = self.env['hr.attendance'].search([])
        now = fields.datetime.now()
        x = now.weekday()
        now_utc = pytz.utc.localize(now)
        att_rec = HRAttandance.search([('check_out', '=', False)])
        for employee in att_rec.mapped('employee_id'):
            for day in employee.resource_calendar_id.attendance_ids:
                    if int(day.dayofweek) == x and day.day_period == 'afternoon':
                        if float(datetime.now(pytz.timezone('Asia/Kolkata')).time().strftime('%H.%M')) >= day.hour_to+02.00:
                            body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>This mail is regarding """ + employee.name+ """ is not Check out till now.</p>
                                            """
                            body += """
                                        </div>
                                            <p>Thank you</p>
                                        </div>
                                    </body>
                                        </html>"""
                        
                            vals = { 'subject': 'Remainder!! As you have not check out till now.',
                                    'body_html' : body,
                                    'email_from' :'hr@latitudetechnolabs.com',
                                    'email_to':  employee.work_email,
                                    'auto_delete': False,
                                                }
                            mail_id = self.env['mail.mail'].sudo().create(vals)
                            mail_id.sudo().send()

    def missed_checkout_inform(self, record_id=False):
        HRAttandance = self.env['hr.attendance'].search([])
        now =fields.datetime.now()
        x = now.weekday()
        now_utc = pytz.utc.localize(now)
        att_rec = HRAttandance.search([('check_out', '=', False)])
        employees = att_rec.mapped('employee_id')
        if employees:
            for employee in employees:
                if employee.active:
                    first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    last_day_of_month = first_day_of_month.replace(month=first_day_of_month.month+1) - timedelta(days=1)
                    attend = self.env['missed.attendance'].create({'name':'Missed Check Out','employee_id':employee.id,'miss_date':datetime.today()})
                    missed_attend = self.env['missed.attendance'].search_count([('employee_id', '=', employee.id), ('miss_date', '>=', first_day_of_month), ('miss_date', '<=', last_day_of_month)])
                    unpaid = self.env['hr.leave.type'].search([('name',"=","Unpaid Leave")])
                    if missed_attend>=3:
                        previous_leave = self.env['hr.leave'].search([('request_date_from',"=",date.today()),('request_date_to', '=', date.today()),('employee_id',"=",employee.id)])
                        if not previous_leave:
                            leave = self.env['hr.leave'].create({
                                                                'name': 'Absent Due to 3 times missed checkin and checkout in a month',
                                                                'employee_id': employee.id,
                                                                'holiday_status_id': unpaid.id,
                                                                'request_date_from': date.today(),
                                                                'date_from': date.today(),
                                                                'request_date_to': date.today(),
                                                                'date_to': date.today(),
                                                                'number_of_days': 1,
                                                                })
                            
                            miss_atten =self.env['missed.attendance'].search([('employee_id', '=', employee.id), ('miss_date', '>=', first_day_of_month), ('miss_date', '<=', last_day_of_month)])
                            for rec in miss_atten:
                                rec.unlink()
                        else:
                            leave = self.env['hr.leave'].create({
                                                                'name': 'Absent Due to 3 times missed checkin and checkout in a month',
                                                                'employee_id': employee.id,
                                                                'holiday_status_id': unpaid.id,
                                                                'request_date_from': date.today(),
                                                                'date_from': date.today(),
                                                                'request_date_to': date.today(),
                                                                'date_to': date.today(),
                                                                'number_of_days': 1,
                                                                })    
            hr_body = """<html lang="en">
                            <body>
                                <div>
                                    </br>
                                    <p>This mail is regarding Employees Not CheckOut on Today</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                        <thead>
                            <tr >
                                <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                            </tr>
                        </thead>
                        <tbody>"""
            for emp in employees:
                if emp.active:
                    hr_body += """<tr>
                        <td style='border: 1px solid #ddd;padding: 10px;'>""" + emp.name+""" </td>"""
                    hr_body += """
                    </tr>"""
            hr_body += """</tbody>
                </table>
                </div>
                                <p>Thank you,</p>
                            </div>
                        </body>
                    </html>"""
            vals = { 'subject': 'Employees Not Checkout for Today',
                    'body_html' : hr_body,
                    'email_from' :'aarti@latitudetechnolabs.com',
                    'email_to':  'aarti@latitudetechnolabs.com,hr@latitudetechnolabs.com,sanjay.j@latitudetechnolabs.com',
                    'auto_delete': False,
                            }
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
            for attend in  att_rec:
                current_date = datetime.now().date()
                updated_datetime=datetime.combine(current_date, attend.employee_id.resource_calendar_id.end_time.time())
                attend.check_out = updated_datetime       

     
    def total_working_hours(self, record_id=False):
        employees = self.env['hr.employee'].search([])
        today = fields.Date.today()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=4)
        employee_details={}
        work_from_home = self.env['hr.leave.type'].search([('name','=','Work From Home')])
        for employee in employees:
            total_hours = 40
            attendance_duration = 0
            public_holidays = self.env['public.holidays.line'].search([('leave_date', '>=', start_of_week),
                                                                   ('leave_date', '<=', end_of_week)])
            public_holidays_hours = sum([8 for holiday in public_holidays])
            if public_holidays_hours:
                total_hours = total_hours-public_holidays_hours
            attendances = self.env['hr.attendance'].search([
                ('employee_id', '=', employee.id),
                ('check_in', '>=', start_of_week),
                ('check_in', '<=', end_of_week),
                ('check_out', '!=', False)
            ])
            if attendances:
                attendance_duration= attendance_duration+sum(attendances.mapped('worked_hours'))
            leaves = self.env['hr.leave'].search([
                ('employee_id', '=', employee.id),
                ('state', '=', 'validate'),
                ("holiday_status_id", "!=", work_from_home.id),
                ('request_date_from', '<=', end_of_week),
                ('request_date_to', '>=', start_of_week)
            ])
            if leaves:
                total_leaves = sum(leaves.mapped('number_of_days'))
                total_leave_hours = total_leaves*8
                total_hours = total_hours-total_leave_hours
            total_minutes = int(total_hours) * 60 + (total_hours - int(total_hours)) * 60
            subtract_minutes = int(attendance_duration) * 60 + (attendance_duration - int(attendance_duration)) * 60
            remaining_minutes = total_minutes - subtract_minutes
            remaining = remaining_minutes / 60
            remaining_minute = int((remaining - int(remaining)) * 60)
            remaining_minutes = remaining_minute % 60
            remaining_hours = float(f"{int(remaining)}.{str(remaining_minutes).zfill(2)}")
            if remaining_hours >0:
                employee_details[employee.name]={'total_hours':total_hours,'pending_hours':remaining_hours}
        print(employee_details)
        if employee_details:
            body = """<html lang="en">
                        <body>
                            <div>
                                
                                </br>
                                <p>Employees Pending Working Hours for this week.</p>
                                <div class="table-responsive">
                                <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                    <thead>
                        <tr >
                            <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                            <th style='border: 1px solid #ddd;padding: 10px;'>Total Hours</th>
                            <th style='border: 1px solid #ddd;padding: 10px;'>Pending Hours</th>   
                        </tr>
                    </thead>
                    <tbody>"""
            for emp in employee_details:
                body += """<tr><td style='border: 1px solid #ddd;padding: 10px;'>""" + emp+ """</td>"""
                body += """<td style='border: 1px solid #ddd;padding: 10px;'>""" +str(employee_details[emp]['total_hours']) + """</td>"""
                body += """<td style='border: 1px solid #ddd;padding: 10px;'>"""+ str(employee_details[emp]['pending_hours']) + """</td>"""
            body += """</tr>"""
            body += """</tbody>
                            </table>
                            </div>
                                    <p>Thank you,</p>
                                        </div>
                                    </body>
                                </html>"""
            vals = {
                'subject': 'Employees Pending Hours for This week.',
                'body_html' : body,
                'email_from' :'aarti@latitudetechnolabs.com',
                'email_to':'aarti@latitudetechnolabs.com,hr@latitudetechnolabs.com,sanjay.j@latitudetechnolabs.com',
                'auto_delete': False}
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
        return True
                   
    def cron_check_early_checkout(self):
        HRAttendance = self.env['hr.attendance']
        today = fields.Date.today()
        employees = self.env['hr.employee'].search([('active', '=', True)])
        unpaid_leave_type = self.env['hr.leave.type'].search([('name', '=', 'Unpaid Leave')], limit=1)

        for employee in employees:
            tz = pytz.timezone(employee.tz or 'UTC')
            employee_attendances = HRAttendance.search([
                ('employee_id', '=', employee.id),
                ('check_out', '>=', fields.Datetime.start_of(today, 'day')),
                ('check_out', '<=', fields.Datetime.end_of(today, 'day'))
            ], order="check_out desc", limit=1)

            if employee_attendances:
                last_checkout = employee_attendances.check_out.astimezone(tz)
                if last_checkout.time() < datetime.strptime('18:00:00', '%H:%M:%S').time():
                    # Create an unpaid leave for the day
                    existing_leave = self.env['hr.leave'].search([
                        ('employee_id', '=', employee.id),
                        ('request_date_from', '=', today),
                        ('holiday_status_id', '=', unpaid_leave_type.id),
                        ('state', '!=', 'cancel')
                    ], limit=1)

                    if not existing_leave:
                        leave = self.env['hr.leave'].create({
                            'name': 'Unpaid Leave due to early checkout',
                            'employee_id': employee.id,
                            'holiday_status_id': unpaid_leave_type.id,
                            'request_date_from': today,
                            'date_from': today,
                            'request_date_to': today,
                            'date_to': today,
                            'number_of_days': 1,
                        })
                        self._send_email_notification(employee, leave)

    def _send_email_notification(self, employee, leave):
        # Email body
        email_body = f"""
        <html>
            <body>
                <p>Dear {employee.name},</p>
                <p>This is to inform you that an unpaid leave has been recorded for you on <b>{leave.request_date_from.strftime('%d-%m-%Y')}</b> 
                due to early checkout (before 6:00 PM).</p>
                <p>Please reach out to HR if you have any questions regarding this leave.</p>
                <p>Thank you,</p>
                <p>HR Department</p>
            </body>
        </html>
        """

        # Create and send email
        mail_values = {
            'subject': 'Unpaid Leave Due to Early Checkout',
            'body_html': email_body,
            'email_from': 'hr@yourcompany.com',
            'email_to': employee.work_email,
            'auto_delete': False,
        }
        mail = self.env['mail.mail'].create(mail_values)
        mail.send()
    def cron_send_leaves_taken_email(self):
        today = date.today()
        tomorrow = today + timedelta(1)
        firstday = today.replace(day=1)
        res1 = calendar.monthrange(today.year, today.month)[1]
        lastday = today.replace(day=res1)
        totalday = str(lastday).split("-")[2]
        totaldays = int(str(totalday).split(" ")[0])
        list_of_employee = []
        list_of_employees = []
        holi_days = self.env['hr.leave'].sudo().search([('state','!=','refuse')])
        list_of_employee.append(holi_days)
        year = today.year
        month = today.month
        toyear = tomorrow.year
        tomonth = tomorrow.month
        list1= []
        list2 = []
        val = self.env['hr.leave.type'].search([])
        for vals in val:
            list2.append(vals.display_name)
        holidays =  ['2024-01-01', '2024-01-15','2024-03-25','2024-08-15','2024-08-19','2024-08-26','2024-11-01']
        for hol in holi_days:
                if hol.holiday_status_id.name in list2:
                    if hol.employee_id.resource_calendar_id.name == 'Standard 48 hours/week' :
                        if int(str(hol.request_date_from).split("-")[0]) == year: 
                            if int(str(hol.request_date_from).split("-")[1]) == month or int(str(hol.request_date_to).split("-")[1]) == month: 
                                nextmonth = lastday + datetime.timedelta(days = 1)
                                total_day = np.busday_count(firstday,nextmonth,weekmask=[1,1,1,1,1,0,0],holidays=holidays)
                                list1.append(hol)
                            else:
                                date_generated = np.arange(hol.request_date_from, hol.request_date_to)
                                if firstday in date_generated:
                                    list1.append(hol)
                    elif hol.employee_id.resource_calendar_id.name == 'Standard 40 hours/week':
                        if int(str(hol.request_date_from).split("-")[0]) == year: 
                            if int(str(hol.request_date_from).split("-")[1]) == month or int(str(hol.request_date_to).split("-")[1]) == month: 
                                nextmonth = lastday + datetime.timedelta(days = 1)
                                total_day = np.busday_count(firstday,nextmonth,weekmask=[1,1,1,1,1,1,0],holidays=holidays)
                                list1.append(hol)
                            else:
                                date_generated = np.arange(hol.request_date_from, hol.request_date_to)
                                if firstday in date_generated:
                                    list1.append(hol)

        leaves_by_employee = {}        
        for leave in list1:
            if leave.employee_id not in leaves_by_employee:
                leave_dict = {}
                for master_leave in list2:
                    leave_dict[master_leave] = 0
                leave_dict[leave.holiday_status_id.name] = leave.number_of_days
            else:
                leave_dict[leave.holiday_status_id.name] += leave.number_of_days
            leaves_by_employee[leave.employee_id.name] = leave_dict

        if leaves_by_employee:
            for key, value in leaves_by_employee.items():
                body = """<html lang="en">
                                <body>
                                    <div>
                                        
                                        </br>
                                        <p>This mail is regarding Employee taken leave this month.</p>
                                        <div class="table-responsive">
                                        <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                            <thead>
                                <tr >
                                    <th style='border: 1px solid #ddd;padding: 10px;'>Name</th>
                                    <th style='border: 1px solid #ddd;padding: 10px;'>Taken Leave</th>
                                </tr>
                            </thead>
                            <tbody>"""
                body += """<tr>
                            <td style='border: 1px solid #ddd;padding: 10px;'>""" + key +""" </td>
                            <td style='border: 1px solid #ddd;padding: 10px;'>""" + str(value) +""" </td>
                            """

                body += """
                        
                    </tr>"""

                body += """</tbody>
                                </table>
                                </div>
                                                <p>Thank you</p>
                                            </div>
                                        </body>
                                    </html>"""
        vals = {
                                    'subject': 'This mail regarding employee taken leave this month.',
                                    'body_html' : body,
                                    'email_from' :'aarti@latitudetechnolabs.com',
                                    'email_to':  'hr@latitudetechnolabs.com',
                                    'auto_delete': False,
                                }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()

    def earned_leave_mail(self):
        today = date.today()
        last_month = today - timedelta(days=today.day)
        first_day_last_month = last_month.replace(day=1)
        work_from_home = self.env['hr.leave.type'].search([('name','in',['Work From Home','Compensatory Off','Comp. Off'])]).ids
        leaves_last_month = self.env['hr.leave'].search([
            ('state', '!=', 'refuse'),
            ('holiday_status_id','not in',work_from_home),
            ('request_date_from', '>=', first_day_last_month),
            ('request_date_to', '<=', last_month)
        ]).mapped('employee_id').mapped('id')
        employee = self.env['hr.employee'].search([('probabtion',"!=", True),('active','=', True)]).mapped('id')
        temp3 = [emp for emp in employee if emp not in leaves_last_month]
        earned = self.env['hr.leave.type'].search([('name',"=","Earned Leave")])       
        if temp3:
            body = """<html lang="en">
                            <body>
                                <div>
                                    </br>
                                    <p>This mail is regarding Employee earned leave add this month.</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                        <tbody>"""
            for emp in temp3:
                allocation = self.env['hr.leave.allocation'].create({
                    'name': 'earned leave',
                    'holiday_status_id': earned.id ,
                    'number_of_days': earned.day,
                    'employee_id': emp ,
                    'state' : 'confirm',}) 
                body += """<tr>
                            <td style='border: 1px solid #ddd;padding: 10px;'>""" + allocation.employee_id.name +""" </td>

                             </tr>"""
                body += """
                        </tr>"""
            body += """</tbody>
                                </table>
                                    </div>
                                        <p>Thank you</p>
                                    </div>
                                </body>
                            </html>"""
            email_values = {'body_html': body}
            vals = {
                    'subject': 'This mail regarding employee earned levave this month.',
                    'body_html' : body,
                    'email_from' :'aarti@latitudetechnolabs.com',
                    'email_to':  'aarti@latitudetechnolabs.com,hr@latitudetechnolabs.com',
                    'auto_delete': False,
                                }
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()

    def compensatory_leave_check(self):
        today = date.today()
        ninety_days_ago = today - timedelta(days=90)
        work_from_home = self.env['hr.leave.type'].search([('name','=','Compensatory Off')])
        allocations_to_delete = self.env['hr.leave.allocation'].search([
        ('holiday_status_id', '=', work_from_home.id),
        ('create_date', '<=', ninety_days_ago)
            ])
        for allocation in allocations_to_delete:
            allocation.write({'state':'draft'})
            allocation.unlink()
        

    def compensatory_leave_create_auto(self):
        today = fields.Date.today()
        yesterday = today - timedelta(days=1)
        extra_leave = self.env['hr.leave.type'].search([('name','=','Comp. Off')])
        comp_leave = self.env['hr.leave.type'].search([('name','=','Compensatory Off')])
        yesterday_records = self.env['hr.leave'].search([
        ('state', '=', 'validate'),
        ('holiday_status_id', '=', extra_leave.id),
        ('request_date_from', '>=', yesterday),
        ('request_date_from', '<', today)
        ])        
        if yesterday_records:
            for rec in yesterday_records:
                yesterday_start = datetime.combine(yesterday, datetime.min.time())
                yesterday_end = datetime.combine(yesterday, datetime.max.time())                
                HRAttendance = self.env['hr.attendance'].search([
                    ('check_in', '>=', fields.Datetime.to_string(yesterday_start)),
                    ('check_in', '<=', fields.Datetime.to_string(yesterday_end)),
                    ('employee_id','=',rec.employee_id.id)
                ]).mapped('worked_hours')
                if rec.request_unit_half:
                    if sum(HRAttendance) >=4:
                        self.env['hr.leave.allocation'].create({
                            'holiday_status_id':comp_leave.id,'employee_id':rec.employee_id.id,'holiday_type':'employee',"number_of_days_display":0.5,'allocation_type':'regular','name':"Comp. Off",'state':'validate'})
                    else: 
                        rec.write({'state':'refuse'})
                if rec.number_of_days >= 1:
                    if sum(HRAttendance) >=(rec.number_of_days)*8:
                        self.env['hr.leave.allocation'].create({
                            'holiday_status_id':comp_leave.id,'employee_id':rec.employee_id.id,'holiday_type':'employee',"number_of_days_display":rec.number_of_days,'allocation_type':'regular','name':"Comp. Off",'state':'validate'})
                    else: 
                        rec.write({'state':'refuse'})

    def cron_manager_assign_inform(self):
        manager_not_assign_employees = self.env['hr.employee'].search([('active', '=', True), ('parent_id', '=', False)])
        manager_assign = []
        for employee in manager_not_assign_employees:
            manager_assign.append(employee.name)
                
        
        hr_body = """<html lang="en">
                    <body>
                        <div>
                            </br>
                            <p>Important! Manager not Assigned in Odoo Profile</p>
                            <div class="table-responsive">
                            <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                            <thead>
                                <tr >
                                    <th style='border: 1px solid #ddd;padding: 10px;'>Employee Name</th>
                                </tr>
                            </thead>
                            <tbody>"""
        for fld in manager_assign:
            hr_body += """<tr>
                <td style='border: 1px solid #ddd;padding: 10px;'>""" + fld+""" </td>"""
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
                'subject': 'Important: Manager not Assigned in odoo',
                'body_html' : hr_body,
                'email_from' :'aarti@latitudetechnolabs.com',
                'email_to': "hr@latitudetechnolabs.com",
                'auto_delete': False,
                    }
        template = self.env.ref('employee_notification.email_infrom_assign_manager')
        self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=vals)


class HrLeaveAlias(models.Model):
    _inherit = 'hr.leave' 

    @api.model
    def create(self, vals):
        if 'number_of_days' in vals:
            if vals['number_of_days']> 0 and vals['number_of_days']<0.5:
                vals['number_of_days']=0.5
            if vals['number_of_days']> 0.5 and vals['number_of_days']<1:
                vals['number_of_days']=1
        res = super(HrLeaveAlias, self).create(vals)
        return res

    @api.constrains('employee_id')
    def check_employee(self):
        # user = request.env['res.users'].sudo().browse(request.session.uid)
        holi_days = self.env['hr.leave'].search([('state','!=','refuse')])
        active_id = self.env.context.get('active_id') if self.env.context.get(
        'active_id') else self.id
        user = self.env['hr.leave'].search([('id', '=', active_id),('state','!=','refuse'),('name','=','Casual Leave 2026')])
        today = date.today()
        year = today.year
        month = today.month
        list1 = []
        for hol in holi_days:
                if int(str(hol.request_date_from).split("-")[0]) == year:
                    if int(str(hol.request_date_from).split("-")[1]) == month or int(str(hol.request_date_to).split("-")[1]) == month:
                        if hol.employee_id == user.employee_id:
                            list1.append(hol)
        val = 0
        if list1:
            for emp in list1:
                val += emp.number_of_days 
                if val > 3:
                    raise ValidationError(_('You can apply maximum of 3.0 days leave per month.'))   

    @api.constrains('employee_id')
    def _validate_work_hours(self):
        now = date.today()
        day_7 = now + timedelta(days=7)
        day_15 = now + timedelta(days=15)
        if self.number_of_days == 1 and  self.holiday_status_id.name == 'Casual Leave 2026' and self.holiday_status_id.name == 'Earned Leave':
            if self.request_date_from <= day_7:
                raise ValidationError("You can apply leave 7.0 days ago.")
        elif self.number_of_days == 0.5 and  self.holiday_status_id.name == 'Casual Leave 2026' and self.holiday_status_id.name == 'Earned Leave':
            if self.request_date_from <= day_7:
                raise ValidationError("You can apply leave 7.0 days ago.")
        elif self.number_of_days <=2 and self.holiday_status_id.name == 'Casual Leave 2026' and self.holiday_status_id.name == 'Earned Leave':
            if self.request_date_from <= day_15:
                raise ValidationError("You can apply leave 15.0 days ago.")
            
      
class MissedAttendance(models.Model):
    _name = 'missed.attendance'

    name = fields.Char('Name')
    miss_date = fields.Date('Missed Date')
    employee_id = fields.Many2one('hr.employee','Employee')
    

class HrDepartureWizard(models.TransientModel):
    _inherit = 'hr.departure.wizard'


    def action_register_departure(self):
        manager_assign_employees = self.env['hr.employee'].search([('active', '=', True), ('parent_id', '=', self.employee_id.id)])
        manager_assign = []
        for employee in manager_assign_employees:
            employee.sudo().write({'parent_id':False,'coach_id':False})
            manager_assign.append(employee.name)
        if manager_assign:
            hr_body = """<html lang="en">
                        <body>
                            <div>
                                </br>
                                <p>Important! Manager not Assigned in Odoo Profile</p>
                                <div class="table-responsive">
                                <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                                <thead>
                                    <tr >
                                        <th style='border: 1px solid #ddd;padding: 10px;'>Employee Name</th>
                                    </tr>
                                </thead>
                                <tbody>"""
            for fld in manager_assign:
                hr_body += """<tr>
                    <td style='border: 1px solid #ddd;padding: 10px;'>""" + fld+""" </td>"""
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
                    'subject': 'Important: Manager not Assigned in odoo',
                    'body_html' : hr_body,
                    'email_from' :'aarti@latitudetechnolabs.com',
                    'email_to': "hr@latitudetechnolabs.com",
                    'auto_delete': False,
                        }
            template = self.env.ref('employee_notification.email_infrom_manager_assign')
            self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=vals)

        super(HrDepartureWizard, self).action_register_departure()
        