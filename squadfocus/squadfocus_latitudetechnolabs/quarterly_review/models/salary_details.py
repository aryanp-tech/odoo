from odoo import fields, models,api, _
from odoo.exceptions import ValidationError,UserError
from datetime import date,timedelta
import io
import base64
from openpyxl.utils import get_column_letter
from openpyxl.styles import Alignment
from openpyxl import Workbook
from dateutil.relativedelta import relativedelta

class SalaryDetails(models.Model):
    """ Salary Details """
    _name = "salary.details"
    _inherit = 'mail.thread'

    name = fields.Many2one('hr.employee',string="Employee Name",required=True)
    joining_date = fields.Date("Joining Date")
    cur_salary = fields.Integer('Current Salary')
    increment_percentage = fields.Integer('Increment Percentage')
    total_increment = fields.Integer('Total Increment')
    pli_percentage = fields.Integer('PLI Percentage')
    total_pli = fields.Integer('Total PLI')
    final_amount = fields.Integer('Final Salary',compute="get_total_salary")
    yearly_pli = fields.Integer('Total Yearly PLI')
    pli_1st = fields.Integer('13th Month PLI')
    pli_2nd= fields.Integer('14th Month PLI')
    pli_3rd = fields.Integer('15th Month PLI')
    from_date = fields.Date("From Date")
    to_date = fields.Date("To Date")
    quarter = fields.Selection([('quarter_1','1st Quarter'),('quarter_2','2nd Quarter')],string="Quarter Group")

    def get_quarter_start_date(self, rec):
        if rec.joining_date:
            today = fields.Date.today()
            if rec.joining_date.month >= 4 and rec.joining_date.month <= 9:
                return date(today.year, 4, 1)
            else:
                return date(today.year, 10, 1)

    @api.onchange('joining_date')    
    def quarter_get(self):

        for rec in self:
            if rec.joining_date:
                if rec.joining_date.month >= 4 and rec.joining_date.month <= 9:
                    rec.quarter = "quarter_1"
                else:
                    rec.quarter = 'quarter_2'

    # @api.onchange('cur_salary', 'increment_percentage','joining_date')
    # def get_total_yearly_pli(self):
    #     for rec in self:
    #         total_amount = rec.cur_salary+rec.total_increment+rec.total_pli
    #         rec.final_amount= total_amount

    @api.onchange('cur_salary', 'increment_percentage','joining_date','from_date','to_date')
    def get_total_increment(self):
        """ Compute total increment based on current salary and increment percentage """
        
        for rec in self:
            if rec.cur_salary and rec.increment_percentage:
                total_increment = rec.cur_salary * (rec.increment_percentage / 100)
                if rec.joining_date or all([rec.from_date,rec.to_date]):
                    if rec.from_date and rec.to_date:
                        difference = relativedelta(rec.to_date, rec.from_date)
                        years_completed = difference.years
                        months_completed = difference.months
                    else:
                        quarter_start = self.get_quarter_start_date(rec)
                        difference = relativedelta(quarter_start, rec.joining_date)
                        years_completed = difference.years
                        months_completed = (difference.months)
                    if rec.joining_date.day >1 and rec.joining_date.day <16:
                        months_completed += 1
                    
                    if years_completed == 0:
                        prorated_increment = (months_completed * total_increment) / 12
                        rec.total_increment = prorated_increment
                    else:
                        rec.total_increment = total_increment
                else:
                    rec.total_increment = total_increment
            else:
                rec.total_increment = 0

    @api.onchange('pli_percentage','joining_date','cur_salary','from_date','to_date')
    def get_total_pli(self):
        """ Compute total PLI based on current salary and PLI percentage """
        for rec in self:
            if rec.cur_salary and rec.pli_percentage:
                # Calculate total PLI
                total_pli = rec.cur_salary * (rec.pli_percentage / 100)
                
                # Check if the employee is in the first year
                today = fields.Date.today()
                if rec.joining_date or all([rec.from_date,rec.to_date]):
                    if rec.from_date and rec.to_date:
                        difference = relativedelta(rec.to_date, rec.from_date)
                        years_completed = difference.years
                        months_completed = difference.months
                    # Calculate the time difference in years and months
                    else:
                        quarter_start = self.get_quarter_start_date(rec)
                        difference = relativedelta(quarter_start, rec.joining_date)
                        years_completed = difference.years
                        months_completed = difference.months
                    
                    if rec.joining_date.day >1 and rec.joining_date.day <16:
                        months_completed += 1
                    
                    if years_completed == 0:
                        prorated_pli = (months_completed * total_pli) / 12
                        rec.total_pli = prorated_pli
                        pli_yearly = months_completed*prorated_pli
                        rec.yearly_pli = pli_yearly
                        rec.pli_1st = pli_yearly*30/100
                        rec.pli_2nd = pli_yearly*30/100
                        rec.pli_3rd =pli_yearly*40/100
                    else:
                        rec.total_pli = total_pli
                        pli_yearly = total_pli*12
                        rec.yearly_pli = pli_yearly
                        rec.pli_1st = pli_yearly*30/100
                        rec.pli_2nd = pli_yearly*30/100
                        rec.pli_3rd =pli_yearly*40/100
                else:
                    rec.total_pli = total_pli
            else:
                rec.total_pli = 0
    def get_total_salary(self):
        for rec in self:
            total_amount = rec.cur_salary+rec.total_increment+rec.total_pli
            rec.final_amount= total_amount