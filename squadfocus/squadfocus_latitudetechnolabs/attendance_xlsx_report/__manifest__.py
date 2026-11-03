
{
    'name': "Attendance Xlsx Report",
    'version': '14.0.1.0.0',
    'category': 'Human Resources/Attendances',
    'summary': """This module will manage  the attendance report of employees in xlsx""",
    'description': """This module helps to generate the attendance report of employees in the
    XLSX format""",
    'author': 'Cybrosys Techno Solutions',
    'company': 'Cybrosys Techno Solutions',
    'maintainer': 'Cybrosys Techno Solutions',
    'website': 'https://www.cybrosys.com',
    'depends': ['hr_attendance'],
    'data': [
        'security/ir.model.access.csv',
        'wizard/employee_attendance_report_views.xml',
        'views/resource_calendar.xml',
    ],
    'images': ['static/description/banner.png'],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False
}
