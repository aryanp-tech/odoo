{
    'name': 'Hr Policy',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",

    'depends': ['hr','hr_holidays'],

    'data': [
        'security/ir.model.access.csv',
        'views/hr_policy.xml',
    ],
   
    'installable': True,
    'auto_install': False,
    'application': True,
    'license': 'LGPL-3',
}
