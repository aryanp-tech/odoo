# -*- encoding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'Timesheet - HR',
    'version': '1.0',
    'category': 'Human Resources',
    'depends': [
       'hr_timesheet','hr_holidays'],
    'data': [
       'data/timesheet_cron.xml',
       'views/timesheet.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'sequence': 220,
    'license': 'LGPL-3',
}
