# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import logging

_logger = logging.getLogger(__name__)

ATTENDANCE_FIELDS = [
    'employee_id', 'check_in', 'check_out',
    'worked_hours', 'geo_ip', 'checkout_ip',
]


class HrAttendanceController(http.Controller):
    """
    JSON-RPC endpoint for querying attendance records with date range support.

    All parameters are optional.  When none are supplied the response is scoped
    to the current calendar month, keeping large historical datasets out of the
    default response payload.

    POST /api/hr/attendance
    Body (JSON):
        employee_id  (int, optional)  – filter to a single employee
        date_from    (str, optional)  – lower bound  "YYYY-MM-DD"
        date_to      (str, optional)  – upper bound  "YYYY-MM-DD"  (inclusive)
        month        (int, optional)  – 1-12; combined with year
        year         (int, optional)  – 4-digit year; combined with month
    """

    @http.route('/api/hr/attendance', type='json', auth='user', methods=['POST'], csrf=False)
    def get_attendance(self, employee_id=None, date_from=None, date_to=None,
                       month=None, year=None, **kwargs):
        today = date.today()

        # --- resolve date window (ORM-level filter, never post-filter) ---------
        if date_from and date_to:
            try:
                dt_from = datetime.strptime(date_from, '%Y-%m-%d')
                dt_to = datetime.strptime(date_to, '%Y-%m-%d').replace(
                    hour=23, minute=59, second=59
                )
            except ValueError as exc:
                return {'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD.'}

        elif month and year:
            try:
                dt_from = datetime(int(year), int(month), 1, 0, 0, 0)
                dt_to = dt_from + relativedelta(months=1, seconds=-1)
            except (ValueError, TypeError):
                return {'status': 'error', 'message': 'Invalid month/year values.'}

        else:
            # Default: first to last second of the current month
            dt_from = datetime.combine(today.replace(day=1), datetime.min.time())
            dt_to = dt_from + relativedelta(months=1, seconds=-1)

        # --- build ORM domain --------------------------------------------------
        domain = [
            ('check_in', '>=', dt_from.strftime('%Y-%m-%d %H:%M:%S')),
            ('check_in', '<=', dt_to.strftime('%Y-%m-%d %H:%M:%S')),
        ]

        if employee_id:
            domain.append(('employee_id', '=', int(employee_id)))

        # --- query (uses database index on check_in) ---------------------------
        try:
            records = request.env['hr.attendance'].search_read(
                domain, ATTENDANCE_FIELDS, order='check_in desc'
            )
        except Exception as exc:
            _logger.exception("Error fetching attendance records")
            return {'status': 'error', 'message': str(exc)}

        return {
            'status': 'success',
            'date_from': dt_from.strftime('%Y-%m-%d %H:%M:%S'),
            'date_to': dt_to.strftime('%Y-%m-%d %H:%M:%S'),
            'count': len(records),
            'attendances': records,
        }
