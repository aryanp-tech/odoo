# -*- coding: utf-8 -*-
###################################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#    Copyright (C) 2020-TODAY Cybrosys Technologies(<http://www.cybrosys.com>).
#    Author: cybrosys(<https://www.cybrosys.com>)
#
#    This program is free software: you can modify
#    it under the terms of the GNU Affero General Public License (AGPL) as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###################################################################################
import pytz
import sys
import datetime
import logging
import binascii
from datetime import datetime, timedelta,time

from . import zklib
from .zkconst import *
from struct import unpack
from odoo import api, fields, models
from odoo import _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)
try:
    from zk import ZK, const
except ImportError:
    _logger.error("Please Install pyzk library.")

_logger = logging.getLogger(__name__)


class HrAttendance(models.Model):
    _inherit = 'hr.attendance'

    device_id = fields.Char(string='Biometric Device ID')

    @api.model
    def create(self,vals):
        if self.env.context.get('skip_biometric_gate'):
            return super(HrAttendance, self).create(vals)
        today = fields.Date.today()
        emp_obj = self.env['hr.employee'].search([('id','=',vals['employee_id'])])
        work_home = self.env['hr.leave'].search([('employee_id','=',vals['employee_id']),('request_date_from',"<=",today),('request_date_to',">=",today),('state','=','validate')])
        
        if emp_obj.working_type == 'wfo':
            if not work_home:
                if 'device_id' not in vals:
                    raise UserError(_("Please Checkin Using Biometric."))
                else:
                    result = super(HrAttendance, self).create(vals)
                    return result
        if vals.get('is_leave'):
            result = super(HrAttendance, self).create(vals)
            return result
        if vals.get('device_id'):
            if vals.get('check_in'):
                record_time = vals.get('check_in')
            else:
                record_time = vals.get('punching_time')
        else:
            if vals.get('check_in'):
                record_time = pytz.utc.localize(fields.Datetime.from_string(vals.get('check_in'))).astimezone(pytz.timezone('Asia/Kolkata'))
            else:
                record_time = vals.get('punching_time')
        if record_time:
            if type(record_time) is str:
                record_time = pytz.utc.localize(fields.Datetime.from_string(record_time)).astimezone(pytz.timezone('Asia/Kolkata'))
            record_date = record_time.date()
            start_of_day = datetime.combine(record_date, time.min)
            end_of_day = datetime.combine(record_date, time.max)
            
            first_record_today = self.env['hr.attendance'].search_count([
                ('employee_id', '=', vals["employee_id"]),
                ('check_in', '>=', start_of_day),
                ('check_in', '<=', end_of_day)
            ])
            if first_record_today == 0 and record_time.time() < time(9, 0):
                record_datetime = datetime.now(pytz.timezone('Asia/Kolkata')).combine(record_date, time(3, 30))
                vals['check_in'] = record_datetime
        result = super(HrAttendance, self).create(vals)
        return result
    
    def write(self,values):
        if self.env.context.get('skip_biometric_gate'):
            return super(HrAttendance, self).write(values)
        # now = fields.Datetime.now()
        today = fields.Date.today()
        emp_obj = self.env['hr.employee'].search([('id','=',self.employee_id.id)])
        # work_from_home = self.env['hr.leave.type'].search([('name','=','Work From Home')])
        # work_home = self.env['hr.leave'].search([('holiday_status_id','=',work_from_home.id),('date_from',"<=",now),('date_to',">=",now),('employee_id','=',self.employee_id.id),('state','=','validate')])
        work_home = self.env['hr.leave'].search([('employee_id','=',emp_obj.id),('request_date_from',"<=",today),('request_date_to',">=",today),('state','=','validate')])
        if emp_obj.working_type == 'wfo':
            if not work_home:
                if 'device_id' not in values:
                    raise UserError(_("Please Checkout Using Biometric."))
                else:
                    result = super(HrAttendance, self).write(values)
                    return result
        result = super(HrAttendance, self).write(values)            
        return result

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    working_type = fields.Selection([('wfh','Work From Home'),('wfo','Work From Office'),('wfr','Work From Rajkot')],default = 'wfh')

class MissedBiometric(models.Model):
    _name = 'miss.biometric'

    name= fields.Char('Name')
    fail_date = fields.Datetime('Missed Cron Biometric')
    status= fields.Char('status')
    ip_code  = fields.Char('IP')

class ZkMachine(models.Model):
    _name = 'zk.machine'

    name = fields.Char(string='Machine IP', required=True)
    port_no = fields.Integer(string='Port No', required=True)
    address_id = fields.Many2one('res.partner', string='Working Address')
    company_id = fields.Many2one('res.company', string='Company', default=lambda self: self.env.user.company_id.id)

    def device_connect(self, zk):
        try:
            conn = zk.connect()
            return conn
        except Exception as e:
            
            return False

    def clear_attendance(self):
        for info in self:
            try:
                machine_ip = info.name
                zk_port = info.port_no
                timeout = 30
                try:
                    zk = ZK(machine_ip, port=zk_port, timeout=timeout, password=0, force_udp=False, ommit_ping=False)
                except NameError:
                    raise UserError(_("Please install it with 'pip3 install pyzk'."))
                conn = self.device_connect(zk)
                if conn:
                    conn.enable_device()
                    clear_data = zk.get_attendance()
                    if clear_data:
                        # conn.clear_attendance()
                        self._cr.execute("""delete from zk_machine_attendance""")
                        conn.disconnect()
                        raise UserError(_('Attendance Records Deleted.'))
                    else:
                        raise UserError(_('Unable to clear Attendance log. Are you sure attendance log is not empty.'))
                else:
                    raise UserError(
                        _('Unable to connect to Attendance Device. Please use Test Connection button to verify.'))
            except:
                raise ValidationError(
                    'Unable to clear Attendance log. Are you sure attendance device is connected & record is not empty.')

    def getSizeUser(self, zk):
        """Checks a returned packet to see if it returned CMD_PREPARE_DATA,
        indicating that data packets are to be sent

        Returns the amount of bytes that are going to be sent"""
        command = unpack('HHHH', zk.data_recv[:8])[0]
        if command == CMD_PREPARE_DATA:
            size = unpack('I', zk.data_recv[8:12])[0]
            print("size", size)
            return size
        else:
            return False

    def zkgetuser(self, zk):
        """Start a connection with the time clock"""
        try:
            users = zk.get_users()
            print(users)
            return users
        except:
            return False

    @api.model
    def cron_download(self):
        machines = self.env['zk.machine'].search([])
        for machine in machines:
            machine.download_attendance()

    def download_attendance(self):
        _logger.info("++++++++++++Cron Executed++++++++++++++++++++++")
        zk_attendance = self.env['zk.machine.attendance']
        att_obj = self.env['hr.attendance']
        for info in self:
            machine_ip = info.name
            zk_port = info.port_no
            timeout = 15
            try:
                zk = ZK(machine_ip, port=zk_port, timeout=timeout, password=0, force_udp=False, ommit_ping=False)
            except NameError:
                raise UserError(_("Pyzk module not Found. Please install it with 'pip3 install pyzk'."))
            conn = self.device_connect(zk)
            if conn:
                # conn.disable_device() #Device Cannot be used during this time.
                try:
                    user = conn.get_users()
                except:
                    user = False
                try:
                    attendance = conn.get_attendance()
                except:
                    attendance = False
                if attendance:
                    for each in attendance:
                        atten_time = each.timestamp
                        atten_time = datetime.strptime(atten_time.strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S')
                        local_tz = pytz.timezone(
                            self.env.user.partner_id.tz or 'GMT')
                        local_dt = local_tz.localize(atten_time, is_dst=None)
                        utc_dt = local_dt.astimezone(pytz.utc)
                        utc_dt = utc_dt.strftime("%Y-%m-%d %H:%M:%S")
                        atten_time = datetime.strptime(
                            utc_dt, "%Y-%m-%d %H:%M:%S")
                        # atten_time = fields.Datetime.to_string(atten_time)
                        # if atten_time.year != date.today().year:
                        #     # Update the year to the current year, retaining the same month, day, and time
                        #     current_year = date.today().year
                        #     atten_time = atten_time.replace(year=current_year)
                        #     atten_time = fields.Datetime.to_string(atten_time)
                        # else:
                            # Process if the year matches
                        atten_time = fields.Datetime.to_string(atten_time)
                        if user:
                            for uid in user:
                                if uid.user_id == each.user_id:
                                    get_user_id = self.env['hr.employee'].search(
                                        [('device_id', '=', each.user_id)], limit=1)
                                    if get_user_id:
                                        duplicate_atten_ids = zk_attendance.search(
                                            [('device_id', '=', each.user_id), ('punching_time', '=', atten_time)])
                                        if duplicate_atten_ids:
                                            continue
                                        else:
                                            try:
                                                _logger.info(str(each.user_id)+"++++++++++++Ifffff Block Executed++++++++++++++++++++++")
                                                zk_attendance.create({'employee_id': get_user_id.id,
                                                                    'device_id': each.user_id,
                                                                    'attendance_type': str(each.status),
                                                                    'punch_type': str(each.punch),
                                                                    'punching_time': atten_time,
                                                                    'address_id': info.address_id.id})
                                                att_var = att_obj.search([('employee_id', '=', get_user_id.id),
                                                                        ('check_out', '=', False)])
                                                _logger.info("created-------------------------------")
                                                print('ddfcd', str(each.status))
                                                if each.punch == 0:  # check-in
                                                    _logger.info(str(each.user_id)+"++++++++++++Checkin-------- Executed++++++++++++++++++++++")
                                                    if not att_var:
                                                        att_obj.create({'employee_id': get_user_id.id,
                                                                        'check_in': atten_time,'device_id':each.user_id})
                                                if each.punch == 1:  # check-out
                                                    if len(att_var) == 1:
                                                        att_var.write({'check_out': atten_time,'device_id':each.user_id})
                                                    else:
                                                        att_var1 = att_obj.search([('employee_id', '=', get_user_id.id)])
                                                        if att_var1:
                                                            att_var1[-1].write({'check_out': atten_time,'device_id':each.user_id})
                                            except:
                                                pass

                                    else:
                                        _logger.warning(f"No employee found for device_id: {each.user_id}. Attendance skipped.")
                                        continue
                                        # continue
                                        # pass
                                        # _logger.info(uid.name+"++++++++++++Else Block Executed++++++++++++++++++++++")
                                        # print('ddfcd', str(each.status))
                                        # employee = self.env['hr.employee'].create(
                                        #     {'device_id': each.user_id, 'name': uid.name})
                                        # zk_attendance.create({'employee_id': employee.id,
                                        #                       'device_id': each.user_id,
                                        #                       'attendance_type': str(each.status),
                                        #                       'punch_type': str(each.punch),
                                        #                       'punching_time': atten_time,
                                        #                       'address_id': info.address_id.id})
                                        # att_obj.create({'employee_id': employee.id,
                                        #                 'check_in': atten_time,'device_id':each.user_id})
                                else:
                                    pass
                    # zk.enableDevice()
                    conn.disconnect
                    return True
                else:
                    raise UserError(_('Unable to get the attendance log, please try again later.'))
            else:
                miss_attend=self.env['miss.biometric'].sudo().create({'name':'Biometric Failed','fail_date':fields.Datetime.now(),'ip_code':self.name})
                one_hour_ago = datetime.now() - timedelta(hours=1)
                recent_failures = self.env['miss.biometric'].search_count([('fail_date', '>=', fields.Datetime.to_string(one_hour_ago))])
                if recent_failures >= 24:
                    body = """<html lang="en">
                        <body>
                            <div>
                                </br>
                                <p>Data fetching failure ,Please check Biometric or Odoo server </p>
                                </br>
                                """
                    body += """
                                </div>
                                    <p>Thank you</p>
                                </div>
                            </body>
                                </html>"""
                    vals = { 'subject': 'Failure..Biometric Data Fetching',
                            'body_html' : body,
                            'email_from' :'hr@latitudetechnolabs.com',
                            'email_to':'hr@latitudetechnolabs.com,rashmiranjan.s@latitudetechnolabs.org,smit.p@latitudetechnolabs.org',
                            'auto_delete': False,
                                        }
                    mail_id = self.env['mail.mail'].sudo().create(vals)
                    mail_id.sudo().send()
                    for rec in self.env['miss.biometric'].search([('fail_date', '>=', fields.Datetime.to_string(one_hour_ago))]):
                        rec.sudo().unlink()
                print( "Unable to connect, please check the parameters and network connections.")
                # raise UserError(_('Unable to connect, please check the parameters and network connections.'))
