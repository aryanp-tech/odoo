# -*- coding: utf-8 -*-
from odoo import api, fields, models
from dateutil.relativedelta import relativedelta


class HrLeaveReport(models.Model):
    _inherit = 'hr.leave.report'

    @api.model
    def search_read(self, domain=None, field_names=None, offset=0, limit=None, order=None):
        domain = domain or []

        # Only inject when the caller hasn't already supplied a date constraint.
        # Allocations carry a NULL date_from so we include them via the OR branch
        # so the analysis still shows the full allocation picture alongside
        # the current-month time-off requests.
        has_date_filter = any(
            isinstance(leaf, (list, tuple)) and leaf[0] in ('date_from', 'date_to')
            for leaf in domain
        )
        if not has_date_filter:
            today = fields.Date.today()
            first_day = today.replace(day=1)
            next_month = first_day + relativedelta(months=1)
            domain = [
                '|',
                ('date_from', '=', False),   # allocations — always include
                '&',
                ('date_from', '>=', first_day.strftime('%Y-%m-%d 00:00:00')),
                ('date_from', '<',  next_month.strftime('%Y-%m-%d 00:00:00')),
            ] + domain

        return super(HrLeaveReport, self).search_read(domain, field_names, offset, limit, order)
