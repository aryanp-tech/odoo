# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Ticket Assign By Employee',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",

    'depends': ['hr','it_department','hr_attendance'],

    'data': [
        'security/ir.model.access.csv',
        'views/employee_ticket.xml',
        'security/groups.xml',
        # 'data/cron.xml',
    ],
   
    'installable': True,
    'auto_install': False,
    'application': True,
    'license': 'LGPL-3',
}
