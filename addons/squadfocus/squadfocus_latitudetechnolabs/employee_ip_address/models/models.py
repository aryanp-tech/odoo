import datetime
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError
import requests
from odoo.http import request
from dateutil.relativedelta import relativedelta
import logging
import pytz


_logger = logging.getLogger(__name__)


class HrAttendance(models.Model):
    _inherit = "hr.attendance"

    geo_ip = fields.Char(
        string='IP Address',
        help="Employee current IP during Attendance")
    geo_address = fields.Text(
        string='GEO Address',
        help="Employee current address during Attendance")
    geo_country = fields.Many2one(
        'res.country',
        string='GEO Country',
        help="Employee current country during Attendance")

    checkout_ip = fields.Char(
        string='Checkout IP Address',
        help="Employee current IP during Attendance")

    checkout_address = fields.Text(
        string='Check outGEO Address',
        help="Employee current address during Attendance")

    checkout_country = fields.Many2one(
        'res.country',
        string='Checkout GEO Country',
        help="Employee current country during Attendance")

    is_leave = fields.Boolean(
        string='Is Leave Day',
        default=False,
        readonly=True,
        help="Auto-generated record from an approved leave request")
    leave_id = fields.Many2one(
        'hr.leave',
        string='Leave Request',
        ondelete='set null',
        readonly=True)
    leave_type_id = fields.Many2one(
        'hr.leave.type',
        string='Leave Type',
        related='leave_id.holiday_status_id',
        store=True,
        readonly=True)

    is_auto_absent = fields.Boolean(
        string='Auto-Marked Absent',
        default=False,
        readonly=True,
        help="Set by the daily attendance check when the employee did not "
             "complete both check-in and check-out for the day.")
    leave_type_display = fields.Char(
        string='Leave Type',
        compute='_compute_leave_type_display',
        store=True)

    @api.depends('is_auto_absent', 'leave_type_id.name')
    def _compute_leave_type_display(self):
        for attendance in self:
            if attendance.is_auto_absent:
                attendance.leave_type_display = 'Absent'
            else:
                attendance.leave_type_display = attendance.leave_type_id.name or False

    # -------------------------------------------------------------------------
    # Override the core attendance overlap constraint so that leave stubs
    # (is_leave=True) are completely invisible to the check.  This means:
    #   • creating a stub never fails even when the employee is checked in
    #   • a real check-in is never blocked by a stub (half-day, WFH, etc.)
    #   • real-to-real overlap validation is fully preserved
    # -------------------------------------------------------------------------
    @api.constrains('check_in', 'check_out', 'employee_id')
    def _check_validity(self):
        for attendance in self:
            # Stubs are zero-duration markers; they never participate in
            # overlap validation (neither as the record being checked nor as
            # a record that could block another one).
            if attendance.is_leave:
                continue

            # Only compare against other REAL (non-stub) attendance records.
            domain = [
                ('employee_id', '=', attendance.employee_id.id),
                ('id', '!=', attendance.id),
                ('is_leave', '=', False),
            ]

            # 1. Ensure no prior real attendance has an interval that extends
            #    past our check_in (i.e. employee is already checked in).
            last_before = self.env['hr.attendance'].search(
                domain + [('check_in', '<=', attendance.check_in)],
                order='check_in desc', limit=1
            )
            if last_before and last_before.check_out \
                    and last_before.check_out > attendance.check_in:
                raise ValidationError(
                    _('Cannot create new attendance record for %(empl_name)s, '
                      'the employee was already checked in on %(datetime)s') % {
                        'empl_name': attendance.employee_id.name,
                        'datetime': fields.Datetime.to_string(last_before.check_in),
                    }
                )

            if not attendance.check_out:
                # 2. Open check-in: no other open real attendance may exist at
                #    or after ours.
                other_open = self.env['hr.attendance'].search(
                    domain + [
                        ('check_in', '>=', attendance.check_in),
                        ('check_out', '=', False),
                    ], limit=1
                )
                if other_open:
                    raise ValidationError(
                        _('Cannot create new attendance record for %(empl_name)s, '
                          'the employee was already checked in on %(datetime)s') % {
                            'empl_name': attendance.employee_id.name,
                            'datetime': fields.Datetime.to_string(other_open.check_in),
                        }
                    )
            else:
                # 3. Closed record: no other real attendance may start within
                #    our check_in … check_out interval.
                inside = self.env['hr.attendance'].search(
                    domain + [
                        ('check_in', '>=', attendance.check_in),
                        ('check_in', '<', attendance.check_out),
                    ], limit=1
                )
                if inside:
                    raise ValidationError(
                        _('Cannot create new attendance record for %(empl_name)s, '
                          'the employee was already checked in on %(datetime)s') % {
                            'empl_name': attendance.employee_id.name,
                            'datetime': fields.Datetime.to_string(inside.check_in),
                        }
                    )

    def _apply_month_filter(self, domain):
        domain = domain or []
        has_date_filter = any(
            isinstance(leaf, (list, tuple)) and leaf[0] in ('check_in', 'check_out')
            for leaf in domain
        )
        if not has_date_filter:
            today = fields.Date.today()
            first_day = today.replace(day=1)
            next_month = first_day + relativedelta(months=1)
            domain = [
                ('check_in', '>=', first_day.strftime('%Y-%m-%d 00:00:00')),
                ('check_in', '<',  next_month.strftime('%Y-%m-%d 00:00:00')),
            ] + domain
        return domain

    @api.model
    def web_search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        domain = self._apply_month_filter(domain)
        return super(HrAttendance, self).web_search_read(domain, fields, offset, limit, order)

    @api.model
    def search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        domain = self._apply_month_filter(domain)
        return super(HrAttendance, self).search_read(domain, fields, offset, limit, order)

    def _get_real_ip(self):
        """
        Extract real IP address from proxy headers.
        Checks X-Forwarded-For, X-Real-IP, and falls back to REMOTE_ADDR.
        """
        if not request or not request.httprequest:
            return '127.0.0.1'
        
        # Method 1: Check X-Forwarded-For header (preferred for proxy chains)
        forwarded_for = request.httprequest.environ.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            # X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
            # The first IP is the original client IP
            ip = forwarded_for.split(',')[0].strip()
            _logger.info("IP extracted from X-Forwarded-For: %s (full header: %s)" % (ip, forwarded_for))
            return ip
        
        # Method 2: Check X-Real-IP header (set by Nginx)
        real_ip = request.httprequest.environ.get('HTTP_X_REAL_IP')
        if real_ip:
            _logger.info("IP extracted from X-Real-IP: %s" % real_ip)
            return real_ip
        
        # Method 3: Fallback to REMOTE_ADDR (will be 127.0.0.1 behind proxy)
        remote_addr = request.httprequest.environ.get('REMOTE_ADDR', '127.0.0.1')
        _logger.warning("Using REMOTE_ADDR as fallback: %s (This might be localhost if behind proxy)" % remote_addr)
        return remote_addr

    @api.model
    def create(self, vals):
        # When a real check-in is created, remove any WFH leave stub for that same
        # day BEFORE calling super so the constraint never fires.
        # Only WFH stubs are removed — stubs for real absences (sick leave, comp off,
        # earned leave, etc.) must stay intact because those employees should not be
        # checking in and the stub is the correct attendance record for the day.
        _WFH_NAMES = {'work from home', 'wfh', 'work-from-home','Work From Home'}
        if not vals.get('is_leave') and vals.get('employee_id') and vals.get('check_in'):
            check_in_dt = vals['check_in']
            if isinstance(check_in_dt, str):
                check_in_dt = datetime.datetime.strptime(check_in_dt, '%Y-%m-%d %H:%M:%S')
            day_start = check_in_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end   = check_in_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            stubs = self.sudo().search([
                ('employee_id', '=', vals['employee_id']),
                ('check_in', '>=', day_start),
                ('check_in', '<=', day_end),
                ('is_leave', '=', True),
            ])
            stubs.filtered(
                lambda s: (s.leave_id.holiday_status_id.name or '').strip().lower()
                          in _WFH_NAMES
            ).unlink()

            # A real check-in means the day is no longer a no-show — drop the
            # zero-duration "Absent" marker the daily cron may have created for
            # it (but never touch a real punch record that merely got flagged
            # for a missing checkout; that's cleared separately on checkout).
            absent_markers = self.sudo().search([
                ('employee_id', '=', vals['employee_id']),
                ('check_in', '>=', day_start),
                ('check_in', '<=', day_end),
                ('is_auto_absent', '=', True),
            ])
            absent_markers.filtered(lambda s: s.check_in == s.check_out).unlink()

        if not vals.get('is_leave'):
            vals = self.getCurrentLocationData(vals, 'create')
        res = super(HrAttendance, self).create(vals)
        return res

    def write(self, vals):
        if vals.get('check_out') is not None:
            vals = self.getCurrentLocationData(vals, 'write')
            # Providing a real checkout resolves a previously flagged
            # "forgot to checkout" absence — clear the marker instead of
            # leaving the row permanently red.
            vals['is_auto_absent'] = False
        res = super(HrAttendance, self).write(vals)
        return res

    def getCurrentLocationData(self, vals, ttype):
        try:
            # Get real IP address from proxy headers
            ip = self._get_real_ip()
            
            # Log the IP being used for debugging
            _logger.info("Processing %s with IP: %s" % (ttype, ip))
            
            ipUrl = "{}/{}/json".format("https://ipapi.co", ip)
            currentLocation = requests.get(ipUrl, timeout=5)
            
            if currentLocation.status_code == 200:
                data = currentLocation.json()
                ip = data.get('ip')
                countryId = 0
                address = ''
                countryCode = data.get('country_code')
                if countryCode:
                    address = countryCode
                    countryObjs = self.env['res.country'].search([('code', '=', countryCode)])
                    if countryObjs:
                        countryId = countryObjs[0].id
                countryName = data.get('country')
                if countryName:
                    if not address:
                        address = countryName
                    else:
                        address = address + ", " + countryName
                    if not countryId:
                        countryObjs = self.env['res.country'].search([('name', '=', countryName)])
                        if countryObjs:
                            countryId = countryObjs[0].id
                regionCode = data.get('region_code')
                if regionCode:
                    if not address:
                        address = regionCode
                    else:
                        address = address + ", " + regionCode
                regionName = data.get('region')
                if regionName:
                    if not address:
                        address = regionName
                    else:
                        address = address + " " + regionName
                zipCode = data.get('postal')
                latitude = data.get('latitude')
                longitude = data.get('longitude')
                if zipCode:
                    if not address:
                        address = zipCode
                    else:
                        address = address + ", " + zipCode
                if latitude and longitude:
                    address = "{}\nLat: {} Long: {}".format(address, latitude, longitude)
                if ttype == 'write':
                    vals['checkout_ip'] = ip or ''
                    vals['checkout_address'] = address or ''
                    if countryId:
                        vals['checkout_country'] = countryId
                else:
                    vals['geo_ip'] = ip or ''
                    vals['geo_address'] = address or ''
                    if countryId:
                        vals['geo_country'] = countryId
            else:
                _logger.warning("ipapi.co returned status code %s for IP %s" % (currentLocation.status_code, ip))

        except requests.exceptions.Timeout:
            _logger.warning("Timeout while calling ipapi.co for IP: %s" % ip)
        except Exception as e:
            _logger.warning("Error in getCurrentLocationData: %s" % str(e))
            pass
        return vals

    def _cron_mark_daily_absent(self):
        """
        Runs once daily in the evening for the current calendar day. For every
        active employee who was scheduled to work today but has no attendance
        covering both a check-in and a check-out, mark the day Absent:
          - no attendance at all for today -> create a zero-duration marker row
          - checked in but never checked out -> flag the existing open row
        Employees already covered by an approved leave (or its auto-generated
        stub) for today are left untouched.
        """
        today = fields.Date.context_today(self)
        weekday = today.weekday()
        day_start = datetime.datetime.combine(today, datetime.time.min)
        day_end = datetime.datetime.combine(today, datetime.time.max)

        all_holidays = self.env['public.holidays'].search([])
        holiday_dates = (all_holidays.mapped('holidays_line')).mapped('leave_date')
        if today in holiday_dates:
            return

        for employee in self.env['hr.employee'].search([('active', '=', True)]):
            calendar = employee.resource_calendar_id
            if not calendar:
                continue
            is_working_day = any(
                int(att.dayofweek) == weekday for att in calendar.attendance_ids
            )
            if not is_working_day:
                continue

            on_leave = self.env['hr.leave'].sudo().search_count([
                ('employee_id', '=', employee.id),
                ('state', 'not in', ('cancel', 'refuse')),
                ('date_from', '<=', day_end),
                ('date_to', '>=', day_start),
            ])
            if on_leave:
                continue

            leave_stub = self.sudo().search([
                ('employee_id', '=', employee.id),
                ('is_leave', '=', True),
                ('check_in', '>=', day_start),
                ('check_in', '<=', day_end),
            ], limit=1)
            if leave_stub:
                continue

            day_records = self.sudo().search([
                ('employee_id', '=', employee.id),
                ('is_leave', '=', False),
                ('check_in', '>=', day_start),
                ('check_in', '<=', day_end),
            ], order='check_in asc')

            if not day_records:
                self.sudo().with_context(skip_biometric_gate=True).create({
                    'employee_id': employee.id,
                    'check_in': day_start,
                    'check_out': day_start,
                    'is_leave': False,
                    'is_auto_absent': True,
                })
            else:
                last_record = day_records[-1]
                if not last_record.check_out and not last_record.is_auto_absent:
                    last_record.sudo().with_context(skip_biometric_gate=True).write({
                        'is_auto_absent': True,
                    })


class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    @api.depends('last_attendance_id.check_in', 'last_attendance_id.check_out', 'last_attendance_id')
    def _compute_attendance_state(self):
        for employee in self:
            open_att = self.env['hr.attendance'].search([
                ('employee_id', '=', employee.id),
                ('check_out', '=', False),
            ], limit=1)
            employee.attendance_state = open_att and 'checked_in' or 'checked_out'