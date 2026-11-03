from odoo import fields, models,api, _
from odoo.exceptions import ValidationError
import datetime


class AssetDetails(models.Model):
    """ Asset Details"""
    _name = "asset.details"
    _inherit = 'mail.thread'

    name = fields.Many2one('hr.employee',string="Employee Name",required=True)
    department = fields.Many2one('hr.department')
    work_location = fields.Selection([('wfh','Work From Home'),
                                      ('wfo','Work From Office'),
                                      ('rajkot','Work From Rajkot'),],required=True)
    state = fields.Selection([('draft','Draft'),('assigned','Assigned'),('returned','Returned')],default = 'draft')
    assign_date = fields.Datetime("Assigning Date",required=True)
    desk = fields.Char('Desk No')
    laptop = fields.Boolean(string="Laptop")
    mouse = fields.Boolean(string="Mouse")
    keyboard = fields.Boolean(string="KeyBoard")
    headphone = fields.Boolean(string="HeadPhone")
    screen = fields.Boolean(string="Screen")
    cpu = fields.Boolean(string="CPU")
    webcam = fields.Boolean(string="WebCam")
    equipment = fields.Many2one('equipment.details','Equipment')
    laptop_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in', ['Laptop','laptop']),('state', '=', 'available')]")
    mouse_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in',['mouse','Mouse'] ),('state', '=', 'available')]")
    keyboard_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in', ['keyboard','Keyboard']),('state', '=', 'available')]")
    headphone_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in', ['headphone','Headphone']),('state', '=', 'available')]")
    screen_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in', ['screen','Screen']),('state', '=', 'available')]")
    cpu_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in',[ 'cpu','CPU']),('state', '=', 'available')]")
    webcam_equip = fields.Many2one('equipment.details',domain="[('category.name', 'in',[ 'webcam','Webcam']),('state', '=', 'available')]")
    extra_equipment = fields.One2many('equipment.details','asset_id',string='Extra Equipments',domain="[('category.category', 'in', ['others','Others']),('state', '=', 'available')]")
    prod_edit = fields.Boolean('Editted',default=False)
    is_laptop =fields.Boolean('Laptop Edited',default=False)
    is_mouse =fields.Boolean('Mouse Edited',default = False)
    is_keyboard =fields.Boolean('Keyboard Edited',default=False)
    is_headphone =fields.Boolean('Headphone Edited',default=False)
    is_screen =fields.Boolean('Screen Edited',default=False)
    is_cpu = fields.Boolean('CPU Edited',default=False)
    is_webcam = fields.Boolean('Webcam Edited',default=False)
    is_extra_equipment =fields.Boolean('Extra Equipment Edited',default=False)
    reason = fields.Text('Reason')
    is_reason = fields.Boolean('Reason update',default = True)

    @api.onchange('laptop_equip')
    def get_laptop(self):
        for rec in self:
            rec.is_laptop = True
    @api.onchange('mouse_equip')
    def get_mouse(self):
        for rec in self:
            rec.is_mouse = True
    @api.onchange('keyboard_equip')
    def get_keyboard(self):
        for rec in self:
            rec.is_keyboard = True
    @api.onchange('headphone_equip')
    def get_headphone(self):
        for rec in self:
            rec.is_headphone = True
    @api.onchange('screen_equip')
    def get_screen(self):
        for rec in self:
            rec.is_screen = True
    @api.onchange('cpu_equip')
    def get_cpu(self):
        for rec in self:
            rec.is_cpu = True
    @api.onchange('webcam')
    def get_webcam(self):
        for rec in self:
            rec.is_webcam = True
    @api.onchange('extra_equipment')
    def get_extra_equipment(self):
        for rec in self:
            rec.is_extra_equipment = True
    def assign_partial(self):
        for rec in self:
            rec.prod_edit = False
            if rec.is_laptop:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.laptop_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.laptop_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_laptop = False
                rec.laptop_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_mouse:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.mouse_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.mouse_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_mouse = False
                rec.mouse_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_keyboard:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.keyboard_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.keyboard_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_keyboard = False
                rec.keyboard_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_headphone:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.headphone_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.headphone_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_headphone= False
                rec.headphone_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_screen:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.screen_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.screen_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_screen = False
                rec.screen_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_cpu:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.cpu_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.cpu_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_cpu = False
                rec.cpu_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_webcam:
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':rec.webcam_equip.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':rec.webcam_equip.id,'responsible':self.env.user.employee_id.id})
                rec.is_cpu = False
                rec.webcam_equip.write({'state':'not_available','use_by':rec.name.id})
            if rec.is_extra_equipment:
                for equipment in rec.extra_equipment:
                    equipment.write({'state':'not_available','use_by':rec.name.id})
                    activity = self.env['equipment.activity'].search([('employee_id.name','=',rec.name.name),('equipment.name','=',equipment.name)])
                if not activity:
                    activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':equipment.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':equipment.id,'responsible':self.env.user.employee_id.id})
                rec.is_extra_equipment = False
            rec.is_reason = False

    @api.model
    def create(self,vals):
        result = super(AssetDetails, self).create(vals)
        if result.laptop == True: 
            if not result.laptop_equip:
                raise ValidationError("Please off Laptop Field")
        if result.mouse == True: 
            if not result.mouse_equip:
                raise ValidationError("Please off Mouse Field")
        if result.keyboard == True: 
            if not result.keyboard_equip:
                raise ValidationError("Please off Keyboard Field")
        if result.headphone == True: 
            if not result.headphone_equip:
                raise ValidationError("Please off Headphone Field")
        if result.cpu == True: 
            if not result.cpu_equip:
                raise ValidationError("Please off CPU Field")
        if result.screen == True: 
            if not result.screen_equip:
                raise ValidationError("Please off Screen Field")
        if result.webcam == True: 
            if not result.webcam_equip:
                raise ValidationError("Please off Webcam Field")
        return result

    def write(self,vals):
        if self.state in ['assigned','returned']:
            if "laptop_equip" in vals or "mouse_equip" in vals or "keyboard_equip" in vals or "headphone_equip" in vals or "cpu_equip" in vals or "screen_equip" in vals or "webcam_equip" in vals:
                vals["prod_edit"] = True
            equips = ['laptop_equip','mouse_equip','keyboard_equip','headphone_equip','cpu_equip','screen_equip','webcam_equip']
            for rec in equips:
                if rec in vals:
                    if "laptop_equip" in vals:
                        self.product_check(self.laptop_equip,vals[rec])
                    if "mouse_equip" in vals:
                        self.product_check(self.mouse_equip,vals[rec])
                    if "keyboard_equip" in vals:
                        self.product_check(self.keyboard_equip,vals[rec])
                    if "headphone_equip" in vals:
                        self.product_check(self.headphone_equip,vals[rec])
                    if "cpu_equip" in vals:
                        self.product_check(self.cpu_equip,vals[rec])
                    if "screen_equip" in vals:
                        self.product_check(self.screen_equip,vals[rec])
                    if "webcam_equip" in vals:
                        self.product_check(self.webcam_equip,vals[rec])
            

        result = super(AssetDetails, self).write(vals)
        if self.laptop == True: 
            if not self.laptop_equip:
                raise ValidationError("Please off Laptop Field")
        if self.mouse == True: 
            if not self.mouse_equip:
                raise ValidationError("Please off Mouse Field")
        if self.keyboard == True: 
            if not self.keyboard_equip:
                raise ValidationError("Please off Keyboard Field")
        if self.headphone == True: 
            if not self.headphone_equip:
                raise ValidationError("Please off Headphone Field")
        if self.cpu == True: 
            if not self.cpu_equip:
                raise ValidationError("Please off CPU Field")
        if self.screen == True: 
            if not self.screen_equip:
                raise ValidationError("Please off Screen Field")
        if self.webcam == True: 
            if not self.webcam_equip:
                raise ValidationError("Please off Webcam Field")
        return result
    
    def product_check(self,old,new):

        old.write({'state':'available'})
        activity = self.env['equipment.activity'].create({'employee_id':self.name.id,'name':old.category.id,
                        'assign_date':datetime.datetime.now(),'prod_from':'employee',
                        'prod_to':'it_department','from_employee':self.name.id,'reason':"Returned",
                        'equipment':old.id,'responsible':self.env.user.employee_id.id})
        return True

    @api.onchange('name')
    def get_department(self):
        for rec in self:
            rec.department = rec.name.department_id.id

    # @api.onchange('laptop_equip','keyboard_equip','mouse_equip','headphone_equip','screen_equip','cpu_equip','extra_equipment','webcam_equip')
    # def prod_change(self):
    #     for rec in self:
    #         rec.prod_edit = True
    #         rec.is_reason = True
    
    def assign_asset(self):
        for rec in self:
            rec.state = 'assigned'
            rec.prod_edit = False
            rec.is_laptop = False
            rec.is_mouse = False
            rec.is_keyboard = False
            rec.is_headphone = False
            rec.is_screen = False
            rec.is_cpu = False
            rec.is_webcam = False
            rec.is_extra_equipment = False
            equipments = self.env['equipment.details'].search([('name','in',[rec.laptop_equip.name,
                                                rec.mouse_equip.name,rec.keyboard_equip.name,
                                                rec.headphone_equip.name,rec.screen_equip.name,
                                                rec.cpu_equip.name,rec.webcam_equip.name])])
            for equipment in equipments:
                equipment.write({'state':'not_available','use_by':rec.name.id})
                activity = self.env['equipment.activity'].search([('employee_id.name','=',rec.name.name),('equipment.name','=',equipment.name)])
                activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':equipment.category.id,
                        'assign_date':rec.assign_date,'prod_from':'it_department',
                        'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                        'equipment':equipment.id,'responsible':self.env.user.employee_id.id})
            if rec.extra_equipment:
                for equipment in rec.extra_equipment:
                    activity = self.env['equipment.activity'].search([('employee_id.name','=',rec.name.name),('equipment.name','=',equipment.name)])
                    if not activity:
                        equipment.write({'state':'not_available','use_by':rec.name.id})
                        activity = self.env['equipment.activity'].create({'employee_id':rec.name.id,'name':equipment.category.id,
                                'assign_date':rec.assign_date,'prod_from':'it_department',
                                'prod_to':'employee','to_employee':rec.name.id,'reason':rec.reason,
                                'equipment':equipment.id})
            rec.is_reason = False
            rec.reason = ''
            
    def return_asset(self):
        for rec in self:
            equi_id = []
            for equip in rec.extra_equipment:
                equi_id.append(equip.id)
            for equip in [rec.laptop_equip.id,rec.mouse_equip.id,
                          rec.keyboard_equip.id,rec.headphone_equip.id,rec.screen_equip.id,rec.cpu_equip.id,rec.webcam_equip.id]:
                if equip is not False:
                    equi_id.append(equip)
            context = {'default_equipment_ids': [(6, 0, equi_id)],'active_id':self.id}
            return {
                'name': 'Equipment Return',
                'type': 'ir.actions.act_window',
                'res_model': 'equipment.return',
                'view_mode': 'form',
                'view_id': self.env.ref('it_department.view_equipment_return_form').id,
                'target': 'new',
                'context':context,
                }
        
    @api.onchange('laptop','keyboard','mouse','headphone','screen','cpu','webcam')
    def check_boolean(self):
        for rec in self:
            if rec.laptop_equip and not rec.laptop:
                raise ValidationError("Sorry You cant turn off laptop field")
            if rec.keyboard_equip and not rec.keyboard:
                raise ValidationError("Sorry You cant turn off keyboard  field")
            if rec.mouse_equip and not rec.mouse:
                raise ValidationError("Sorry You cant turn off Mouse this field")
            if rec.cpu_equip and not rec.cpu:
                raise ValidationError("Sorry You cant turn off CPU this field")
            if rec.headphone_equip and not rec.headphone:
                raise ValidationError("Sorry You cant turn off HEADPHONE this field")
            if rec.screen_equip and not rec.screen:
                raise ValidationError("Sorry You cant turn off SCREEN this field")
            if rec.webcam_equip and not rec.webcam:
                raise ValidationError("Sorry You cant turn off Webcam this field")

