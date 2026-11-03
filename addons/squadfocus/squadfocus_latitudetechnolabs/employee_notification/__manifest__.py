{
    'name': "Employee Notification",
    'author': "Squad Focus",
    'website': "http://www.squadfocus.com",
    'category': 'HR',
    'version': '14.0.0.1',

    'depends': ['hr_recruitment','hr_holidays','hr_zk_attendance'],
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/attendance.xml',
        'data/cron_demo.xml',
        'security/groups.xml', 
        'views/onboard_process.xml',         
    ],

    'installable': True,
    'license': 'LGPL-3',
}

