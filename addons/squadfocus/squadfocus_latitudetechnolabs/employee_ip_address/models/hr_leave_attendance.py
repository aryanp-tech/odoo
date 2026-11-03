# -*- coding: utf-8 -*-
from odoo import api, models
from datetime import datetime, timedelta
import pytz
import logging

_logger = logging.getLogger(__name__)


class HrLeave(models.Model):
    _inherit = 'hr.leave'

    # -------------------------------------------------------------------------
    # Validate: create attendance stubs for every working day in the leave
    # -------------------------------------------------------------------------
    _WFH_LEAVE_NAMES = {'work from home', 'wfh', 'work-from-home'}

    def action_validate(self):
        result = super(HrLeave, self).action_validate()
        for leave in self.filtered(
            lambda l: (
                l.state == 'validate'
                and l.holiday_type == 'employee'
                # Skip WFH leave types — those employees are still working and
                # will create real attendance records themselves.
                and (l.holiday_status_id.name or '').strip().lower()
                    not in self._WFH_LEAVE_NAMES
            )
        ):
            leave._sync_leave_attendance()
        return result

    # -------------------------------------------------------------------------
    # Refuse / Draft: remove the auto-generated attendance stubs
    # -------------------------------------------------------------------------
    def action_refuse(self):
        result = super(HrLeave, self).action_refuse()
        for leave in self:
            leave._delete_leave_attendance()
        return result

    def action_draft(self):
        result = super(HrLeave, self).action_draft()
        for leave in self:
            leave._delete_leave_attendance()
        return result

    def unlink(self):
        for leave in self:
            leave._delete_leave_attendance()
        return super(HrLeave, self).unlink()

    # -------------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------------
    def _delete_leave_attendance(self):
        self.env['hr.attendance'].sudo().search([
            ('leave_id', '=', self.id),
            ('is_leave', '=', True),
        ]).unlink()

    def _sync_leave_attendance(self):
        """Create one hr.attendance stub per working day covered by this leave.

        check_out is set equal to check_in so that worked_hours computes to 0.
        The day is still skipped when it falls outside the employee's work
        schedule (weekend / non-working day).
        """
        self._delete_leave_attendance()

        employee = self.employee_id
        tz = pytz.timezone(employee.tz or 'UTC')
        calendar = employee.resource_calendar_id

        date_from = self.date_from.astimezone(tz).date()
        date_to   = self.date_to.astimezone(tz).date()

        current = date_from
        while current <= date_to:
            weekday = current.weekday()   # 0 = Monday … 6 = Sunday

            # Skip non-working days (no schedule lines = weekend / day off)
            day_lines = calendar.attendance_ids.filtered(
                lambda a: int(a.dayofweek) == weekday
            ) if calendar else []

            if not day_lines:
                current += timedelta(days=1)
                continue

            # Compute UTC bounds for this calendar day
            day_start_utc = tz.localize(
                datetime(current.year, current.month, current.day, 0, 0, 0)
            ).astimezone(pytz.utc).replace(tzinfo=None)
            day_end_utc = tz.localize(
                datetime(current.year, current.month, current.day, 23, 59, 59)
            ).astimezone(pytz.utc).replace(tzinfo=None)

            # Fallback for WFH leaves that slipped past the name check in
            # action_validate (e.g. slightly different leave type name).
            # WFH employees are actively working, so skip the day if they are
            # already checked in — creating a stub would raise a conflict.
            #
            # Do NOT apply this skip to real absences (sick, comp off, earned,
            # half-day leave, etc.): those stubs must always be created even
            # when the employee has attendance for the other half of the day.
            # The stub is a zero-duration record (check_in == check_out) so it
            # never overlaps with a real check-in at or after its timestamp.
            if (self.holiday_status_id.name or '').strip().lower() in self._WFH_LEAVE_NAMES:
                existing_real = self.env['hr.attendance'].sudo().search([
                    ('employee_id', '=', employee.id),
                    ('check_in', '>=', day_start_utc),
                    ('check_in', '<=', day_end_utc),
                    ('is_leave', '=', False),
                ], limit=1)
                if existing_real:
                    current += timedelta(days=1)
                    continue

            # Use start-of-day from work schedule; check_out == check_in → worked_hours = 0
            hour_from   = day_lines.filtered(lambda a: a.day_period == 'morning') or day_lines
            start_hour  = hour_from[0].hour_from
            h, m        = int(start_hour), int(round((start_hour % 1) * 60))
            stamp_local = datetime(current.year, current.month, current.day, h, m, 0)
            stamp_utc   = tz.localize(stamp_local).astimezone(pytz.utc).replace(tzinfo=None)

            self.env['hr.attendance'].sudo().create({
                'employee_id': employee.id,
                'check_in':    stamp_utc,
                'check_out':   stamp_utc,   # identical → worked_hours = 0
                'is_leave':    True,
                'leave_id':    self.id,
            })

            current += timedelta(days=1)
