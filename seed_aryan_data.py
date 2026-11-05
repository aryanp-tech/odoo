# c:\odoo\seed_aryan_data.py
import odoo
from odoo import api, SUPERUSER_ID, fields
from datetime import datetime, date, timedelta

odoo.tools.config.parse_config(['-c', r'c:\odoo\debian\odoo.conf', '-d', 'aryanodoo'])
registry = odoo.registry('aryanodoo')

with api.Environment.manage():
    with registry.cursor() as cr:
        env = api.Environment(cr, SUPERUSER_ID, {})
        
        # 1. Get or setup department
        dept = env['hr.department'].search([('name', '=', 'Engineering & Cloud Systems')], limit=1)
        if not dept:
            dept = env['hr.department'].create({'name': 'Engineering & Cloud Systems'})
        
        # 2. Update Aryan Patel employee
        emp = env['hr.employee'].browse(3)
        if not emp.exists():
            user = env['res.users'].search([('login', '=', 'aryan.p@latitudetechnolabs.org')], limit=1)
            emp = env['hr.employee'].create({
                'name': 'Aryan Patel',
                'user_id': user.id if user else False,
                'work_email': 'aryan.p@latitudetechnolabs.org',
            })
            
        emp.write({
            'job_title': 'Senior Solutions & Product Engineer',
            'department_id': dept.id,
            'work_location': 'Munich Remote Office Hub',
        })
        print(f"Updated Employee: {emp.name} (ID: {emp.id})")
        
        # 3. Create or update today's attendance (Clock in at 9:15 AM today)
        today_915 = datetime.now().replace(hour=9, minute=15, second=0, microsecond=0)
        existing_att = env['hr.attendance'].search([
            ('employee_id', '=', emp.id),
            ('check_out', '=', False)
        ], limit=1)
        if not existing_att:
            att = env['hr.attendance'].create({
                'employee_id': emp.id,
                'check_in': today_915 - timedelta(hours=5, minutes=30), # Store in UTC
            })
            print(f"Created Attendance Check-in: ID {att.id}")
        else:
            print(f"Existing Attendance active: ID {existing_att.id}")
            
        # 4. Leave Types & Allocations
        # Find or create leave types
        casual_type = env['hr.leave.type'].search([('name', 'ilike', 'Casual')], limit=1)
        if not casual_type:
            casual_type = env['hr.leave.type'].search([], limit=1)
        
        sick_type = env['hr.leave.type'].search([('name', 'ilike', 'Sick')], limit=1)
        
        # Create Allocations if not existing
        alloc_count = env['hr.leave.allocation'].search_count([('employee_id', '=', emp.id)])
        if alloc_count == 0 and casual_type:
            env['hr.leave.allocation'].create({
                'name': 'Annual Casual Leave 2024',
                'employee_id': emp.id,
                'holiday_status_id': casual_type.id,
                'number_of_days': 20,
                'state': 'validate',
            })
            if sick_type:
                env['hr.leave.allocation'].create({
                    'name': 'Sick Leave 2024',
                    'employee_id': emp.id,
                    'holiday_status_id': sick_type.id,
                    'number_of_days': 10,
                    'state': 'validate',
                })
            print("Created Leave Allocations.")
        else:
            print(f"Leave allocations present: {alloc_count}")

        # 5. Asset & Equipment Details
        laptop_cat = env['equipment.category'].search([('name', '=', 'Laptop')], limit=1)
        if not laptop_cat:
            laptop_cat = env['equipment.category'].create({
                'name': 'Laptop',
                'category': 'laptop',
                'tag_code': 'IMPX-NB-',
            })
            
        screen_cat = env['equipment.category'].search([('name', '=', 'Screen')], limit=1)
        if not screen_cat:
            screen_cat = env['equipment.category'].create({
                'name': 'Screen',
                'category': 'screen',
                'tag_code': 'IMPX-MN-',
            })

        # Equipment 1: MacBook Pro
        macbook = env['equipment.details'].search([('details', 'ilike', 'MacBook Pro')], limit=1)
        if not macbook:
            macbook = env['equipment.details'].create({
                'details': 'MacBook Pro 16" M3 Max',
                'category': laptop_cat.id,
                'tag_no': '012',
                'comp_name': 'Apple',
                'ram': '64GB Unified RAM',
                'processor': 'Apple M3 Max',
                'use_by': emp.id,
                'state': 'not_available',
            })
            
        # Equipment 2: Dell Monitor
        monitor = env['equipment.details'].search([('details', 'ilike', 'Dell 27')], limit=1)
        if not monitor:
            monitor = env['equipment.details'].create({
                'details': 'Dell 27" 4K USB-C Hub Monitor',
                'category': screen_cat.id,
                'tag_no': '114',
                'comp_name': 'Dell',
                'use_by': emp.id,
                'state': 'not_available',
            })

        # Asset details record
        asset_record = env['asset.details'].search([('name', '=', emp.id)], limit=1)
        if not asset_record:
            asset_record = env['asset.details'].create({
                'name': emp.id,
                'department': dept.id,
                'work_location': 'wfo',
                'desk': 'Desk D-11',
                'laptop': True,
                'laptop_equip': macbook.id if macbook else False,
                'screen': True,
                'screen_equip': monitor.id if monitor else False,
                'state': 'assigned',
                'assign_date': fields.Datetime.now(),
            })
            print(f"Created Asset Details Record: {asset_record.id}")
        else:
            print(f"Asset Details already present: {asset_record.id}")

        # 6. WFH Request
        wfh = env['work.from.home'].search([('employee_id', '=', emp.id)], limit=1)
        if not wfh:
            env['work.from.home'].create({
                'name': 'Remote Architecture & Sprint Delivery',
                'employee_id': emp.id,
                'holiday_type': 'employee',
                'state': 'confirm',
            })
            print("Created WFH Request.")
        else:
            print(f"WFH Record exists: {wfh.id}")

        cr.commit()
        print("DATABASE SEED COMMITTED SUCCESSFULLY!")

