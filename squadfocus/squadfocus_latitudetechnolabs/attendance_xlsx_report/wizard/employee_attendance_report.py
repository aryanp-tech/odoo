
import io
import base64
from odoo import fields, models, _
from openpyxl import Workbook
import pytz

class HrAttendanceReport(models.TransientModel):
    """ Wizard for Employee Attendance Report """
    _name = 'employee.attendance.report'
    _description = 'Employee Attendance Report Wizard'

    from_date = fields.Date('From Date', help="Starting date for Report")
    to_date = fields.Date('To Date', help='Ending date for Report')

    def action_print_xlsx(self):
        attendances = self.env['hr.attendance'].search([
            ('check_in', '>=', self.from_date),
            ('check_in', '<=', self.to_date)
        ])
        workbook = Workbook()
        worksheet = workbook.active
        headers = ['Employee Name', 'Check-in Time', 'Shift Start Time', 'Minutes Late']
        ist = pytz.timezone('Asia/Kolkata')
        for col, header in enumerate(headers, start=1):
            worksheet.cell(row=1, column=col, value=header)
        for attendance in attendances:
            if attendance.employee_id.active:
                check_in_ist = attendance.check_in.astimezone(ist)
                check_in_naive = check_in_ist.replace(tzinfo=None) 
                check_in_float = float(check_in_naive.strftime('%H.%M'))
                shift_start_time = attendance.employee_id.resource_calendar_id.start_hour
                if check_in_float > shift_start_time+0.15:
                    late_time = check_in_float-shift_start_time
                    row = [attendance.employee_id.name,check_in_naive ,shift_start_time,round(late_time,2) ]
                    worksheet.append(row)
        excel_buffer = io.BytesIO()
        workbook.save(excel_buffer)
        excel_buffer.seek(0)
        file_data = base64.encodebytes(excel_buffer.read())
        file_name = 'Employee_Attendance_Report.xlsx'
        attachment = self.env['ir.attachment'].create({
            'name': file_name,
            'type': 'binary',
            'datas': file_data,
            'res_model': self._name,
            'res_id': self.id,
        })
        return {
            'type': 'ir.actions.act_url',
            'url': '/web/content/%s?download=true' % (attachment.id),
            'target': 'self',
        }
