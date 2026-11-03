from odoo import fields, models,api,_


class EquipementStock(models.Model):

    _name = 'equipment.stock'
    _inherit = 'mail.thread'

    name = fields.Many2one('equipment.category','Category')
    category = fields.Char('Product Name')
    vendor_id = fields.Many2one('res.partner','Vendor Name')
    quantity = fields.Integer('Quantity',default =1)
    purchase_date = fields.Datetime(string='Purchase Date', default=fields.Datetime.now)
    serial_no = fields.Char('Serial No')
    responsible = fields.Many2one('hr.employee','Tech')
    ticket_no = fields.Char('Ticket No')
    remark = fields.Char('Remarks')
    prod_from = fields.Selection([('employee','Employee'),('it_department','IT Department'),
                                  ('vendor','Vendor'),('owner','Owner')],'Product From')
    prod_to = fields.Selection([('employee','Employee'),('it_department','IT Department'),
                                ('vendor','Vendor'),('owner','Owner')],'Product To')
    from_employee = fields.Many2one('hr.employee','Employee From')
    to_employee = fields.Many2one('hr.employee','Employee To')
    tag_no = fields.Integer('Tag No')
    tag_code = fields.Char('Tag Code',default=False)
    ram = fields.Char('Ram')
    rom = fields.Char('Rom')
    processor = fields.Char('Processor')
    on_name = fields.Char('Name ')
        
    @api.onchange('name')
    def get_name(self):
        self.on_name = self.name.category
        if self.name.tag_code:
            self.tag_code = self.name.tag_code 

    @api.model
    def create(self,vals):
        res = super(EquipementStock, self).create(vals)
        for rec in range(res.quantity):
            equipment = self.env['equipment.details'].create({'category':res.name.id,'serial_no':res.serial_no,
                                                            'details':res.category,'tagging_name':res.name.tag_code,
                                                            'tag_no':(res.tag_no),'ram':res.ram,'rom':res.rom,
                                                            'processor':res.processor,'comp_name':res.category,
                                                            })
        activity = self.env['equipment.activity'].create({'equipment':equipment.id,'name':res.name.id,
                                                          'assign_date':res.purchase_date,'prod_from':res.prod_from,
                                                          'prod_to':res.prod_to,'from_employee':res.from_employee.id,
                                                          'to_employee':res.to_employee.id,'serial_no':res.serial_no,
                                                          'employee_id':res.responsible.id,'job_title':res.responsible.job_title,
                                                          'reason': res.remark,'responsible':res.responsible.id,'quantity':res.quantity})
        return res





   