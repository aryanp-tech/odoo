# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'IT Department',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",

    'depends': ['hr'],

    'data': [
        'security/groups.xml',
        'security/ir.model.access.csv',
        'wizard/asset_return.xml',
        'views/asset_details.xml',
        'views/equipment.xml',
        'views/activity.xml',
        'views/stock_in.xml',
        'views/equipment_category.xml',

    ],
   
    'installable': True,
    'auto_install': False,
    'application': True,
    'license': 'LGPL-3',
}
