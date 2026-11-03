{
    'name': 'Maintenance - HR',
    'version': '1.0',
    'sequence': 125,
    'category': 'Human Resources',
    'description': """
        Bridge between HR and Maintenance.""",
    'depends': ['hr', 'maintenance'],
    'summary': 'Equipments, Assets, Internal Hardware, Allocation Tracking',
    'data': [
        'views/maintenance.xml',
    ],
    'demo': [],
    'installable': True,
    'auto_install': True,
    'license': 'LGPL-3',
}
