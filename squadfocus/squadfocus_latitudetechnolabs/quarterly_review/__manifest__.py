# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Quarterly Reviw system',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",

    'depends': ['hr'],

    'data': [
        'security/rules.xml',
        'security/ir.model.access.csv',
        'views/quarterly.xml',
        'views/salary_details.xml',
        'data/cron.xml',
    ],
   
    'installable': True,
    'auto_install': False,
    'application': True,
    'license': 'LGPL-3',
}
