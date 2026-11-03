
{
    'name': 'Employee Resources',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",
    'depends': ['hr','oh_appraisal'],
    'data': [
        'security/ir.model.access.csv',
        'views/employee_resource.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'license': 'LGPL-3',
}
