from odoo import http
from odoo.http import request
from base64 import b64encode
from odoo.addons.website_hr_recruitment.controllers.main import WebsiteHrRecruitment   
import base64

import logging
import requests

from PIL import Image
from io import BytesIO


_logger = logging.getLogger(__name__)





class JobApplication(http.Controller):
    # @http.route('/job_detail_page', type='http', auth='user', website=True)
    # def render_job_detail_page(self):
    #     return http.request.render('job_customize.job_detail_page', {})

    @http.route(['/upload/job/application'], type='json', auth='none', methods=['POST'], csrf=False)
    def customer_form_submit_jjj(self, **post):
        job_postion_id = request.env['ir.config_parameter'].sudo().get_param('default.job.position.id',False)
        token = request.env['ir.config_parameter'].sudo().get_param('default.job.position.token',False)
        ip_system = request.env['ir.config_parameter'].sudo().get_param('default.job.position.upload.ip',False)
        if not post:
            return {
                'result':'failed',
                'message': 'There is not data!',
                'data': {}
            }
        if not job_postion_id or not token or not ip_system:
            return {
                'result': 'faied', 
                'message': 'IP or default job position or token not set in system please contact admin.',
                'data': {}
            }

        if post['token'] != token:
            return {
                'result':'failed',
                'message': 'Wrong Token',
                'data': {}
            }

        try:
            ip = request.httprequest.environ['REMOTE_ADDR']
            ipUrl = "{}/{}/json".format("https://ipapi.co", ip)
            currentLocation = requests.get(ipUrl)
            if currentLocation.status_code == 200:
                data = currentLocation.json()
                ip = data.get('ip')
        except Exception as e:
            _logger.warning("Calling -> getCurrentLocationData %s " % str(e))
            pass

        _logger.info("Ip find during the job application creation")
        _logger.info(ip)
        allow_to_create = False
        if ip:
            if ip != "127.0.0.1":
                if ip == ip_system:
                    allow_to_create = True

        if not allow_to_create:
            return {
                'result':'failed',
                'message': 'IP not matching!',
                'data': {}
            }

        job = request.env['hr.job'].sudo().search([('id', '=',int(job_postion_id))])
        job_postion = job.name
        
        if job:
            partner = request.env['hr.applicant'].sudo().create({

                'name': job_postion,
                'partner_name': post.get('partner_name'),
                'last_name': post.get('last_name'),
                'email_from': post.get('email_from'),
                'partner_phone': post.get('partner_phone'),
                'description':post.get('description'),
                'ctc_salary':post.get('ctc_salary'),
                'linkedin_profile':post.get('linkedin_profile'),
                'year_of_exp':post.get('year_of_exp'),
                'job_id': int(job_postion_id),
                'attachment_url': post.get('attachment', '')
            })
     
            # if post.get('attachment',False):
            #     url = post.get('attachment',False)
            #     response = requests.get(url)
            #     attachment = response.content

            #     Attachments = request.env['ir.attachment']
            #     attachment_id = Attachments.sudo().create({
            #         'name': post.get('partner_name'),
            #         'res_name': post.get('partner_name'),
            #         'type': 'binary',   
            #         'res_model': 'hr.applicant',
            #         'res_id':partner.id,
            #         'datas': base64.b64encode(attachment),
            #     })

        return {
            'result':'success',
            'message': 'Record created sucessfully!',
            'data': {}
        }
            # vals = {
            #     'attachment' : attachment_id
            # } 
                
            # vals = {
            #     'partner': partner,
            # }
            # print(vals)
            
            # return request.render("job_customize.tmp_customer_form_success", vals)      