from odoo import models,fields 


class PublicHolidays(models.Model):
    _name = 'public.holidays'

    name = fields.Char('Name')
    holidays_line = fields.One2many('public.holidays.line','public_holidays','Public Holidays')


class PublicHolidaysLine(models.Model):
    _name = 'public.holidays.line'

    name = fields.Char('Name')
    leave_date = fields.Date('Date')
    public_holidays = fields.Many2one('public.holidays')