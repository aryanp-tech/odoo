# -*- encoding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'Accural Allocation',
    'version': '1.0',
    'category': 'Human Resources',
    'depends': [
       'hr','hr_holidays','hr_employee_updation'],
    'data': [
        'data/regular_leave.xml',
        'views/allocation_type.xml',
        
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'sequence': 220,
    'license': 'LGPL-3',
}
