from odoo import models, fields, api
import datetime


class EquipmentReturn(models.TransientModel):
    _name = 'equipment.return'

    name = fields.Char(string='Reason')
    equipment_ids = fields.Many2many('equipment.details',string='Equipments')

    def equipment_return(self):
        asset = self.env['asset.details'].browse(self.env.context['active_id'])
        records_to_remove = []
        for equipment in self.equipment_ids:
            if equipment.category.category == 'laptop':
                asset.laptop = False 
                asset.laptop_equip = False 
            elif equipment.category.category == 'mouse':
                asset.mouse = False
                asset.mouse_equip = False
            elif equipment.category.category == 'keyboard': 
                asset.keyboard = False
                asset.keyboard_equip = False
            elif equipment.category.category == 'screen':
                asset.screen = False
                asset.screen_equip = False
            elif equipment.category.category == 'headphone':
                asset.headphone = False
                asset.headphone_equip = False
            elif equipment.category.category == 'cpu':
                asset.cpu = False
                asset.cpu_equip = False
            elif equipment.category.category == 'others':
                records_to_remove.append(equipment.id)
            equipment.write({'state':'available','use_by':False})
            activity = self.env['equipment.activity'].create({'employee_id':asset.name.id,'name':equipment.category.id,
                                                          'assign_date':datetime.datetime.now(),'prod_from':'employee',
                                                          'prod_to':'it_department','from_employee':asset.name.id,'to_employee':self.env.user.employee_id.id,
                                                          'equipment':equipment.id,'reason':self.name,'responsible':self.env.user.employee_id.id})
        asset.write({'extra_equipment':[(3, record_id) for record_id in records_to_remove]})
        if asset.laptop_equip.id == False and asset.mouse_equip.id == False and asset.keyboard_equip.id == False and asset.screen_equip.id == False and asset.headphone_equip.id == False and asset.cpu_equip.id == False:    
            asset.write({'state':'returned'})

            
        
