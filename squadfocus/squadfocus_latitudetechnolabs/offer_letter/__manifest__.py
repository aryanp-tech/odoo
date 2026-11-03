# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Offer Letter',
    'version': '1.0',
    'author': "Squad Focus",
    'website': "http://www.squadfocus.com",

    'depends': ['base', 'hr', 'hr_recruitment'],

    'data': [
        'security/ir.model.access.csv',
        'views/letter.xml',
        'report/report.xml',
        'data/letter_mail.xml',
    ],
   
    'installable': True,
    'license': 'LGPL-3',
}
