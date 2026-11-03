
{
    'name': "Probation Confirmation Reports",
    'version': '14.0.1.0.0',
    'category': '',
    'summary': """This module will manage  employee's Probation period""",
    'description': """This module helps to employee probation period confirmation""",
    'author': 'Ranjan Sahu',
    'company': 'Latitude Technolabs Pvt Ltd',
    'maintainer': 'Ranjan Sahu',
    'website': 'www.latitudetechnolabs.com',
    'depends': ['oh_appraisal','offer_letter'],
    'data': [
        'security/ir.model.access.csv',
        'views/probation_employee.xml',
        'views/probation_survey.xml',
        'data/data.xml',
        'security/groups.xml',
        'reports/report.xml',
    ],
    'images': [],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False
}
