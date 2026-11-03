
from odoo import fields, models,api





  
class SurveyUserInputLine(models.Model):
    _inherit = 'survey.user_input.line'  
           
    client_answer = fields.Char(string='Survey Answer',compute='_compute_display_client_answer')
  

    @api.depends('answer_type')
    def _compute_display_client_answer(self):
        for rec in self:
            if rec.answer_type == 'char_box':
                rec.client_answer = rec.value_char_box
            elif rec.answer_type == 'text_box':
                rec.client_answer = rec.value_text_box
            elif rec.answer_type == 'suggestion':
                if rec.suggested_answer_id:
                    rec.client_answer = rec.suggested_answer_id.value
                else:
                    rec.client_answer = ''
            elif rec.answer_type == 'numerical_box':
               rec.client_answer = rec.value_numerical_box 
            elif rec.answer_type == 'date':
               rec.client_answer = rec.value_date 
            elif rec.answer_type == 'datetime':
               rec.client_answer = rec.value_datetime 
            else:
                rec.client_answer = ''


            
              
