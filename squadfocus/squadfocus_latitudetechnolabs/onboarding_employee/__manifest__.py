# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Onbording employee',
    'version': '1.0',
    'author': "Squad Focus",
    'website': "http://www.squadfocus.com",

    'depends': ['website','base','hr', 'hr_resignation'],

    'data': [
        'views/onbording_form.xml',
        'views/resignation_form.xml',
        'views/employee.xml',
        'views/js_view.xml',
    ],
   
    'installable': True,
    'license': 'LGPL-3',
}
