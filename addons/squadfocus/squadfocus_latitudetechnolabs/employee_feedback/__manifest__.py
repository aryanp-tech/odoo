{
    'name': 'Employee Feedback',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",

    'depends': ['hr','survey'],

    'data': [
        'security/ir.model.access.csv',
        # 'security/groups.xml',
        'views/employee_feedback.xml',
        # 'views/employee.xml',
        'views/survey.xml',
        'data/data.xml',
    ],
   
    'installable': True,
    'auto_install': False,
    'application': True,
    'license': 'LGPL-3',
}
