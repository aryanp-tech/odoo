import logging
import math
from datetime import datetime , timedelta,date
from odoo import api, fields, models
from pytz import timezone, UTC
from collections import defaultdict, namedtuple
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo import fields, models,api ,_
from odoo.tools.float_utils import float_round
from odoo.osv import expression



_logger = logging.getLogger(__name__)

DummyAttendance = namedtuple('DummyAttendance', 'hour_from, hour_to, dayofweek, day_period, week_type')

class WorkFromHome(models.Model):
    _name = 'work.from.home'
    _inherit = 'mail.thread'

    name = fields.Char('Description', compute='_compute_description', inverse='_inverse_description', search='_search_description', compute_sudo=False, invisible=True,required = True)
                    #    , domain= [('user_id', '=', user.env.ref('base.user_root').id)])
    state = fields.Selection([
        ('draft', 'To Submit'),
        ('cancel', 'Cancelled'),  # YTI This state seems to be unused. To remove
        ('confirm', 'To Approve'),
        ('refuse', 'Refused'),
        ('validate1', 'Second Approval'),
        ('validate', 'Approved')
        ], string='Status', compute='_compute_state', store=True, tracking=True, copy=False, readonly=False,
        help="The status is set to 'To Submit', when a time off request is created." +
        "\nThe status is 'To Approve', when time off request is confirmed by user." +
        "\nThe status is 'Refused', when time off request is refused by manager." +
        "\nThe status is 'Approved', when time off request is approved by manager.")
    holiday_status_id = fields.Char(default = "Work From Home",string="Time Off Type", required=True, readonly=False)
    employee_id = fields.Many2one(
        'hr.employee', compute='_compute_from_holiday_type', store=True, string='Employee', index=True, readonly=False, ondelete="restrict",
        tracking=True)
    holiday_type = fields.Selection([
        ('employee', 'By Employee'),
        ('company', 'By Company'),
        ('department', 'By Department'),
        ('category', 'By Employee Tag')],
        string='Allocation Mode',  required=True, default='employee',
        states={'draft': [('readonly', False)], 'confirm': [('readonly', False)]},
        help="Allow to create requests in batchs:\n- By Employee: for a specific employee"
             "\n- By Company: all employees of the specified company"
             "\n- By Department: all employees of the specified department"
             "\n- By Employee Tag: all employees of the specific employee group category")
    department_id = fields.Many2one(
        'hr.department', compute='_compute_department_id', store=True, string='Department', readonly=False,)
    
    hide = fields.Boolean("invisibal",compute="_compute_hide")

    notes = fields.Text('Reasons', readonly=True, states={'draft': [('readonly', False)], 'confirm': [('readonly', False)]})
    date_from = fields.Datetime(
        'Start Date', compute='_compute_date_from_to', store=True, readonly=False, index=True, copy=False,  tracking=True,)
    date_to = fields.Datetime(
        'End Date', compute='_compute_date_from_to', store=True, readonly=False, copy=False, tracking=True,)
    number_of_days = fields.Float(
        'Duration (Days)', compute='_compute_number_of_days', store=True, readonly=False, copy=False, tracking=True,
        help='Number of days of the time off request. Used in the calculation. To manually correct the duration, use this field.')
    first_approver_id = fields.Many2one(
        'hr.employee', string='First Approval', readonly=True, copy=False,
        help='This area is automatically filled by the user who validate the time off')
    second_approver_id = fields.Many2one(
        'hr.employee', string='Second Approval', readonly=True, copy=False,
        help='This area is automatically filled by the user who validate the time off with second level (If time off type need second validation)')
    can_approve = fields.Boolean('Can Approve', compute='_compute_can_approve')
    can_reset = fields.Boolean('Can reset', compute='_compute_can_reset')
    request_date_from = fields.Date('Request Start Date')
    request_date_to = fields.Date('Request End Date')
    manager_id = fields.Many2one('hr.employee', compute='_compute_from_employee_id', store=True)
    private_name = fields.Char('Time Off Description', groups='hr_holidays.group_hr_holidays_user')
    meeting_id = fields.Many2one('calendar.event', string='Meeting', copy=False)
    parent_id = fields.Many2one('work.from.home', string='Parent', copy=False)
    linked_request_ids = fields.One2many('work.from.home', 'parent_id', string='Linked Requests')


    @api.depends_context('uid')
    def _compute_description(self):
        self.check_access_rights('read')
        self.check_access_rule('read')

        current_employee = self.env.user.employee_id
        is_officer = self.env.user.has_group('hr_holidays.group_hr_holidays_user')
        is_manager = self.env.user.has_group('hr_holidays.group_hr_holidays_manager')


        for leave in self:
            if is_officer or leave.user_id == self.env.user or leave.employee_id.leave_manager_id == self.env.user:
                leave.name = leave.sudo().private_name
            else:
                leave.name = '*****'

    def _inverse_description(self):
        is_officer = self.user_has_groups('hr_holidays.group_hr_holidays_user')

        for leave in self:
            if is_officer or leave.user_id == self.env.user or leave.employee_id.leave_manager_id == self.env.user:
                leave.sudo().private_name = leave.name

    def _search_description(self, operator, value):
        is_officer = self.user_has_groups('hr_holidays.group_hr_holidays_user')
        domain = [('private_name', operator, value)]

        if not is_officer:
            domain = expression.AND([domain, [('user_id', '=', self.env.user.id)]])

        leaves = self.search(domain)
        return [('id', 'in', leaves.ids)]

    @api.depends('employee_id')
    def _compute_hide(self):
        holiday_managers = self.env.ref('hr_holidays.group_hr_holidays_manager').users
        for emp in self:
            if emp.employee_id == emp.env.user.employee_id:
                self.hide = True
            elif emp.env.user.employee_id == holiday_managers.employee_id:
                self.hide = True
            else:
                self.hide = False

    @api.depends('state', 'employee_id', 'department_id')
    def _compute_can_approve(self):
        for holiday in self:
            try:
                if holiday.state == 'confirm' :
                    holiday._check_approval_update('validate1')
                else:
                    holiday._check_approval_update('validate')
            except (AccessError, UserError):
                holiday.can_approve = False
            else:
                holiday.can_approve = True

    @api.depends('state', 'employee_id', 'department_id')
    def _compute_can_reset(self):
        for holiday in self:
            try:
                holiday._check_approval_update('draft')
            except (AccessError, UserError):
                holiday.can_reset = False
            else:
                holiday.can_reset = True

    @api.depends('employee_id')
    def _compute_from_employee_id(self):
        for holiday in self:
            holiday.manager_id = holiday.employee_id.parent_id.id
            if holiday.employee_id.user_id != self.env.user and self._origin.employee_id != holiday.employee_id:
                holiday.holiday_status_id = False

    @api.depends('holiday_status_id')
    def _compute_state(self):
        for holiday in self:
            if self.env.context.get('unlink') and holiday.state == 'draft':
                # Otherwise the record in draft with validation_type in (hr, manager, both) will be set to confirm
                # and a simple internal user will not be able to delete his own draft record
                holiday.state = 'draft'
            else:
                holiday.state = 'confirm'

    @api.depends('holiday_type')
    def _compute_from_holiday_type(self):
        for allocation in self:
            if allocation.holiday_type == 'employee':
                if not allocation.employee_id:
                    allocation.employee_id = self.env.user.employee_id
                # allocation.category_id = False
            if allocation.holiday_type == 'company':
                allocation.employee_id = False
                # allocation.category_id = False
            elif allocation.holiday_type == 'department':
                allocation.employee_id = False
                # allocation.category_id = False
            elif allocation.holiday_type == 'category':
                allocation.employee_id = False
            elif not allocation.employee_id and not allocation._origin.employee_id:
                allocation.employee_id = self.env.context.get('default_employee_id') or self.env.user.employee_id


    def action_approve(self):
        for rec in self:
            # if rec.employee_id.parent_id 
            if self.env.user.has_group('hr_holidays.group_hr_holidays_manager') or self.env.user.employee_id == rec.employee_id.parent_id:
                rec.state = 'validate'
            else:
                raise UserError(_('Only a Time Off Administator or Your Manager can Approve the request.'))

        return True

    def _remove_resource_leave(self):
        """ This method will create entry in resource calendar time off object at the time of holidays cancel/removed """
        return self.env['resource.calendar.leaves'].search([('holiday_id', 'in', self.ids)]).unlink()
    
    def action_refuse(self):
        for rec in self:
            if self.env.user.has_group('hr_holidays.group_hr_holidays_manager') or self.env.user.employee_id == rec.employee_id.parent_id:
                rec.state = 'refuse'
            else:
                raise UserError(_('Only a Time Off Administator or Your Manager can Approve the request.'))
        return True
       

    @api.depends('request_date_from', 'request_date_to', 'employee_id')
    def _compute_date_from_to(self):
        for holiday in self:
            if holiday.request_date_from and holiday.request_date_to and holiday.request_date_from > holiday.request_date_to:
                holiday.request_date_to = holiday.request_date_from
            if not holiday.request_date_from:
                holiday.date_from = False
            else:
                resource_calendar_id = holiday.employee_id.resource_calendar_id or self.env.company.resource_calendar_id
                domain = [('calendar_id', '=', resource_calendar_id.id), ('display_type', '=', False)]
                attendances = self.env['resource.calendar.attendance'].read_group(domain, ['ids:array_agg(id)', 'hour_from:min(hour_from)', 'hour_to:max(hour_to)', 'week_type', 'dayofweek', 'day_period'], ['week_type', 'dayofweek', 'day_period'], lazy=False)

                # Must be sorted by dayofweek ASC and day_period DESC
                attendances = sorted([DummyAttendance(group['hour_from'], group['hour_to'], group['dayofweek'], group['day_period'], group['week_type']) for group in attendances], key=lambda att: (att.dayofweek, att.day_period != 'morning'))

                default_value = DummyAttendance(0, 0, 0, 'morning', False)

                if resource_calendar_id.two_weeks_calendar:
                    # find week type of start_date
                    start_week_type = int(math.floor((holiday.request_date_from.toordinal() - 1) / 7) % 2)
                    attendance_actual_week = [att for att in attendances if att.week_type is False or int(att.week_type) == start_week_type]
                    attendance_actual_next_week = [att for att in attendances if att.week_type is False or int(att.week_type) != start_week_type]
                    # First, add days of actual week coming after date_from
                    attendance_filtred = [att for att in attendance_actual_week if int(att.dayofweek) >= holiday.request_date_from.weekday()]
                    # Second, add days of the other type of week
                    attendance_filtred += list(attendance_actual_next_week)
                    # Third, add days of actual week (to consider days that we have remove first because they coming before date_from)
                    attendance_filtred += list(attendance_actual_week)

                    end_week_type = int(math.floor((holiday.request_date_to.toordinal() - 1) / 7) % 2)
                    attendance_actual_week = [att for att in attendances if att.week_type is False or int(att.week_type) == end_week_type]
                    attendance_actual_next_week = [att for att in attendances if att.week_type is False or int(att.week_type) != end_week_type]
                    attendance_filtred_reversed = list(reversed([att for att in attendance_actual_week if int(att.dayofweek) <= holiday.request_date_to.weekday()]))
                    attendance_filtred_reversed += list(reversed(attendance_actual_next_week))
                    attendance_filtred_reversed += list(reversed(attendance_actual_week))

                else:
                    # find first attendance coming after first_day
                    attendance_from = next((att for att in attendances if int(att.dayofweek) >= holiday.request_date_from.weekday()), attendances[0] if attendances else default_value)
                    # find last attendance coming before last_day

                compensated_request_date_from = holiday.request_date_from
                compensated_request_date_to = holiday.request_date_to

    def _prepare_resource_leave_vals_list(self):
        """Hook method for others to inject data
        """
        return [{
            'name': leave.name,
            'date_from': leave.date_from,
            'holiday_id': leave.id,
            'date_to': leave.date_to,
            'resource_id': leave.employee_id.resource_id.id,
            'calendar_id': leave.employee_id.resource_calendar_id.id,
            # 'time_type': leave.holiday_status_id.time_type,
            } for leave in self]
    
    def _create_resource_leave(self):
        """ This method will create entry in resource calendar time off object at the time of holidays validated
        :returns: created `resource.calendar.leaves`
        """
        vals_list = self._prepare_resource_leave_vals_list()
        return self.env['resource.calendar.leaves'].sudo().create(vals_list)

    def _validate_leave_request(self):
        """ Validate time off requests (holiday_type='employee')
        by creating a calendar event and a resource time off. """
        holidays = self.filtered(lambda request: request.holiday_type == 'employee')
        holidays._create_resource_leave()
        meeting_holidays = holidays.filtered(lambda l: l.holiday_status_id.create_calendar_meeting)
        meetings = self.env['calendar.event']
        if meeting_holidays:
            meeting_values_for_user_id = meeting_holidays._prepare_holidays_meeting_values()
            for user_id, meeting_values in meeting_values_for_user_id.items():
                meetings += self.env['calendar.event'].with_user(user_id or self.env.uid).with_context(
                                no_mail_to_attendees=True,
                                active_model=self._name
                            ).create(meeting_values)
        Holiday = self.env['work.from.home']
        for meeting in meetings:
            Holiday.browse(meeting.res_id).meeting_id = meeting

    
    
    @api.depends('number_of_hours_display', 'number_of_days_display')
    def _compute_duration_display(self):
        for leave in self:
            leave.duration_display = '%g %s' % (
                (float_round(leave.number_of_hours_display, precision_digits=2)))

    @api.depends_context('uid')
    def _compute_description_value(self):
        self.check_access_rights('read')
        self.check_access_rule('read')

        is_officer = self.user_has_groups('hr_holidays.group_hr_holidays_user')
    
    @api.depends('employee_id')
    def _compute_department_id(self):
        for holiday in self:
            holiday.department_id = holiday.employee_id.department_id
            

    @api.depends('state', 'employee_id', 'department_id')
    def _compute_can_reset(self):
        for holiday in self:
            try:
                holiday._check_approval_update('draft')
            except (AccessError, UserError):
                holiday.can_reset = False
            else:
                holiday.can_reset = True

    @api.depends('request_date_from', 'request_date_to')
    def _compute_number_of_days(self):
        for holiday in self:
            if holiday.request_date_from and holiday.request_date_to:
                if holiday.request_date_from != holiday.request_date_to :
                    days = holiday.request_date_to  - holiday.request_date_from 
                    val = str(days)
                    vals = val.split()
                    holiday.number_of_days = int(vals[0]) + 1
                elif holiday.request_date_from == holiday.request_date_to:
                    holiday.number_of_days = 1
            else:
                holiday.number_of_days = 0


    def _check_approval_update(self, state):
        """ Check if target state is achievable. """
        if self.env.is_superuser():
            return

        current_employee = self.env.user.employee_id
        is_officer = self.env.user.has_group('hr_holidays.group_hr_holidays_user')
        is_manager = self.env.user.has_group('hr_holidays.group_hr_holidays_manager')

        for holiday in self:
            if not is_manager and state != 'confirm':
                if state == 'draft':
                    if holiday.state == 'refuse':
                        raise UserError(_('Only a Time Off Manager can reset a refused leave.'))
                    if holiday.date_from and holiday.date_from.date() <= fields.Date.today():
                        raise UserError(_('Only a Time Off Manager can reset a started leave.'))
                    if holiday.employee_id != current_employee:
                        raise UserError(_('Only a Time Off Manager can reset other people leaves.'))

    @api.model_create_multi
    def create(self, vals):
        events = super(WorkFromHome, self).create(vals)
        for event in events:
            template = self.env.ref('work_from_home.send_email_request')
            self.env['mail.template'].browse(template.id).send_mail(event.id, force_send=True)
        return event
    
    def unlink(self):
        for rec in self:
            if rec.state == 'validate' or rec.state == 'refuse':
                raise ValidationError("You can't delete Approved Records")
        return super(WorkFromHome, self).unlink()
    
        
    def write(self, values):
        is_officer = self.env.user.has_group('hr_holidays.group_hr_holidays_user') or self.env.is_superuser()

        if not is_officer and values.keys() - {'message_main_attachment_id'}:
            if any(hol.date_from.date() < fields.Date.today() and hol.employee_id.leave_manager_id != self.env.user for hol in self):
                raise UserError(_('You must have manager rights to modify/validate a time off that already begun'))

        employee_id = values.get('employee_id', False)
        if not self.env.context.get('leave_fast_create'):
            if values.get('state'):
                self._check_approval_update(values['state'])
            if 'date_from' in values:
                values['request_date_from'] = values['date_from']
            if 'date_to' in values:
                values['request_date_to'] = values['date_to']
        result = super(WorkFromHome, self).write(values)
        if not self.env.context.get('leave_fast_create'):
            for holiday in self:
                if employee_id:
                    holiday.add_follower(employee_id)
        return result
    
    def cron_send_wfh_manager(self):
        today = date.today()
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        action_id = self.env['ir.actions.actions'].search([('name','=','Work From Home')])
        
        wfh = self.env['work.from.home'].search([('state','=','confirm'),('request_date_from','>=',today)])
        for rec in wfh:
            if rec.employee_id.parent_id:
                url = base_url + "/web#id="+str(rec.id)+"&action="+str(action_id.id)+"&model=work.from.home&view_type=form"
                body = """<html lang="en">
                                    <body>
                                        <div>
                                            
                                            </br>
                                            <p>This mail is regarding """ + rec.employee_id.name+ """  is applying for work from home in odoo. So Approve or Cancel this request in odoo</p>
                                            """
                body += """
                            </div>
                            <a href="""+ url +""">Click here to view the Wfh Request </a>
                                <p>Thank you</p>
                            </div>
                        </body>
                            </html>"""
                
                email_values = {'body_html': body,
                                'email_to': rec.employee_id.parent_id.work_email,
                                'email_from' :'aarti@latitudetechnolabs.com',
                                'auto_delete': False,
                                }
                
                template = self.env.ref('work_from_home.email_wfh_to_manager')
            
                self.env['mail.template'].browse(template.id).send_mail(self.env.user.id,force_send=True, email_values=email_values)

