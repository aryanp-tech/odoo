from odoo import http, _, api
from odoo.http import request
import base64
from datetime import date
import datetime
from odoo.exceptions import UserError, ValidationError
from odoo.addons.web.controllers.main import ensure_db, Home
import werkzeug

MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT = IMAGE_LIMITS = (1024, 768)


class HomeInherits(Home):
    @http.route('/web', type='http', auth="none")
    def web_client(self, s_action=None, **kw):
        if request.session.uid:
            user = request.env['res.users'].sudo().browse(request.session.uid)
            if user:
                if user.onboarding_plan_sent:
                    return werkzeug.utils.redirect('/employee/form')

        return super(HomeInherits, self).web_client(s_action, **kw)

    @http.route(['/employee/form'], type='http', auth="user", website=True)
    def partner_form(self):
        return request.render("onboarding_employee.tmp_employee_form", {})

    @http.route(['/employee/form/submit'], type='http', auth="user", website=True)
    def employee_form_submit(self, **post):
        Attachments = request.env['ir.attachment']
        name = post.get('attachment').filename
        file = post.get('attachment')
        attachment = file.read()

        name1 = post.get('attachment1').filename
        file1 = post.get('attachment1')
        attachment1 = file1.read()

        name2 = post.get('attachment2').filename
        file2 = post.get('attachment2')
        attachment2 = file2.read()

        name3 = post.get('attachment3').filename
        file3 = post.get('attachment3')
        attachment3 = file3.read()

        name4 = post.get('attachment4').filename
        file4 = post.get('attachment4')
        attachment4 = file4.read()

        name5 = post.get('attachment5').filename
        file5 = post.get('attachment5')
        attachment5 = file3.read()

        name6 = post.get('attachment6').filename
        file6 = post.get('attachment6')
        attachment6 = file6.read()

        user = request.env['res.users'].sudo().browse(request.session.uid)
        emp = user.employee_id
        if post.get('name') and post.get('birthday') <= str(date.today()) and len(
                post.get('mobile_phone')) == 10 and post.get('gender') and post.get(
            'study_field') and len(post.get('emergency_contact')) == 10 and post.get(
            'form_filling_date') and base64.b64encode(
            attachment) and base64.b64encode(attachment2) and base64.b64encode(attachment3):
            partner = emp.write({
                'name': post.get('name'),
                'birthday': post.get('birthday'),
                'form_filling_date': post.get('form_filling_date'),
                'mobile_phone': post.get('mobile_phone'),
                'gender': post.get('gender'),
                'work_phone': post.get('mobile_phone'),
                'pf_account': post.get('pf_account'),
                'phone': post.get("mobile_number"),
                'uan': post.get('uan'),
                'aadhar_no': post.get('aadhar_no'),
                'pan_no': post.get('pan_no'),
                'blood_group': post.get('blood'),
                'job_title': post.get('job_title'),
                'study_field':post.get('other_education') if post.get('study_field') in ['Graduate - Other','Post Graduate - Other'] else post.get('study_field'),
                'emergency_phone': post.get('emergency_contact'),
                'emergency_contact': post.get('emergency'),
                'image_1920': base64.b64encode(attachment),
                'pan_img': base64.b64encode(attachment1),
                'aadhar_img': base64.b64encode(attachment2),
                'mark_sheet': base64.b64encode(attachment3),
                'mark_sheet_12': base64.b64encode(attachment5),
                'graduation': base64.b64encode(attachment4),
                'postgraduation': base64.b64encode(attachment6),
                'user_id': user.id,
            })
            hh = user.write({'onboarding_plan_sent': False})
            attachment_id = Attachments.sudo().create({
                'name': name,
                'res_name': name,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment),
            })

            attachment1_id = Attachments.sudo().create({
                'name': name1,
                'res_name': name1,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment1),
            })

            attachment2_id = Attachments.sudo().create({
                'name': name2,
                'res_name': name2,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment2),
            })

            attachment3_id = Attachments.sudo().create({
                'name': name3,
                'res_name': name3,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment3),
            })
            attachment4_id = Attachments.sudo().create({
                'name': name4,
                'res_name': name4,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment4),
            })
            attachment5_id = Attachments.sudo().create({
                'name': name5,
                'res_name': name5,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment5),
            })
            attachment6_id = Attachments.sudo().create({
                'name': name6,
                'res_name': name6,
                'type': 'binary',
                'res_model': 'hr.employee',
                'datas': base64.b64encode(attachment6),
            })

            vals = {
                'attachment': attachment_id,
                'attachment1': attachment1_id,
                'attachment2': attachment2_id,
                'attachment3': attachment3_id,
                'attachment4': attachment4_id,
                'attachment5': attachment5_id,
                'attachment6': attachment6_id,
            }

            vals = {
                'partner': partner,

            }
            return request.render("onboarding_employee.tmp_employee_form_success", vals)
        else:
            raise UserError(_("You need to Enter description or attach a file before submit."))

    @http.route(['/employee/resignation'], type='http', auth="user", website=True)
    def resignation_form(self, **post):
        return request.render("onboarding_employee.emp_resignation_form", {})

    @http.route(['/employee/resignation/submit'], type='http', auth="user", website=True)
    def resignation_form_submit(self, **post):
        user = request.env['res.users'].sudo().browse(request.session.uid)
        emp = user.employee_id
        if post.get('interview_date') and post.get('last_day') >= str(date.today()) and post.get(
                'employe_period') and post.get('leaving') and post.get('job_decription') and post.get(
            'experence') and post.get('working_withus') and post.get('advancement') and post.get(
            'suggestions') and post.get('working_relationship') and post.get('suggession') and post.get(
            'fair') and post.get('recognition') and post.get('complaints') and post.get('information') and post.get(
            'busy') and post.get('jobwell') and post.get('Welcomes') and post.get('discipline') and post.get(
            'jobpay') and post.get('accural') and post.get('culture'):
            employee = emp.write({
                'interview_date': post.get('interview_date'),
                'last_day': post.get('last_day'),
                'employe_period': post.get('employe_period'),
                'job_title': str(emp.job_title),
                'job_decription': post.get('job_decription'),
                'leaving': post.get('leaving'),
                'experence': post.get('experence'),
                'working_withus': post.get("working_withus"),
                'advancement': post.get('advancement'),
                'suggestions': post.get('suggestions'),
                'working_relationship': post.get('working_relationship'),
                'policies': post.get('policies'),
                'fair': post.get('fair'),
                'recognition': post.get('recognition'),
                'complaints': post.get('complaints'),
                'information': post.get('information'),
                'busy': post.get('busy'),
                'jobwell': post.get('jobwell'),
                'Welcomes': post.get('Welcomes'),
                'discipline': post.get('discipline'),
                'department': post.get('department'),
                'cooperation': post.get('cooperation'),
                'communications': post.get('communications'),
                'conditions': post.get('conditions'),
                'schedule': post.get('schedule'),
                'jobpay': post.get('jobpay'),
                'accural': post.get('accural'),
                'culture': post.get('culture'),
                'suggession': post.get('suggession'),

            })
            # hh = user.write({'onboarding_plan_sent': False})
            vals = {
                'partner': employee,
            }
            return request.render("onboarding_employee.tmp_employee_regi_success", vals)
        else:
            return UserError(_("You need to Enter description before submit."))



    @http.route(['/employee/companyproperty'], type='http', auth="user", website=True)
    def companyproperty_form(self, **post):
        return request.render("onboarding_employee.emp_companyproperty_form", {})

    @http.route(['/employee/companyproperty/submit'], type='http', auth="user", website=True)
    def companyproperty_form_submit(self, **post):
        user = request.env['res.users'].sudo().browse(request.session.uid)
        emp = user.employee_id
        if post.get('category'):
            data = emp.write({
                'category': post.get('category'),
                'headphone': post.get('headphone'),
                'keyboard': post.get('keyboard'),
                'mouse': post.get('mouse'),
            })
            vals = {
                'partner': data,
            }
            return request.render("onboarding_employee.tmp_employee_regi_success", vals)

        else:
            return UserError(_("You need to Enter description before submit."))
