{
    'name': 'Work From Home',
    'version': '1.0',
    'category': 'Human Resources',
    'depends': [
      'hr_holidays','employee_notification'],
    'data': [
       'security/ir.model.access.csv',
       'views/work_from_home.xml',
       'data/work_from_home.xml',
       'data/cron_demo.xml',
       'views/public_holidays.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'sequence': 220,
    'license': 'LGPL-3',
}