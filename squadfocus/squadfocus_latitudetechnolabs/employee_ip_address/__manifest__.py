{
    'name': "Employee Ip Address",

    'summary': """Employee Ip Address in Attendance""",

    'description': """""",

    'author': "Squad Focus",
    'website': "http://www.squadfocus.com",

    'category': 'HR',
    'version': '14.0.0.1',

    'depends': ['hr', 'hr_attendance', 'hr_holidays', 'hr_zk_attendance'],
    'data': [
        # 'security/ir.model.access.csv',
        'views/hr_attendance.xml',
        'data/absent_cron.xml',
        # 'data/cron_demo.xml',
        # 'data/mail_template.xml',
        # 'data/cron_demo.xml',


    ],
}

