from odoo import api, fields, models, _
import datetime, time, dateutil
from dateutil.relativedelta import relativedelta
from datetime import timedelta, date, datetime
from odoo.exceptions import UserError,ValidationError
import calendar
# import logging

# _logger = logging.getLogger(__name__)

class EmployeeCategory(models.Model):
    _inherit = 'hr.employee.category'

    on_probabtion = fields.Boolean("On Probabtion")


class HrEmployee(models.Model):
    _inherit = 'hr.leave.allocation'

    date_start = fields.Date('Date Start')


class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    probabtion_time = fields.Integer("Probabtion period", default=6)

    def accural_leave_for_on_probation_emp(self):
        is_on_probation = False
        for val in self.category_ids:
            if val.on_probabtion:
                is_on_probation = True
            
        if self.joining_date and is_on_probation:

            date = self.joining_date

            
            fome = date + dateutil.relativedelta.relativedelta(months=self.probabtion_time)
            if fome <= date.today():
                raise UserError(_('Your Probabtion Is Over'))
            else:
                
                if self.env['hr.leave.allocation'].search(
                        [("employee_id", "=", self.id), ('allocation_type', "=", "accrual")]):
                    raise UserError(_("already one accural leave is allocated."))
                else:
                    leave_type_id = self.env['ir.config_parameter'].sudo().get_param('probation.leave.type.id',False)
                    if not leave_type_id:
                        raise UserError(_("Leave type is not set , please set it."))
                    allocation = self.env['hr.leave.allocation'].create({
                        'name': 'accural leave',
                        'holiday_status_id': int(leave_type_id),
                        'number_of_days': 1,
                        'allocation_type': 'accrual',
                        'employee_id': self.id,
                        'date_from': date,
                        'date_to': fome,
                        'number_per_interval': 1,
                        'interval_number': 1,
                        'interval_unit': 'months',
                        'unit_per_interval': 'days',
                        'state': 'validate',
                    })
        else:
            raise UserError(_("Employee Joining Date Not Set or user is not on probation"))


    def _regular_leave(self):
        leave = self.env['hr.leave.allocation'].search([('date_start','!=', False),('state','in',('draft', 'confirm'))])
        for le in leave:
            if le.date_start == date.today():
                le.write({'state' : 'validate'})
    
    def quarterly_wfh_allocate(self):
        wfh_type = self.env['hr.leave.type'].search([('name','=','Work From Home'),('active','=',True)])
        employee = self.env['hr.employee'].search([])
        for emp in employee:
            body = """<html lang="en">
                            <body>
                                <div>
                                    </br>
                                    <p>This mail is regarding Work from home add to this quarter.</p>
                                    <div class="table-responsive">
                                    <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: auto;">
                        <tbody>"""
            allocation = self.env['hr.leave.allocation'].create({
                'name': 'Work From Home',
                'holiday_status_id': wfh_type.id ,
                'number_of_days': 3,
                'employee_id': emp.id ,
                'state' : 'validate',}) 
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
                    'subject': 'Work from home added for this quarter.',
                    'body_html' : body,
                    'email_from' :'aarti@latitudetechnolabs.com',
                    'email_to':  emp.work_email,
                    'auto_delete': False,
                                }
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
            

class HRLeave(models.Model):
    _inherit = 'hr.leave'


    def unlink(self):
        is_admin = self.env.user.has_group('hr_holidays.group_hr_holidays_manager')  
        if not is_admin:
            raise ValidationError(('Sorry You cannot Delete Leave request,Only Time off Admin can Delete'))
        return super(HRLeave, self).unlink()
    
    def write(self, vals):
        if self.holiday_status_id:
            if self.holiday_status_id.filtered(lambda l: l.name == "Comp. Off"):
                is_admin = self.env.user.has_group('hr_holidays.group_hr_holidays_manager')  
                if not is_admin:
                    all_holidays = self.env['public.holidays'].search([])
                    holidays = (all_holidays.mapped('holidays_line')).mapped('leave_date')
                    req_date= self.request_date_from
                    if 'request_date_from' in vals:
                        if type(vals['request_date_from']) is str:
                            req_date = datetime.strptime(vals['request_date_from'], '%Y-%m-%d').date()
                    
                    if req_date.weekday() == 5 or req_date.weekday() == 6 or req_date in holidays:
                        if date.today() > req_date:
                            raise ValidationError("Comp. Off leave apply before 1 day")
                    else:
                        raise ValidationError("Comp. Off leave only create on saturday or sunday or public holidays")
                    # if "number_of_days" in vals:
                    # if "request_unit_half" in vals:
                        
                    if vals.get('request_unit_half'):
                        vals['number_of_days'] = 0.5
                        # res = super(HRLeave, self).write(vals)
                        # return res
                    elif self.request_unit_half and 'request_unit_half' not in vals:
                        # if 'request_unit_half' not in vals:
                        vals['number_of_days'] = 0.5
                    else:
                        leave_date_from = fields.Date.from_string(vals.get('request_date_from')) if vals.get('request_date_from') else self.request_date_from
                        leave_date_to = fields.Date.from_string(vals.get('request_date_to')) if vals.get('request_date_to') else self.request_date_to
                        vals['number_of_days'] = (leave_date_to - leave_date_from).days + 1
        res = super(HRLeave, self).write(vals)
        return res

    @api.model
    def create(self, vals):
        if vals.get('holiday_status_id'):
            leave_type = self.env['hr.leave.type'].browse(vals['holiday_status_id'])
            if leave_type.name == "Comp. Off":
                all_holidays = self.env['public.holidays'].search([])
                holidays = (all_holidays.mapped('holidays_line')).mapped('leave_date')
                req_date= vals['request_date_from']
                if type(vals['request_date_from']) is str:
                    req_date = datetime.strptime(vals['request_date_from'], '%Y-%m-%d').date()
                
                if req_date.weekday() == 5 or req_date.weekday() == 6 or req_date in holidays:
                    if date.today() > req_date:
                        raise ValidationError("Comp. Off leave apply before 1 day")
                else:
                    raise ValidationError("Comp. Off leave only create on saturday or sunday or public holidays")
                if "request_unit_half" in vals:
                    if vals['request_unit_half']:
                        vals['number_of_days'] = 0.5
                    else:
                        leave_date_from = fields.Date.from_string(vals.get('request_date_from'))
                        leave_date_to = fields.Date.from_string(vals.get('request_date_to'))
                        vals['number_of_days'] = (leave_date_to - leave_date_from).days + 1
            work_from_home = self.env['hr.leave.type'].search([('name', '=', 'Work From Home')], limit=1)
            
            if leave_type and leave_type.name != 'Work From Home':
                employee_id = vals.get('employee_id')
                leave_date_from = fields.Date.from_string(vals.get('request_date_from'))
                leave_date_to = fields.Date.from_string(vals.get('request_date_to'))
                if employee_id and leave_date_from and leave_date_to:
                    overlapping_leave = self.search([
                        ('employee_id', '=', employee_id),
                        ('state', 'not in', ['cancel', 'refuse']),
                        # ('holiday_status_id', '=', work_from_home.id),
                        ('date_from', '<=', leave_date_to),
                        ('date_to', '>=', leave_date_from)
                    ], limit=1)

                    if overlapping_leave:
                        print("Overlapping leave found: %s", overlapping_leave)
                        number_of_days = (leave_date_to - leave_date_from).days + 1 
                         # Calculate number of days
                        if overlapping_leave.date_from.date() == leave_date_from and overlapping_leave.date_to.date() == leave_date_to and overlapping_leave.holiday_status_id == leave_type:
                            raise ValidationError("You are applying Duplicate leave on Same Day,You have already a Application on Same days")

                        if overlapping_leave.date_from.date() == leave_date_from and overlapping_leave.date_to.date() == leave_date_to:
                            overlapping_leave.sudo().write({'state': 'refuse'})
                            new_leave = self.env['hr.leave'].sudo().create({
                                'name': vals.get('name'),
                                'employee_id': employee_id,
                                'holiday_status_id': leave_type.id,
                                'request_date_from': leave_date_from,
                                'date_from': leave_date_from,
                                'request_date_to': leave_date_to,
                                'date_to': leave_date_to,
                                'number_of_days': number_of_days,
                            })
                            return new_leave
                        
                        elif overlapping_leave.date_to.date() == leave_date_to and leave_date_from <= overlapping_leave.date_to.date():
                            overlap_date_to = overlapping_leave.request_date_to
                            state = overlapping_leave.state
                            overlapping_leave.sudo().write({'state': 'draft'})
                            overlapping_leave.sudo().write({"request_date_to": leave_date_from - timedelta(days=1),"number_of_days": ((leave_date_from - timedelta(days=1)) - overlapping_leave.request_date_from).days + 1})
                            overlapping_leave.sudo().write({"state": state})
                            new_leave = self.env['hr.leave'].sudo().create({
                                'name': vals.get('name'),
                                'employee_id': employee_id,
                                'holiday_status_id': leave_type.id,
                                'request_date_from': leave_date_from,
                                'date_from': leave_date_from,
                                'request_date_to': leave_date_to,
                                'date_to': leave_date_to,
                                'number_of_days': number_of_days,
                            })
                            return new_leave
                        else:
                            overlap_date_to = overlapping_leave.request_date_to
                            state = overlapping_leave.state
                            overlapping_leave.sudo().write({"state": 'draft'})
                            if (leave_date_from - timedelta(days=1)).weekday() == 5:
                                overlapping_leave.sudo().write({"request_date_to": leave_date_from - timedelta(days=2),"number_of_days": ((leave_date_from - timedelta(days=2)) - overlapping_leave.request_date_from).days + 1})
                            else:
                                overlapping_leave.sudo().write({"request_date_to": leave_date_from - timedelta(days=1),"number_of_days": ((leave_date_from - timedelta(days=1)) - overlapping_leave.request_date_from).days + 1})
                    
                            overlapping_leave.sudo().write({"state": state})
                            new_leave_days = (overlap_date_to - (leave_date_to + timedelta(days=1))).days + 1
                            if (leave_date_to + timedelta(days=1)).weekday() == 6:

                                new_leave = self.env['hr.leave'].sudo().create({
                                    'name': overlapping_leave.name,
                                    'employee_id': overlapping_leave.employee_id.id,
                                    'holiday_status_id': overlapping_leave.holiday_status_id.id,
                                    'request_date_from': leave_date_to + timedelta(days=2),
                                    'date_from': leave_date_to + timedelta(days=2),
                                    'request_date_to': overlap_date_to,
                                    'date_to': overlap_date_to,
                                    'number_of_days': (overlap_date_to - (leave_date_to + timedelta(days=2))).days + 1,
                                    
                                })
                            else:
                                new_leave = self.env['hr.leave'].sudo().create({
                                'name': overlapping_leave.name,
                                'employee_id': overlapping_leave.employee_id.id,
                                'holiday_status_id': overlapping_leave.holiday_status_id.id,
                                'request_date_from': leave_date_to + timedelta(days=1),
                                'date_from': leave_date_to + timedelta(days=1),
                                'request_date_to': overlap_date_to,
                                'date_to': overlap_date_to,
                                'number_of_days': new_leave_days,
                                
                            })
                            new_leave.sudo().write({'state':state})
                            print("Created split new leave: %s", new_leave)

                            if leave_date_from <= leave_date_to:
                                instant_leave = self.env['hr.leave'].sudo().create({
                                    'name': vals.get('name'),
                                    'employee_id': overlapping_leave.employee_id.id,
                                    'holiday_status_id': leave_type.id,
                                    'request_date_from': leave_date_from,
                                    'date_from': leave_date_from,
                                    'request_date_to': leave_date_to,
                                    'date_to': leave_date_to,
                                    'number_of_days': number_of_days,
                                })
                                print("Created instant leave: %s", instant_leave)
                                return instant_leave
                            else:
                                print("The start date must be earlier than the end date.")
        res = super(HRLeave, self).create(vals)
        return res

    @api.constrains('request_date_from', 'request_date_to')
    def check_sick_dates(self):
        wfh = self.search([
                        ('employee_id', '=', self.employee_id.id),
                        ('state', 'not in', ['cancel', 'refuse']),
                        # ('holiday_status_id', '=', wfh_type.id),
                        ('date_from', '<=', self.request_date_from),
                        ('date_to', '>=', self.request_date_to)
                    ], limit=1)
        if not self.env.user.has_group('hr_holidays.group_hr_holidays_manager'):
            if wfh.holiday_status_id.name != 'Work From Home':
                if self.holiday_status_id.restic_level == True:
                    # wfh_type = self.env['hr.leave.type'].search([('name','=','Work From Home'),('active','=',True)])
                    if self.holiday_status_id.name == 'Work From Home' or self.holiday_status_id.name == 'Compensatory Off' or self.holiday_status_id.name == 'Earned Leave':
                        days_before = self.holiday_status_id.leave_request_before
                        min_request_date = date.today() + dateutil.relativedelta.relativedelta(days=days_before)
                        if self.request_date_from <= min_request_date:
                            raise UserError(_('You can only apply for %s at least %s days in advance.') % (self.holiday_status_id.name, days_before))
                    else:
                        is_consecutive_leave = self._check_consecutive_leave()
                        days_before = 15 if is_consecutive_leave else self.holiday_status_id.leave_request_before
                        min_request_date = date.today() + dateutil.relativedelta.relativedelta(days=days_before)
                        if self.request_date_from <= min_request_date:
                            raise UserError(_('You can only apply for %s at least %s days in advance.') % (self.holiday_status_id.name, days_before))
                
    def _check_consecutive_leave(self):
        day_before = self.request_date_from - dateutil.relativedelta.relativedelta(days=1)
        day_after = self.request_date_to + dateutil.relativedelta.relativedelta(days=1)
        leave_type = self.env['hr.leave.type'].search([('name','in',['Work From Home','Compensatory Off','Comp. Off'])]).ids
        leave_before = self.env['hr.leave'].search([
            ('employee_id', '=', self.employee_id.id),
            ('request_date_to', '=', day_before),
            # ('holiday_status_id', '!=', leave_type)
            ('holiday_status_id','not in',leave_type),
        ], limit=1)
        leave_after = self.env['hr.leave'].search([
            ('employee_id', '=', self.employee_id.id),
            ('request_date_from', '=', day_after),
            ('holiday_status_id', 'not in', leave_type)
        ], limit=1)
        return bool(leave_before or leave_after)

    @api.constrains('number_of_days','holiday_status_id','request_date_from')
    def check_casual_leave(self):
        for rec in self:
            if not self.env.user.has_group('hr_holidays.group_hr_holidays_manager'):
                if rec.holiday_status_id.name == 'Casual Leave 2026':
                    if rec.request_date_from:
                        first_day_of_month = datetime(
                            year=rec.request_date_from.year,
                            month=rec.request_date_from.month,
                            day=1,
                            hour=0,
                            minute=0,
                            second=0,
                            microsecond=0
                        )
                        _, last_day_of_month = calendar.monthrange(first_day_of_month.year, first_day_of_month.month)
                        last_day_of_month = datetime(
                            year=first_day_of_month.year,
                            month=first_day_of_month.month,
                            day=last_day_of_month,
                            hour=23,
                            minute=59,
                            second=59,
                            microsecond=999999
                        )
                        last_day_of_month += timedelta(days=1) - timedelta(microseconds=1)
                        existing_leaves = self.env['hr.leave'].search([
                            ('id', '!=', rec.id),
                            ('employee_id', '=', rec.employee_id.id),
                            ('holiday_status_id', '=', rec.holiday_status_id.id),
                            ('state', 'in', ['validate','confirm','validate1']),
                            ('request_date_from', '>=', first_day_of_month),
                            ('request_date_to', '<', last_day_of_month)
                        ])
                        total_existing_leave_days = sum(existing_leaves.mapped('number_of_days'))
                        if rec.number_of_days + total_existing_leave_days > 3:
                            raise ValidationError("You can't take more than 3 Casual leave in a month")

    def action_approve_manager(self):
        current_employee = self.env.user.employee_id
        self.filtered(lambda hol: hol.validation_type == 'both').write({'state': 'validate1', 'first_approver_id': current_employee.id})
        for holiday in self.filtered(lambda holiday: holiday.employee_id.user_id):
            holiday.message_post(
                body=_(
                    'Your %(leave_type)s planned on %(date)s has been accepted',
                    leave_type=holiday.holiday_status_id.display_name,
                    date=holiday.date_from
                ),
                partner_ids=holiday.employee_id.user_id.partner_id.ids)

        self.filtered(lambda hol: not hol.validation_type == 'both').action_validate()
        if not self.env.context.get('leave_fast_create'):
            self.activity_update()
        return True
    
    def action_validate(self):
        if self.state == "validate1":
            if not self.env.user.has_group('hr_holidays.group_hr_holidays_manager'):
                raise UserError(_("Only Time Off Officer can Approve the second Approval"))
            if self.holiday_status_id.name == 'Work From Home' and self.number_of_days >=4:
                body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>Your WFH request has been approved, Please contact to Smit Prajapati for getting Work folio access for remote working set up,</p>
                                            <p>Note:- Work folio is must for WFH set up, if you do WFH without workfolio set up will consider LOP for those days .</p>
                                            """
                body += """
                            </div>
                                <p>Thank you</p>
                            </div>
                        </body>
                            </html>"""
            
                vals = { 'subject': 'Approval of WFH Request and Workfolio Access Instructions',
                        'body_html' : body,
                        'email_from' :'hr@latitudetechnolabs.com',
                        'email_to':  self.employee_id.work_email,
                        'auto_delete': False,
                                    }
                mail_id = self.env['mail.mail'].sudo().create(vals)
                mail_id.sudo().send()
                it_body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>"""+self.employee_id.name+""" is taking Work from home from """+str(self.request_date_from) +""" to """+str(self.request_date_to)+""",</p>
                                            <p>Note:- Work folio is must for WFH set up, </p>
                                            """
                it_body += """
                            </div>
                                <p>Thank you</p>
                            </div>
                        </body>
                            </html>"""
            
                vals = { 'subject': 'Approval of WFH Request and Workfolio Access Instructions',
                        'body_html' : it_body,
                        'email_from' :'hr@latitudetechnolabs.com',
                        'email_to':  "smit.p@latitudetechnolabs.org",
                        'auto_delete': False,
                                    }
                mail_id = self.env['mail.mail'].sudo().create(vals)
                mail_id.sudo().send()
        return super(HRLeave, self).action_validate()


    @api.constrains('request_date_from', 'holiday_status_id', 'employee_id')
    def _check_new_employee_leave_rules(self):
        for rec in self:
            if not rec.employee_id or not rec.request_date_from or not rec.holiday_status_id:
                continue

            # Only apply to Casual & Sick Leave
            if rec.holiday_status_id.name not in ['Casual Leave 2026', 'Sick Leave 2026']:
                continue

            # Exclude unpaid leave explicitly
            if rec.holiday_status_id.name == 'Unpaid Leave 2026':
                continue

            joining_date = rec.employee_id.joining_date or rec.employee_id.create_date.date()
            if not joining_date:
                continue

            today = rec.request_date_from

            # Rule: Can apply leave only after 30 days from joining
            if (today - joining_date).days < 30:
                raise ValidationError("You can apply leave only after completing 30 days from your joining date.")

            # Apply rule only for first 6 months
            months_completed = (today.year - joining_date.year) * 12 + (today.month - joining_date.month)
            if months_completed >= 6:
                return

            # Calculate how many leaves allowed till this month
            allowed_leaves = months_completed + 1  # Month 1 → 1, Month 2 → 2, etc.

            # Count already taken Casual/Sick leaves in first 6 months
            first_six_month_end = joining_date + relativedelta(months=6)
            existing_leaves = self.env['hr.leave'].search([
                ('employee_id', '=', rec.employee_id.id),
                ('holiday_status_id.name', 'in', ['Casual Leave 2026', 'Sick Leave 2026']),
                ('state', 'not in', ['cancel', 'refuse']),
                ('request_date_from', '>=', joining_date),
                ('request_date_from', '<', first_six_month_end),
            ])

            total_taken = sum(existing_leaves.mapped('number_of_days'))

            if total_taken + rec.number_of_days > allowed_leaves:
                raise ValidationError(
                    f"You are allowed only {allowed_leaves} leave(s) in your first {months_completed + 1} month(s). "
                    f"You have already taken {total_taken} leave(s)."
                )

    @api.constrains('request_date_from', 'request_date_to', 'holiday_status_id', 'employee_id')
    def _check_sick_leave_consecutive_and_notify(self):
        for rec in self:
            if not rec.employee_id or not rec.request_date_from or not rec.holiday_status_id:
                continue

            # Apply only to Sick Leave
            if rec.holiday_status_id.name != 'Sick Leave 2026':
                continue

            employee = rec.employee_id
            start_date = rec.request_date_from
            end_date = rec.request_date_to

            # Find previous and next sick leaves
            prev_leave = self.search([
                ('employee_id', '=', employee.id),
                ('holiday_status_id.name', '=', 'Sick Leave 2026'),
                ('state', 'not in', ['cancel', 'refuse']),
                ('request_date_to', '=', start_date - timedelta(days=1))
            ], limit=1)

            next_leave = self.search([
                ('employee_id', '=', employee.id),
                ('holiday_status_id.name', '=', 'Sick Leave 2026'),
                ('state', 'not in', ['cancel', 'refuse']),
                ('request_date_from', '=', end_date + timedelta(days=1))
            ], limit=1)

            # Check Friday → Monday case
            is_friday_monday = (
                start_date.weekday() == 4 and  # Friday
                prev_leave and prev_leave.request_date_to.weekday() == 4
            ) or (
                end_date.weekday() == 0 and  # Monday
                prev_leave and prev_leave.request_date_to.weekday() == 4
            )

            # Check consecutive sick leave (2 or more days continuously)
            is_consecutive = rec.number_of_days >= 2 or prev_leave or next_leave or is_friday_monday

            if is_consecutive:
                body = f"""
                    <html>
                        <body>
                            <p>Dear {employee.name},</p>
                            <p>You have applied for consecutive sick leave (more than one day).</p>
                            <p>As per company policy, please submit your medical certificate to the HR department within <b>5 working days</b> from the date the sick leave was taken.</p>
                            <p>In case of failure to submit the medical certificate within the stipulated time, the applied sick leave will be treated as <b>Leave Without Pay (LOP)</b>.</p>
                            <br/>
                            <p>Thank you,<br/>HR Team</p>
                        </body>
                    </html>
                    """

                vals = {
                    'subject': 'Medical Document Required for Sick Leave',
                    'body_html': body,
                    'email_from': 'hr@latitudetechnolabs.com',
                    'email_to': employee.work_email,
                    'auto_delete': False,
                    'email_cc': 'hr@latitudetechnolabs.com',
                }

                self.env['mail.mail'].sudo().create(vals).sudo().send()

    
class HRLeaveType(models.Model):
    _inherit = 'hr.leave.type'

    restic_level = fields.Boolean("Restric Level")
    leave_request_before = fields.Integer("Allow Leave Request Before")

class HRLeaveAllocation(models.Model):
    _inherit = 'hr.leave.allocation'

    def action_validate(self):
        if self.state == "validate1":
            if not self.env.user.has_group('hr_holidays.group_hr_holidays_manager'):
                raise UserError(_("Only Time Off Officer can Approve the second Approval"))
        return super(HRLeaveAllocation, self).action_validate()