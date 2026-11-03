from odoo import api, fields, models
from datetime import date

AVAILABLE_PRIORITIES = [
        ('0','Green (The resource completed work perfectly)'),
        ('1', 'Yellow (The resource completed work or missed few things and had some bugs)'),
        ('2', 'Red (The resource missed the deadline and also had lot of bugs)')]


class WeeklyReview(models.Model):
    _name = "weekly.review"
    _description = "BDE"

    parent_id = fields.Many2one('hr.employee', 'Employee', store=True, readonly=False)
    project_id = fields.Many2one('project.project', string='Project', required=True, help="Project")
    review = fields.One2many("weekly.review.field","test_id")
    points_count = fields.Float(string="Average points", compute="_compute_points_average")


    @api.depends('review.points')
    def _compute_points_average(self):
        self.points_count == 0
        val = []
        for operation in self.review:
            val.append(len(operation))
        for order in self:
            total = sum(operation.points for operation in order.review)
            if len(val) == 0:
                order.points_count = total / 1
            else:
                order.points_count = total / len(val)
    
class WeeklyReviewField(models.Model):
    _name = "weekly.review.field"

    
    test_id = fields.Many2one('weekly.review')
    description = fields.Text("Comment")
    priority = fields.Selection(AVAILABLE_PRIORITIES, "Appreciation")
    created_date = fields.Date(string="Created Date", default=date.today())
    points = fields.Integer(string="Points", compute="_compute_points", store=True)
    

 
    @api.depends('priority')
    def _compute_points(self):
        for record in self:
            if record.priority == '0':
                record.points = 10  
            elif record.priority == '1':
                record.points = 6
            elif record.priority == '2':
                record.points = 2