{
    'name': 'Monthly Feedback',
    'version': '1.0',
    'author': "Rashmi Ranjan",
    'website': "http://www.latitudetechnolabs.com",

    'depends': ['hr','employee_feedback'],

    'data': [
        'security/ir.model.access.csv',
        # 'security/groups.xml',
        'views/monthly_feedback.xml',
        'views/answer_feedback.xml',
    ],
   
    'installable': True,
    'auto_install': False,
    'application': False,
    'license': 'LGPL-3',
}
