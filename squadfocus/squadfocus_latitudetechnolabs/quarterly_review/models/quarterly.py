from odoo import fields, models,api, _
from odoo.exceptions import ValidationError,UserError
from datetime import date,timedelta
import re
import io
import base64
import logging
from openpyxl.utils import get_column_letter
from openpyxl.styles import Alignment
from openpyxl import Workbook
_logger = logging.getLogger(__name__)

class QuarterlyReview(models.Model):
    """ Quarterly Review System """
    _name = "quarterly.review"
    _inherit = 'mail.thread'

    name = fields.Many2one('hr.employee',string="Employee Name",required=True)
    designation = fields.Char('Designation')
    employee_no = fields.Char('Employee No')
    department = fields.Many2one('hr.department',string="Department")
    location = fields.Char('Location')
    quarter_name = fields.Selection([("1","1st Quarter"),("2","2nd Quarter"),("3","3rd Quarter"),("4","4th Quarter")])
    quarter_start_date = fields.Date("Quarter Start Date")
    quarter_end_date = fields.Date("Quarter End Date")
    state = fields.Selection([('draft','Draft'),('sent',"Sent to Employee"),('submit','Submitted By Employee'),('submit_manager','Submitted By Manager'),('done','Done')],default = 'draft')
    create_quarter_date = fields.Date("Created Date",readonly=True)
    mail_send_date = fields.Date("Mail Send Date",readonly=True)
    submit_date = fields.Date("Employee Submit Date",readonly=True)
    complete_date = fields.Date("Completed Date",readonly=True)
    manager_id = fields.Many2many('hr.employee',string="Response to Client/Manager/Responsible Manager ",required=True)
    activity_id = fields.One2many('activity.review',"quarter_id",string="Activity")
    project_id = fields.One2many('project.review',"quarter_id",string="Activity")
    disappoint_id = fields.One2many('disapoint.review',"quarter_id",string="Disappointment / Missed opportunity ")
    activity_comment = fields.Text("Manager's Comment")
    reliability = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")],string="Reliability and Consistency of Performance")
    reliability_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")],string="Reliability and Consistency of Performance")
    performance = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    performance_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    job_knowledge = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    job_knowledge_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    adaptability = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    adaptability_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    quality_work = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    quality_work_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    quantity_work = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    quantity_work_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    responsive = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    responsive_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    communication = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    communication_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    confidentiality = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    confidentiality_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    attendance = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    attendance_manager = fields.Selection([("5","5"),("4","4"),("3","3"),("2","2"),("1","1")])
    is_submit = fields.Boolean("Is Submit",default=False)
    is_manager = fields.Boolean("Is Submit",default=True)
    sub_id = fields.Many2one('quarterly.review', string="Parent Review")
    overal_comments = fields.Text("Employee's Overall Comment")
    manager_overal_comments = fields.Text("Manager's Overal Comment")
    sub_quarter_ids = fields.One2many('quarterly.review', 'sub_id', string="Sub Quarterly Reviews")
    final_rating = fields.Char('Final Grading',compute="get_total_rating")
    total_manager_rating=  fields.Integer('Total Manager Rating' ,compute="get_manager_rating")
    salary_id = fields.Many2one('salary.details',string="Salary Id")


    def action_salary_details(self):
        return {
            'name': _('Salary Details'),
            'type': 'ir.actions.act_window',
            'res_model': 'salary.details', 
            'view_mode': 'tree,form',
            'domain': [('id', '=', self.salary_id.id)],
            # 'context': {'search_default_category_id': 1}, 
        }
    def action_export_quarterly_review_excel(self):
    # Initialize workbook and worksheet
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "Quarterly Review"

        # Define headers
        # headers = [
        # 'Employee Name', 'Manager\'s Name', 'Section 2'
        # ]
        # subheaders = [
        #     '', 'Self', 'Manager 1', 'Manager 2', 'Manager 3', 
        #     'Average Manager Rating', 'Management Rating', '', 'Final Obtained'
        # ]

        headers = [
        ("Employee Name", 1, 1), 
            ("Manager's Name", 2, 2), 
            ("Section 2", 3, 9), 
            ("Section 3", 10, 16),
            ("Section 4", 17, 23),
            ("Final Score", 24, 24),
            ("Final Grade", 25, 25),
            ("Score Range", 26, 26),
        ]
        admin_headers = [
            ("Current Salary", 27, 27),("Increment Percentage", 28, 28),("Total Increment", 29, 29),("PLI Percentage", 30, 30),("Total PLI", 31, 31),("PLI to be Given", 32, 34),("Final Salary + PLI", 35, 35)]
        subheaders_section_5 = [
            "1st PLI", "2nd PLI", "3rd PLI"
        ]
        is_admin = self.env.user.has_group('quarterly_review.group_quarterly_review_super_admin')
        if is_admin and self.salary_id:
            headers.extend(admin_headers)
            for idx, subheader in enumerate(subheaders_section_5, start=32):
                worksheet.cell(row=2, column=idx, value=subheader)
        headses =["Final Score", "Final Grade", "Score Range"]
        for header, col_start, col_end in headers:
            if col_start <= col_end:
                worksheet.merge_cells(start_row=1, start_column=col_start, end_row=1, end_column=col_end)
                cell = worksheet.cell(row=1, column=col_start, value=header)
                cell.alignment = Alignment(horizontal="center", vertical="center")
        subheaders_section_2 = [
            "Self", "Manager 1", "Manager 2", "Manager 3", 
            "Average Manager Rating", "Management Rating", "Final Obtained"
        ]
        subheaders_section_3 = [
            "Self", "Manager 1", "Manager 2", "Manager 3", 
            "Average Manager Rating", "Management Rating", "Final Obtained", 
        ]
        subheaders_section_4 = [
            "Self", "Manager 1", "Manager 2", "Manager 3", 
            "Average Manager Rating", "Management Rating", "Final Obtained", 
        ]
        for idx, subheader in enumerate(subheaders_section_2, start=3):
            worksheet.cell(row=2, column=idx, value=subheader)
        for idx, subheader in enumerate(subheaders_section_3, start=10):
            worksheet.cell(row=2, column=idx, value=subheader)
        for idx, subheader in enumerate(subheaders_section_4, start=17):
            worksheet.cell(row=2, column=idx, value=subheader)
        for row_num, record in enumerate(self, start=3):
            worksheet.cell(row=row_num, column=1, value=record.name.name)
            worksheet.cell(row=row_num, column=2, value=str(record.manager_id.mapped('name')) or '')
            worksheet.cell(row=row_num, column=3, value=sum(record.project_id.mapped('self_rating')))
            worksheet.cell(row=row_num, column=10, value=sum(record.disappoint_id.mapped('self_rating')))
            worksheet.cell(row=row_num, column=17, value=int(record.reliability)+int(record.performance)+int(record.job_knowledge) +int(record.adaptability)+int(record.quantity_work)+int(record.quality_work)+int(record.responsive)+int(record.confidentiality) +int(record.communication) + int(record.attendance))
            worksheet.cell(row=row_num, column=25, value=record.final_rating or '')
            manager_ratings = record.sub_quarter_ids.mapped('project_id').mapped('manager_rating')
            if manager_ratings:
                sec_2 = ((sum(record.sub_quarter_ids.mapped('disappoint_id').mapped('manager_rating'))//len(record.sub_quarter_ids.ids)))*50//10
                project_mark = (sum(manager_ratings) / len(manager_ratings))*70//10
                worksheet.cell(row=row_num, column=9, value=project_mark or '')
                worksheet.cell(row=row_num, column=16, value=sec_2 or '')
            if record.sub_quarter_ids:
                print(record.sub_quarter_ids)
                worksheet.cell(row=row_num, column=7, value=sum(record.sub_quarter_ids.mapped('project_id').mapped('manager_rating'))//len(record.sub_quarter_ids.ids))
                worksheet.cell(row=row_num, column=14, value=sum(record.sub_quarter_ids.mapped('disappoint_id').mapped('manager_rating'))//len(record.sub_quarter_ids.ids))
                if len(record.sub_quarter_ids.ids) == 3:
                    worksheet.cell(row=row_num, column=4, value=sum(record.sub_quarter_ids[0].project_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=11, value=sum(record.sub_quarter_ids[0].disappoint_id.mapped('manager_rating')))

                    quarter_1 = int(record.sub_quarter_ids[0].reliability_manager)+int(record.sub_quarter_ids[0].performance_manager)+int(record.sub_quarter_ids[0].job_knowledge_manager) +int(record.sub_quarter_ids[0].adaptability_manager)+int(record.sub_quarter_ids[0].quantity_work_manager)+int(record.sub_quarter_ids[0].quality_work_manager)+int(record.sub_quarter_ids[0].responsive_manager)+int(record.sub_quarter_ids[0].communication_manager) +int(record.sub_quarter_ids[0].confidentiality_manager) + int(record.sub_quarter_ids[0].attendance_manager)
                    quarter_2 = int(record.sub_quarter_ids[1].reliability_manager)+int(record.sub_quarter_ids[1].performance_manager)+int(record.sub_quarter_ids[1].job_knowledge_manager) +int(record.sub_quarter_ids[1].adaptability_manager)+int(record.sub_quarter_ids[1].quantity_work_manager)+int(record.sub_quarter_ids[1].quality_work_manager)+int(record.sub_quarter_ids[1].responsive_manager)+int(record.sub_quarter_ids[1].communication_manager) +int(record.sub_quarter_ids[1].confidentiality_manager) + int(record.sub_quarter_ids[1].attendance_manager)
                    worksheet.cell(row=row_num, column=18, value=quarter_1)
                    quarter_3 = int(record.sub_quarter_ids[2].reliability_manager)+int(record.sub_quarter_ids[2].performance_manager)+int(record.sub_quarter_ids[2].job_knowledge_manager) +int(record.sub_quarter_ids[0].adaptability_manager)+int(record.sub_quarter_ids[2].quantity_work_manager)+int(record.sub_quarter_ids[2].quality_work_manager)+int(record.sub_quarter_ids[2].responsive_manager)+int(record.sub_quarter_ids[2].communication_manager) +int(record.sub_quarter_ids[2].confidentiality_manager) + int(record.sub_quarter_ids[2].attendance_manager)

                    worksheet.cell(row=row_num, column=5, value=sum(record.sub_quarter_ids[1].project_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=12, value=sum(record.sub_quarter_ids[1].disappoint_id.mapped('manager_rating')))
                    
                    worksheet.cell(row=row_num, column=19, value=quarter_2)


                    worksheet.cell(row=row_num, column=6, value=sum(record.sub_quarter_ids[2].project_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=13, value=sum(record.sub_quarter_ids[2].disappoint_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=20, value=quarter_3)
                    

                    worksheet.cell(row=row_num, column=23, value=(((quarter_3+quarter_2+quarter_1)//3)*100//50)*30//100)
                    worksheet.cell(row=row_num, column=21, value=(quarter_3+quarter_2+quarter_1)//3)

                elif len(record.sub_quarter_ids.ids) == 2:
                    worksheet.cell(row=row_num, column=4, value=sum(record.sub_quarter_ids[0].project_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=11, value=sum(record.sub_quarter_ids[0].disappoint_id.mapped('manager_rating')))
                    quarter_1 = int(record.sub_quarter_ids[0].reliability_manager)+int(record.sub_quarter_ids[0].performance_manager)+int(record.sub_quarter_ids[0].job_knowledge_manager) +int(record.sub_quarter_ids[0].adaptability_manager)+int(record.sub_quarter_ids[0].quantity_work_manager)+int(record.sub_quarter_ids[0].quality_work_manager)+int(record.sub_quarter_ids[0].responsive_manager)+int(record.sub_quarter_ids[0].communication_manager) +int(record.sub_quarter_ids[0].confidentiality_manager) + int(record.sub_quarter_ids[0].attendance_manager)
                    worksheet.cell(row=row_num, column=18, value=quarter_1)
                    quarter_2 = int(record.sub_quarter_ids[1].reliability_manager)+int(record.sub_quarter_ids[1].performance_manager)+int(record.sub_quarter_ids[1].job_knowledge_manager) +int(record.sub_quarter_ids[1].adaptability_manager)+int(record.sub_quarter_ids[1].quantity_work_manager)+int(record.sub_quarter_ids[1].quality_work_manager)+int(record.sub_quarter_ids[1].responsive_manager)+int(record.sub_quarter_ids[1].communication_manager) +int(record.sub_quarter_ids[1].confidentiality_manager) + int(record.sub_quarter_ids[1].attendance_manager)

                    worksheet.cell(row=row_num, column=5, value=sum(record.sub_quarter_ids[1].project_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=12, value=sum(record.sub_quarter_ids[1].disappoint_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=19, value=quarter_2)
                    worksheet.cell(row=row_num, column=23, value=(((quarter_2+quarter_1)//2)*100//50)*30//100)
                    worksheet.cell(row=row_num, column=21, value=(quarter_2+quarter_1)//2)

                elif len(record.sub_quarter_ids.ids) == 1:
                    worksheet.cell(row=row_num, column=4, value=sum(record.sub_quarter_ids[0].project_id.mapped('manager_rating')))
                    worksheet.cell(row=row_num, column=11, value=sum(record.sub_quarter_ids[0].disappoint_id.mapped('manager_rating')))
                    quarter_1 =int(record.sub_quarter_ids[0].reliability_manager)+int(record.sub_quarter_ids[0].performance_manager)+int(record.sub_quarter_ids[0].job_knowledge_manager) +int(record.sub_quarter_ids[0].adaptability_manager)+int(record.sub_quarter_ids[0].quantity_work_manager)+int(record.sub_quarter_ids[0].quality_work_manager)+int(record.sub_quarter_ids[0].responsive_manager)+int(record.sub_quarter_ids[0].communication_manager) +int(record.sub_quarter_ids[0].confidentiality_manager) + int(record.sub_quarter_ids[0].attendance_manager)
                    worksheet.cell(row=row_num, column=18, value=quarter_1)
                    worksheet.cell(row=row_num, column=23, value=((quarter_1)*100//50)*30//100)
                    worksheet.cell(row=row_num, column=21, value=(quarter_1))
    
            if record.sub_quarter_ids:
                total_mark = sum(record.sub_quarter_ids.mapped('total_manager_rating'))//len(record.sub_quarter_ids.mapped('total_manager_rating'))
                worksheet.cell(row=row_num, column=24, value=total_mark)
                if total_mark >=86:
                    worksheet.cell(row=row_num, column=26, value='86+')
                elif total_mark >=71 and total_mark<=85:
                    worksheet.cell(row=row_num, column=26, value='71 to 85')
                elif total_mark >=56 and total_mark<=70: 
                    worksheet.cell(row=row_num, column=26, value='56 to 70')
                elif total_mark >=41 and total_mark<=55:
                    worksheet.cell(row=row_num, column=26, value='41 to 55')
                elif total_mark >=0 and total_mark<=40:
                    worksheet.cell(row=row_num, column=26, value='0 to 40')
            if self.salary_id:
                is_admin = self.env.user.has_group('quarterly_review.group_quarterly_review_super_admin')
                if is_admin:
                    worksheet.cell(row=row_num, column=27, value=record.salary_id.cur_salary)
                    worksheet.cell(row=row_num, column=28, value=record.salary_id.increment_percentage)
                    worksheet.cell(row=row_num, column=29, value=record.salary_id.total_increment)
                    worksheet.cell(row=row_num, column=30, value=record.salary_id.pli_percentage)
                    worksheet.cell(row=row_num, column=31, value=record.salary_id.total_pli)
                    worksheet.cell(row=row_num, column=32, value=record.salary_id.pli_1st)
                    worksheet.cell(row=row_num, column=33, value=record.salary_id.pli_2nd)
                    worksheet.cell(row=row_num, column=34, value=record.salary_id.pli_3rd)
                    worksheet.cell(row=row_num, column=35, value=record.salary_id.final_amount)
        excel_buffer = io.BytesIO()
        workbook.save(excel_buffer)
        excel_buffer.seek(0)
        file_data = base64.b64encode(excel_buffer.read())
        file_name = 'quarterly_review_report.xlsx'

        # Create an attachment
        attachment = self.env['ir.attachment'].create({
            'name': file_name,
            'type': 'binary',
            'datas': file_data,
            'store_fname': file_name,
            'mimetype': 'application/vnd.ms-excel',
        })

        # Return the download action
        return {
            'type': 'ir.actions.act_url',
            'url': '/web/content/%s?download=true' % (attachment.id),
            'target': 'self',  # or 'new'
        }
    def get_total_rating(self):
        for rec in self:
            if rec.sub_quarter_ids:
                total_mark = sum(rec.sub_quarter_ids.mapped('total_manager_rating'))//len(rec.sub_quarter_ids.mapped('total_manager_rating'))
                # rec.final_rating =total_mark
                if total_mark >=86:
                    rec.final_rating ="A+"
                if total_mark >=71 and total_mark<=85:
                    rec.final_rating ="A"
                if total_mark >=56 and total_mark <= 70:
                    rec.final_rating ="B+"
                if total_mark >=41 and total_mark <=55:
                    rec.final_rating ="B"
                if total_mark <=40:
                    rec.final_rating = "C"
            else:
                rec.final_rating = 'C'
                
    def get_manager_rating(self):
        for rec in self:
            try:
                project_mark = 0
                if rec.project_id:
                    manager_ratings = rec.project_id.mapped('manager_rating')
                    if manager_ratings:
                        project_mark = (sum(manager_ratings) / len(manager_ratings))*70//10
                sec_3 = (int(rec.reliability_manager)+int(rec.performance_manager)+int(rec.job_knowledge_manager)+int(rec.adaptability_manager)+int(rec.quality_work_manager)+int(rec.quantity_work_manager)+int(rec.responsive_manager)+int(rec.communication_manager)+int(rec.confidentiality_manager)+int(rec.attendance_manager))
                sec3_total = (sec_3*100//50)*30//100
                sec_2 = (sum(rec.disappoint_id.mapped('manager_rating')))*50//10
                rec.total_manager_rating = project_mark +sec3_total+sec_2
            except Exception as e:
                raise ValidationError(f"An error occurred while computing the manager rating: {e}")
    @api.onchange('name')
    def _onchange_name(self):
        if self.name:
            three_months_ago = fields.Date.today() - timedelta(days=90)
            existing_records = self.search([
                ('name', '=', self.name.id),
                ('create_quarter_date', '>=', three_months_ago),
            ])
            if existing_records:
                raise ValidationError(_('An employee cannot have multiple reviews within a 3-month period.'))

    def copy(self, default=None):
        self.ensure_one()
        default = dict(default or {})
        activity_defaults = []
        for activity in self.activity_id:
            activity_defaults.append((0, 0, {
                'name': activity.name,
                'quarter_id': False,
            }))
        default['activity_id'] = activity_defaults
        project_defaults = []
        for project in self.project_id:
            project_defaults.append((0, 0, {
                'project_id': project.project_id.id,
                'accomplishment': project.accomplishment,
                'support': project.support,
                'action': project.action,
                'quarter_id': False,
                'self_rating': project.self_rating,
                'manager_rating': project.manager_rating,
                'state': project.state,
                'manager_comment': project.manager_comment,
            }))
        default['project_id'] = project_defaults
        disappoint_defaults = []
        for disappoint in self.disappoint_id:
            disappoint_defaults.append((0, 0, {
                'disappointment': disappoint.disappointment,
                'quarter_id': False,
                 'action':disappoint.action,
                 'self_rating':disappoint.self_rating,
                 'state': disappoint.state,
            }))
        default['disappoint_id'] = disappoint_defaults
        return super(QuarterlyReview, self).copy(default)

    @api.onchange("reliability","performance","job_knowledge","adaptability","quantity_work","quality_work","responsive","confidentiality","communication","attendance",'overal_comments')
    def check_permission_manager(self):
        user_employee_id = self.env.user.employee_id.id
        manager_ids = self.manager_id.ids
        if user_employee_id in manager_ids:
            raise UserError(_('You have no access to Edit record.'))
        if user_employee_id != self.name.id and self.name:
            raise UserError(_('You have no access to Edit record.'))
    
    def write(self, values):
        is_admin = self.env.user.has_group('hr.group_hr_manager')
    
        for record in self:
            # if record.state == "submit":
                # if not is_admin and self.env.user.employee_id not in record.manager_id:
                #     if values.get("is_submit") != True:
                #         raise UserError(_('You cannot edit once the form is submitted'))

            if 'project_id' in values:
                project_commands = values.get('project_id', [])
                for command in project_commands:
                    if command[0] == 2:  # Removing a record
                        project_record = self.env['project.review'].browse(command[1])
                        if project_record.exists() and self.env.user.employee_id != record.name:
                            raise UserError(_('Managers cannot remove project reviews.'))

            if 'activity_id' in values:
                activity_commands = values.get('activity_id', [])
                for command in activity_commands:
                    if command[0] == 2:  # Removing a record
                        activity = self.env['activity.review'].browse(command[1])
                        if activity.exists() and self.env.user.employee_id != record.name:
                            raise UserError(_('Managers cannot remove activity reviews.'))

            if 'disappoint_id' in values:
                disappoint_commands = values.get('disappoint_id', [])
                for command in disappoint_commands:
                    if command[0] == 2:  # Removing a record
                        disappoint = self.env['disapoint.review'].browse(command[1])
                        if disappoint.exists() and self.env.user.employee_id != record.name:
                            raise UserError(_('Managers cannot remove disappoint reviews.'))

        result = super(QuarterlyReview, self).write(values)
        return result
    
    def unlink(self):
        is_admin = self.env.user.has_group('hr.group_hr_manager')
        for rec in self:
            if not is_admin:
                raise UserError(_('You have no access to delete this record.'))
            if rec.state!="draft" :
                raise UserError(_('First send to draft.'))
        return super(QuarterlyReview, self).unlink()
    
    @api.model
    def create(self, vals):
        if "create_quarter_date" not in vals:
            vals['create_quarter_date'] = date.today()
        return super(QuarterlyReview, self).create(vals)
    
    @api.onchange("name")
    def get_details(self):
        self.designation = self.name.job_title
        self.department = self.name.department_id
        self.location = self.name.work_location
        self.employee_no = self.name.device_id
        self.manager_id = [(6, 0, [self.name.parent_id.id])]

    @api.onchange("manager_id")
    def manager_error(self):
        if self.name and self.manager_id:
            if self.name.id in self.manager_id.ids:
                raise UserError(_('Same employee and Manager not accepted'))

    @api.onchange("name","designation","department","location","employee_no","manager_id","quarter_name","quarter_start_date","quarter_end_date")
    def check_permissions_user(self):
        is_admin = self.env.user.has_group('hr.group_hr_manager')
        if not is_admin:
            raise UserError(_('You have no access to Edit record.'))
        if self.state != "draft":
            raise UserError(_('You can only edit this on draft stage.'))
    
    def submit_form(self):
        is_admin = self.env.user.has_group('hr.group_hr_manager')
        user_employee_id = self.env.user.employee_id.id
        if user_employee_id != self.name.id and not is_admin:
            raise UserError(_('You have no access to submit this  form.'))
        self.submit_date= date.today()
        self.is_manager =True
        if len(self.activity_id.ids) <4:
            raise UserError(_('Please add atleast 4 IKRAs (Individual Key Result Areas).'))
        if len(self.project_id.ids) <2:
            raise UserError(_('Please add atleast 2 Major Accomplishments and Results.'))
        if len(self.disappoint_id.ids) <1:
            raise UserError(_('Please add atleast 1 Dissapointment.'))
        if self.reliability and self.performance and self.job_knowledge and self.adaptability and self.quantity_work and self.quality_work and self.responsive and self.confidentiality and self.communication and self.attendance:
            pass
        else:
            raise UserError(_('Please Fill all fields in Performance Feedback.'))
        if self.project_id:
            for rec in self.project_id:
                rec.state = "submit"
        if self.disappoint_id:
            print(self.disappoint_id,'Disapoint')
            for disapoint in self.disappoint_id:
                print(disapoint.id,'disapoint')
                disapoint.state = "submit"

        for manager in self.manager_id:
            new_review = self.sudo().copy()
            new_review.manager_id = [(6, 0, [manager.id])]
            new_review.is_manager =False
            new_review.sub_id = self.id    
            new_review.state = "submit"
            body = """<html lang="en">
                    <body>
                        <div>
                            
                            </br>
                            <p>A Quarterly Performance Review Form (PMS) submitted by an employee is ready on Odoo. You need to review it and submit your feedback within 2 days from today.</p>
                            </br>
                            <p> Once the time is up you won't be able to submit your feedback regarding the employee's Quarterly Performance Review.</p>
                            """
            body += """
                        </div>
                            <p>Thank you</p>
                        </div>
                    </body>
                        </html>"""
        
            vals = { 'subject': 'Quarterly Performance Review Form for '+self.name.name,
                    'body_html' : body,
                    'email_from' :'hr@latitudetechnolabs.com',
                    'email_to': manager.work_email,
                    'auto_delete': False,
                                }
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
        # base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        self.state="submit"
        self.is_submit = True
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
    
    @api.onchange("is_submit")
    def get_sub_quarter_details(self):
        if self.is_submit == True:
            sub_reviews = self.env['quarterly.review'].sudo().search([('sub_id','=',self.id)])
            sub_id=[]
            for rec in sub_reviews:
                sub_id.append(rec.id)
            self.sub_quarter_ids= [(6, 0, sub_id)]  

    def set_draft(self):
        self.state="draft"
        self.is_submit = False
    
    def set_manager_submit(self):
        if self.project_id:
            if not all(self.project_id.mapped('manager_comment')):
                raise UserError(_('Please Give comment on Project.'))
        if self.disappoint_id:
            if not all(self.disappoint_id.mapped('manager_comment')):
                raise UserError(_('Please Give comment on Dissapointment Review.'))
        if self.reliability_manager and self.performance_manager and self.job_knowledge_manager and self.adaptability_manager and self.quantity_work_manager and self.quality_work_manager and self.responsive_manager and self.confidentiality_manager and self.communication_manager and self.attendance_manager:
            pass
        else:
            raise UserError(_('Please Fill all fields in Performance Feedback.'))
        self.state = "submit_manager"
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }

    def set_done(self):
        self.state="done"
        self.complete_date = date.today()
        joining_date = self.name.joining_date
        quarter = ''
        if self.name.joining_date:
                
            month =joining_date.month
            if month >= 4 and month <= 9:
                quarter = 'quarter_1'  # Group - I: April to September
            else:
                quarter = 'quarter_2'
        salary_id = self.env['salary.details'].create({
            'name': self.name.id,
            'joining_date': joining_date,
            'quarter':quarter
        })
        self.salary_id = salary_id.id

    def send_employee(self):
        for rec in self:
            rec.state='sent'
            rec.mail_send_date = date.today()
            body = """<html lang="en">
                    <body>
                        <div>
                            
                            </br>
                            <p>Your Quarterly Performance Review Form (PMS) is ready on Odoo. You need to submit the form within 2 days from today</p>
                            </br>
                            <p><h5>Once the time is up you won't be able to submit your Quarterly Performance Review Form (PMS).</h5></p>
                            """
            body += """
                        </div>
                            <p>Thank you</p>
                        </div>
                    </body>
                        </html>"""
        
            vals = { 'subject': 'Quarterly Performance Review Form',
                    'body_html' : body,
                    'email_from' :'hr@latitudetechnolabs.com',
                    'email_to': rec.name.work_email,
                    'auto_delete': False,
                                }
            mail_id = self.env['mail.mail'].sudo().create(vals)
            mail_id.sudo().send()
    
    def cron_quarterly_review_create(self):
        employees = self.env['hr.employee'].search([])
        for rec in employees:
            review = self.env['quarterly.review'].create({"name":rec.id,"department":rec.department_id.id,"designation":rec.job_title,"create_quarter_date": date.today(),"location":rec.work_location,"manager_id":[(6, 0, [rec.parent_id.id])] if rec.parent_id else False})
        body = """<html lang="en">
                <body>
                    <div>
                        
                        </br>
                        <p>The Quarterly Performance Review Form (PMS) is ready on Odoo for all the staff. Please have a look and add all the necessary information needed and submit them to the employees to fill.</p>
                        </br>
                        <p>Only after you hit the submit button the employees will be notified of the Quarterly Performance Review Form (PMS).</p>
                        """
        body += """
                    </div>
                        <p>Thank you</p>
                    </div>
                </body>
                    </html>"""
    
        vals = { 'subject': 'Quarterly Performance Review Form',
                'body_html' : body,
                'email_from' :'hr@latitudetechnolabs.com',
                'email_to': 'hr@latitudetechnolabs.com',
                'auto_delete': False,
                            }
        mail_id = self.env['mail.mail'].sudo().create(vals)
        mail_id.sudo().send()

    def cron_submit_by_hr(self):
        five_days_ago = fields.Date.today() - timedelta(days=5) 
        draft_reviews = self.search([('state', '=', 'draft'), ('create_quarter_date', '<', five_days_ago)])
        for rec in draft_reviews:
            rec.send_employee()

    def cron_submit_by_employee(self):
        three_days_ago = fields.Date.today() - timedelta(days=3) 
        sent_reviews = self.search([('state', '=', 'sent'), ('mail_send_date', '<', three_days_ago)])
        for rec in sent_reviews:
            if len(rec.activity_id.ids) <4 and len(rec.project_id.ids) <2 and len(rec.disappoint_id.ids) <1 and all([rec.reliability,rec.performance,rec.job_knowledge,rec.adaptability,rec.quantity_work,rec.quality_work,rec.responsive,rec.confidentiality,rec.communication,rec.attendance]):
                rec.submit_form()
            else:
                # rec.submit_date = fields.Date.today()
                rec.state = "submit_manager"

    def cron_submit_by_manager(self):
        three_days_ago = fields.Date.today() - timedelta(days=3) 
        submit_reviews = self.search([('state', '=', 'submit'), ('submit_date', '<', three_days_ago)])
        for rec in submit_reviews:
            rec.state = "submit_manager" 


class ActivityReview(models.Model):
    _name = "activity.review"

    name = fields.Text(string="Individual Key Result Areas",required=True)
    quarter_id = fields.Many2one('quarterly.review',string="quarterly review  ")

    @api.onchange("name")
    def check_permission_manager(self):
        user_employee_id = self.env.user.employee_id.id
        manager_ids = self.quarter_id.manager_id.ids
        if user_employee_id in manager_ids:
            raise UserError(_('You have no access to Edit record.'))
        if user_employee_id != self.quarter_id.name.id and self.name:
            raise UserError(_('You have no access to Edit record.'))
    

class ProjectReview(models.Model):
    _name = "project.review"
    _rec_name = 'project_id'

    project_id = fields.Many2one('project.project',string="Project")
    accomplishment = fields.Text(string="Accomplishment",required=True)
    support = fields.Text(string="Support received from Colleague/Management (in brief)")
    action = fields.Text(string="Major action taken by self",required=True)
    quarter_id = fields.Many2one('quarterly.review',string="quarterly review",readonly=True)
    manager_comment = fields.Text(string="Manager's Comment")
    self_rating = fields.Integer(string="Self-Rating 01 to 10",default=1,required=True)
    manager_rating = fields.Integer(string="Manager's Rating 01 to 10",default=1,)
    state = fields.Selection([('draft','Draft'),('submit','Submitted')],default = 'draft')

    @api.onchange('self_rating','manager_rating')
    def check_rating(self):
        if self.self_rating <1 or self.self_rating>10:
            raise UserError(_('Please enter number between 1 to 10.'))
        if self.manager_rating <1 or self.manager_rating>10:
            raise UserError(_('Please enter number between 1 to 10.'))

    @api.onchange("accomplishment","support","action","self_rating","project_id")
    def check_permission_manager(self):
        user_employee_id = self.env.user.employee_id.id
        manager_ids = self.quarter_id.manager_id.ids
        if user_employee_id in manager_ids:
            raise UserError(_('You have no access to Edit record.'))
        if user_employee_id != self.quarter_id.name.id and self.quarter_id:
            raise UserError(_('You have no access to Edit record.'))

class DisapointReview(models.Model):
    _name = "disapoint.review"

    quarter_id = fields.Many2one('quarterly.review',string="quarterly review",readonly=True)
    state = fields.Selection([('draft','Draft'),('submit','Submitted')],default = 'draft')
    disappointment=fields.Text(string="Disappointment / Missed opportunity",required=True)
    action=fields.Text(string="Actions would have been taken to convert this disappointment in to Accomplishment / Achievement",required=True)
    manager_comment = fields.Text(string="Manager's Comment")
    self_rating = fields.Integer(string="Self-Rating in Negative -01 to -10",default=-1,required=True)
    manager_rating = fields.Integer(string="Manager's Rating in Negative -01 to -10",default=-1)
    
    @api.onchange('self_rating','manager_rating')
    def check_rating(self):
        if self.self_rating >-1 or self.self_rating<-10:
            raise UserError(_('Please enter number between -1 to -10.'))
        if self.manager_rating >-1 or self.manager_rating<-10:
            raise UserError(_('Please enter number between -1 to -10.'))

    @api.onchange("disappointment","self_rating","action")
    def check_permission_manager(self):
        user_employee_id = self.env.user.employee_id.id
        manager_ids = self.quarter_id.manager_id.ids
        if user_employee_id in manager_ids:
            raise UserError(_('You have no access to Edit record.'))
        if user_employee_id != self.quarter_id.name.id and self.quarter_id:
            raise UserError(_('You have no access to Edit record.'))